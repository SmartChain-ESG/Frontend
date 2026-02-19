import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import * as aiRunApi from '../api/aiRun';
import { QUERY_KEYS } from '../constants/queryKeys';
import { handleApiError } from '../utils/errorHandler';
import type { ErrorResponse } from '../types/api.types';

const pickLatestById = <T extends { id: number }>(history: T[]): T | null => {
  if (!history || history.length === 0) return null;
  return history.reduce((latest, current) => (current.id > latest.id ? current : latest));
};

export const useAiPreview = () => {
  return useMutation({
    mutationFn: ({ diagnosticId, fileIds, removedFileIds, packageId }: { diagnosticId: number; fileIds: number[]; removedFileIds?: string[]; packageId?: string }) =>
      aiRunApi.previewAiRun(diagnosticId, fileIds, removedFileIds, packageId),
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useSubmitAiRun = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ diagnosticId, slotHints }: { diagnosticId: number; slotHints: aiRunApi.SlotHint[] }) =>
      aiRunApi.submitAiRun(diagnosticId, slotHints),
    onSuccess: (_, { diagnosticId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AI_RUN.RESULT(diagnosticId) });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useAiResult = (diagnosticId: number, polling = false) => {
  return useQuery({
    queryKey: QUERY_KEYS.AI_RUN.RESULT(diagnosticId),
    queryFn: async () => {
      const detail = await aiRunApi.getAiResultDetail(diagnosticId);
      if (detail) {
        return detail as unknown as aiRunApi.AiAnalysisResultResponse;
      }
      const history = await aiRunApi.getAiHistory(diagnosticId);
      return pickLatestById(history);
    },
    enabled: diagnosticId > 0,
    refetchInterval: () => {
      if (!polling) return false;
      return 5000;
    },
    retry: false,
  });
};

export const useAiResultDetail = (diagnosticId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.AI_RUN.RESULT_DETAIL(diagnosticId),
    queryFn: async () => {
      const history = await aiRunApi.getAiHistory(diagnosticId);
      if (!history || history.length === 0) return null;
      const detail = await aiRunApi.getAiResultDetail(diagnosticId);
      // /result/detail may lag behind /history in some deployments.
      // Fall back to latest history so the UI can still render AI outcome.
      return detail ?? (pickLatestById(history) as unknown as aiRunApi.AiResultDetailResponse);
    },
    enabled: diagnosticId > 0,
    refetchInterval: (query) => {
      if (diagnosticId <= 0) return false;
      return query.state.data ? false : 5000;
    },
    retry: false,
  });
};

export const useAiHistory = (diagnosticId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.AI_RUN.HISTORY(diagnosticId),
    queryFn: () => aiRunApi.getAiHistory(diagnosticId),
    enabled: diagnosticId > 0,
  });
};
