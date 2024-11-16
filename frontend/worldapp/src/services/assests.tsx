import { useMutation, UseQueryOptions } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';

export type Asset = {
    id: string;
    title: string;
    filename: string;
    imageUrl: string;
};

const keys = {
    search: 'SEARCH-ASSETS',
    like: 'LIKE',
    unlike: 'UNLIKE',
    get: 'GET-ASSET',
};

export type SearchResult<T> = {
    results: Array<T>;
    totalRecords: number;
    page: number;
    limit: number;
};

export type Category = {
    name?: string;
    type?: 'Color' | 'Category';
};

export type LikeRequest = {
    AssetId: number;
    Width: number;
    Height: number;
};

export function useAssets() {
    const { token } = useRouteContext({ strict: false });

    const SearchQuery = ({
        keyword,
        categories,
        height,
        width,
    }: {
        keyword?: string;
        categories?: string;
        height?: number;
        width?: number;
    }): UseQueryOptions<SearchResult<Asset>> => ({
        queryKey: [keys.search, keyword, categories,  height ?? 400, width ?? 400],
        queryFn: async ({ queryKey }) => {
            const [_, keyword, categories, height, width] = queryKey;
            console.log('getting data...', queryKey);

            const res = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/app/assets?height=${height}&width=${width}&keyword=${keyword}&categories=${categories}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            return data;
        },
    });

    const GetCategoriesQuery = (): UseQueryOptions<SearchResult<Category>> => ({
        queryKey: [keys.search],
        queryFn: async ({ queryKey }) => {
            const [_] = queryKey;
            const res = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/app/categories`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            return data;
        },
    });

    const LikedQuery = ({
        assetId,
        height,
        width,
    }: {
        assetId: string;
        height?: number;
        width?: number;
    }): UseQueryOptions<SearchResult<Asset>> => ({
        queryKey: [keys.search, assetId, height ?? 400, width ?? 400],
        queryFn: async ({ queryKey }) => {
            const [_, assetId, height, width] = queryKey;
            const res = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/app/assets/${assetId}/like`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ AssetId: assetId, width: width, Height: height }),
            });
            const data = await res.json();
            return data;
        },
    });

    const UnLikedQuery = ({
        assetId,
        height,
        width,
    }: {
        assetId: string;
        height?: number;
        width?: number;
    }): UseQueryOptions<SearchResult<Asset>> => ({
        queryKey: [keys.search, assetId, height ?? 400, width ?? 400],
        queryFn: async ({ queryKey }) => {
            const [_, assetId, height, width] = queryKey;
            const res = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/app/assets/${assetId}/unlike`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ AssetId: assetId, width: width, Height: height }),
            });
            const data = await res.json();
            return data;
        },
    });

    const GetAsset = ({
        id,
        height,
        width,
    }: {
        id: string;
        height?: number;
        width?: number;
    }): UseQueryOptions<Asset> => ({
        queryKey: [keys.get, id, height ?? 400, width ?? 400],
        queryFn: async ({ queryKey }) => {
            const [_, id, height, width] = queryKey;
            const res = await fetch(
                `${import.meta.env.VITE_API_ENDPOINT}/app/assets/${id}?height=${height}&width=${width}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await res.json();
            return data;
        },
    });

    const getDownloadLink = async (id: string) => {
        const res = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/app/assets/${id}/download`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data: string = await res.text();
        return data;
    };

    return {
        SearchQuery,
        GetCategoriesQuery,
        LikedQuery,
        UnLikedQuery,
        GetAsset,
        getDownloadLink
    };
}
