import { useQueryClient, UseQueryOptions } from "@tanstack/react-query";

export type Asset = {
  id: string;
  title: string;
  filename: string;
  imageUrl: string;
};

const keys = {
  search: 'SEARCH-ASSETS',
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

const data: Asset[] = [
  {
    filename: "filename",
    id: "1",
    imageUrl: "umageUrl",
    title: "title1"
  },
  {
    filename: "filename2",
    id: "2",
    imageUrl: "umageUrl2",
    title: "title2"
  }
]

export const useAssets = () => {
  const client = useQueryClient();

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
              // Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      return data;
    },
  });


  return {
    SearchQuery,
  }
}