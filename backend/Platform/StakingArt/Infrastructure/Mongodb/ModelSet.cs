using System.Linq.Expressions;
using MongoDB.Driver;
using StakingArt.Models.Shared;

namespace StakingArt.Infrastructure.Mongodb;

public class ModelSet<TModel> where TModel : class
{
    public ModelSet(IMongoDatabase database, string collectionName)
    {

        Collection = database.GetCollection<TModel>(collectionName);
    }

    public FilterDefinitionBuilder<TModel> Filter => Builders<TModel>.Filter;
    public SortDefinitionBuilder<TModel> Sorter => Builders<TModel>.Sort;
    public UpdateDefinitionBuilder<TModel> Updater => Builders<TModel>.Update;

    public IMongoCollection<TModel> Collection { get; set; }
    

    public async Task<TModel> Create(TModel entity, CancellationToken cancellationToken = default)
    {
        if (entity is AuditableEntity e)
        {
            e.CreatedOn = DateTime.UtcNow;
            if (e.CreatedBy is null)
            {
                throw new InvalidOperationException($"Undefined created by for entity {nameof(TModel)}");
            }
        }

        if (entity is ITenantEntity tt && string.IsNullOrWhiteSpace(tt.UserId))
        {
            throw new InvalidOperationException($"Undefined user id for entity {nameof(TModel)}");
        }

        await Collection.InsertOneAsync(entity, cancellationToken: cancellationToken);
        return entity;
    }

    public async Task<TModel?> Find<TField>(Expression<Func<TModel, TField>> field, TField value, CancellationToken cancellationToken = default, bool first = false)
    {
        var filter = Builders<TModel>.Filter.Eq(field, value);

        var cursor = await Collection.FindAsync(filter, cancellationToken: cancellationToken);

        if (first) return await cursor.FirstOrDefaultAsync(cancellationToken);

        return await cursor.SingleOrDefaultAsync(cancellationToken: cancellationToken);
    }

    public async Task<(ICollection<TModel>, long total)> Search(
        FilterDefinition<TModel> filter,
        SortDefinition<TModel> sort, int page, int limit)
    {
        var query = Collection.Find(filter);
        var totalTask = query.CountDocumentsAsync();

        var skip = page > 1 ? page - 1 : 0;

        var resultTask = query.Sort(sort).Skip(skip * limit).Limit(limit).ToListAsync();

        await Task.WhenAll(totalTask, resultTask);

        return (resultTask.Result, totalTask.Result);
    }

    public async Task<ReplaceOneResult> Update(Expression<Func<TModel, bool>> filter, TModel entity,
        CancellationToken cancellationToken = default, bool isUpsert = false)
    {
        var updateResult = await Collection.ReplaceOneAsync(filter, entity, new ReplaceOptions { IsUpsert = isUpsert }, cancellationToken: cancellationToken);

        return updateResult;
    }

    public async Task<UpdateResult> Patch(Expression<Func<TModel, bool>> filter, UpdateDefinition<TModel> update, CancellationToken cancellationToken = default)
    {
        return await Collection.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);
    }

    public async Task<DeleteResult> Delete(Expression<Func<TModel, bool>> filter,
        bool isMany = false, string? tenantId = null, CancellationToken cancellationToken = default)
    {
        var filters = !string.IsNullOrEmpty(tenantId)
            ? Filter.And(filter, Filter.Eq(x => ((ITenantEntity)x!).UserId, tenantId))
            : filter;


        return isMany
            ? await Collection.DeleteManyAsync(filters, cancellationToken)
            : await Collection.DeleteOneAsync(filters, cancellationToken);


    }
}
