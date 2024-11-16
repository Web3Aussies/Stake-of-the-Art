import { UseQueryOptions } from "@tanstack/react-query";

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
};

export type SearchResult<T> = {
  results: Array<T>;
  totalRecords: number;
  page: number;
  limit: number;
};

export type Category = {
  name?: string;
  type?: "Color" | "Category";
}

export type LikeRequest = {
  AssetId: number;
  Width: number;
  Height: number;
}

export function useAssets({ token }: { token?: string }) {
  const SearchQuery = ({
    height,
    width,
  }: {
    height?: number;
    width?: number;
  }): UseQueryOptions<SearchResult<Asset>> => ({
    queryKey: [keys.search, height ?? 400, width ?? 400],
    queryFn: async ({ queryKey }) => {
      const [_, height, width] = queryKey;
      const res = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/admin/assets?height=${height}&width=${width}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      return data;
    },
  });

  const GetCategoriesQuery = (): UseQueryOptions<SearchResult<Asset>> => ({
    queryKey: [keys.search],
    queryFn: async ({ queryKey }) => {
      const [_] = queryKey;
      const res = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/app/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
      const res = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/app/assets/${assetId}/like`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ AssetId: assetId, width: width, Height: height }),
        }
      );
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
      const res = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/app/assets/${assetId}/unlike`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ AssetId: assetId, width: width, Height: height }),
        }
      );
      const data = await res.json();
      return data;
    },
  });

  return {
    SearchQuery,
    GetCategoriesQuery,
    LikedQuery,
    UnLikedQuery,
  };
}