import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Asset, UploadAssetParams } from '../types/Asset';
import { toast } from 'react-toastify';
import assetApi, { GetAssetsParams } from '../services/asset-service';

export const assetKeys = {
  all: ['assets'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
  list: (params: GetAssetsParams) => [...assetKeys.lists(), params] as const,
  details: () => [...assetKeys.all, 'detail'] as const,
  detail: (id: string) => [...assetKeys.details(), id] as const,
};

export const useAssets = (params: GetAssetsParams) => {
  return useQuery({
    queryKey: assetKeys.list(params),
    queryFn: () => assetApi.getAssets(params),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });
};

export const useAsset = (id: string) => {
  return useQuery({
    queryKey: assetKeys.detail(id),
    queryFn: () => assetApi.getAsset(id),
    enabled: !!id,
  });
};

export const useUploadAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UploadAssetParams) => assetApi.uploadAsset(params),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['assets', 'list'] });

      if (!variables.onProgress) {
        toast.success('Asset uploaded successfully!');
      }
    },
    onError: (error: any, variables, context) => {
      if (!variables.onProgress) {
        toast.error(error.response?.data?.message || 'Failed to upload asset');
      }
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Asset> }) =>
      assetApi.updateAsset(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assets', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['assets', 'detail', data.id],
      });
      toast.success('Asset updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update asset');
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation<void, any, string>({
    mutationFn: (id: string) => assetApi.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', 'list'] });
      toast.success('Asset deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete asset');
    },
  });
};

export const useDownloadAsset = () => {
  return useMutation({
    mutationFn: (id: string) => assetApi.downloadAsset(id),
    onSuccess: (_) => {
      toast.success('Asset download started!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to download asset');
    },
  });
};
