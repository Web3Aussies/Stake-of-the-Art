import { useMutation, UseQueryOptions, UseMutationOptions, QueryClient, useQueryClient } from '@tanstack/react-query';
import { ISuccessResult } from '@worldcoin/idkit';

const keys = {
    search: 'SEARCH-ASSETS',
};

export type Asset = {
    id: string;
    title: string;
    filename: string;
    status: 'Ready' | 'Sign' | 'Pending' | 'Deactivated';
    imageUrl: string;
    downloads: number;
};

export type SearchResult<T> = {
    results: Array<T>;
    totalRecords: number;
    page: number;
    limit: number;
};

type UploadFile = { file: globalThis.File };

type UploadFileResponse = {
    assetId: string;
    uploadUrl: string;
};

export function useAssets({ token }: { token?: string }) {
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
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await res.json();
            return data;
        },
    });

    const useUploadImage = useMutation({
        mutationFn: async ({ file }: UploadFile) => {
            //  get the upload url for the image
            const res = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/admin/assets`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filename: file.name, contentType: file.type }),
            });

            if (!res.ok) throw Error(`${res.status} - ${res.statusText}`);

            var data: UploadFileResponse = await res.json();
            const headers: any = {};

            if (file?.type) {
                headers['Content-Type'] = file!.type;
            }

            // upload image to s3
            const uploadRes = await fetch(data.uploadUrl, {
                method: 'PUT',
                body: file,
                headers,
            });

            if (!uploadRes.ok) throw Error(`${res.status} - ${res.statusText}`);

            return data.assetId;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: [keys.search] });
        },
    });

    const RefreshSearch = () => {
        client.refetchQueries({ queryKey: [keys.search] });
    };

    const SignAsset = useMutation({
        mutationFn: async ({ id, ...other }: ISuccessResult & { id: string }) => {
            const res = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/admin/assets/${id}/sign`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...other }),
            });

            if (!res.ok) throw Error(`${res.status} - ${res.statusText}`);
            return true;
        },
    });

    return {
        SearchQuery,
        useUploadImage,
        RefreshSearch,
        SignAsset,
    };
}
