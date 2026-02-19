import { apiClient } from './client';
import axios from 'axios';
import type { BaseResponse } from '../types/api.types';

export interface SlotStatus {
  slot_name: string;
  display_name?: string;
  status: 'SUBMITTED' | 'MISSING';
}

export interface SlotHint {
  file_id: string;
  slot_name: string;
  display_name?: string;
  confidence?: number;
  match_reason?: string;
}

export interface RunPreviewResponse {
  package_id: string;
  required_slot_status: SlotStatus[];
  slot_hint: SlotHint[];
  missing_required_slots: string[];
}

export interface SlotResult {
  slotName: string;
  status: 'VALID' | 'INVALID' | 'MISSING';
  message?: string;
  extractedData?: Record<string, unknown>;
}

// 슬롯별 extras 타입
export interface SlotExtras {
  analysis_message?: string;
  analysis_detail?: string;
  reason_descriptions?: string;
  success_points?: string;
  issue_points?: string;
  recognition_result?: string;
  ocr_status?: string;
  ocr_error?: string;
  vision_used?: string;
  person_count?: string;
  person_count_yolo?: string;
  person_count_llm?: string;
  person_count_gap?: string;
  [key: string]: unknown;
}

// 새 API 응답 타입
export interface SlotResultDetail {
  slot_name: string;
  display_name?: string;
  verdict: 'PASS' | 'WARN' | 'NEED_CLARIFY' | 'NEED_FIX';
  reasons: string[];
  file_ids: string[];
  file_names: string[];
  extras?: SlotExtras;
}

export interface ClarificationDetail {
  slot_name: string;
  message: string;
  file_ids: string[];
}

export interface CrossValidationResult {
  slots: string[];
  displayNames: string[];
  verdict: 'PASS' | 'WARN' | 'NEED_CLARIFY' | 'NEED_FIX';
  reasons: string[];
  extras?: Record<string, unknown>;
}

// 최상위 extras 타입
export interface AnalysisExtras {
  service_why?: string;
  recognition_result?: string;
  failure_reasons?: string;
  failure_explanation?: string;
  slot_summary?: string;
  [key: string]: unknown;
}

export interface AiAnalysisDetails {
  slot_results: SlotResultDetail[];
  clarifications: ClarificationDetail[];
  crossValidations?: CrossValidationResult[];
  extras?: AnalysisExtras;
}

export interface AiAnalysisResultResponse {
  id: number;  // 기존 resultId → id
  diagnosticId: number;
  domainCode: string;
  packageId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  verdict: 'PASS' | 'WARN' | 'NEED_CLARIFY' | 'NEED_FIX';
  whySummary: string;
  details: AiAnalysisDetails;  // 기존 resultJson → details
  analyzedAt: string;
}

export interface AiResultDetailResponse extends AiAnalysisResultResponse {
  slotResults: SlotResult[];
  clarifications: Array<{ targetSlot: string; code: string; message: string }>;
}

const toAiAnalysisResult = (item: Record<string, unknown>): AiAnalysisResultResponse => {
  const details = (item.details as AiAnalysisDetails | undefined)
    ?? (item.resultJson as AiAnalysisDetails | undefined)
    ?? {
      slot_results: [],
      clarifications: [],
    };

  return {
    id: Number(item.id ?? item.resultId ?? 0),
    diagnosticId: Number(item.diagnosticId ?? item.diagnostic_id ?? 0),
    domainCode: String(item.domainCode ?? item.domain_code ?? ''),
    packageId: String(item.packageId ?? item.package_id ?? ''),
    riskLevel: String(item.riskLevel ?? item.risk_level ?? 'LOW') as AiAnalysisResultResponse['riskLevel'],
    verdict: String(item.verdict ?? 'NEED_CLARIFY') as AiAnalysisResultResponse['verdict'],
    whySummary: String(item.whySummary ?? item.why ?? ''),
    details,
    analyzedAt: String(item.analyzedAt ?? item.analyzed_at ?? item.createdAt ?? item.created_at ?? ''),
  };
};

export const previewAiRun = async (
  diagnosticId: number,
  fileIds: number[],
  removedFileIds?: string[],
  packageId?: string
): Promise<RunPreviewResponse> => {
  const response = await apiClient.post<BaseResponse<RunPreviewResponse>>(
    `/v1/ai/run/diagnostics/${diagnosticId}/preview`,
    {
      fileIds,
      ...(removedFileIds?.length ? { removedFileIds } : {}),
      ...(packageId ? { packageId } : {}),
    },
    // Large preview payloads (many files) can take >35s in ACA.
    { timeout: 120000 }
  );
  return response.data.data;
};

export const submitAiRun = async (
  diagnosticId: number,
  slotHints: SlotHint[]
): Promise<void> => {
  await apiClient.post(`/v1/ai/run/diagnostics/${diagnosticId}/submit`, { slotHints });
};

export const getAiResult = async (diagnosticId: number): Promise<AiAnalysisResultResponse> => {
  const response = await apiClient.get<BaseResponse<AiAnalysisResultResponse>>(
    `/v1/ai/run/diagnostics/${diagnosticId}/result`
  );
  return toAiAnalysisResult(response.data.data as unknown as Record<string, unknown>);
};

export const getAiResultDetail = async (diagnosticId: number): Promise<AiResultDetailResponse | null> => {
  let response;
  try {
    response = await apiClient.get<BaseResponse<AiResultDetailResponse>>(
      `/v1/ai/run/diagnostics/${diagnosticId}/result/detail`
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const code = (error.response?.data as { code?: string } | undefined)?.code;
      if (status === 404 && (!code || code === 'AI003')) {
        return null;
      }
    }
    throw error;
  }

  const data = response.data.data as unknown as Record<string, unknown>;

  // Backend /result/detail returns flattened fields (slotResults, crossValidations...).
  // Normalize to frontend shape with details.slot_results.
  if (!('details' in data)) {
    const slotResults = (data.slotResults as Array<Record<string, unknown>> | undefined) ?? [];
    const clarifications = (data.clarifications as Array<Record<string, unknown>> | undefined) ?? [];
    const crossValidations = (data.crossValidations as Array<Record<string, unknown>> | undefined) ?? [];
    const extras = (data.extras as Record<string, unknown> | undefined) ?? {};

    return {
      ...(data as unknown as AiResultDetailResponse),
      details: {
        slot_results: slotResults.map((item) => ({
          slot_name: String(item.slotName ?? item.slot_name ?? ''),
          display_name: (item.displayName ?? item.display_name) as string | undefined,
          verdict: String(item.verdict ?? 'NEED_CLARIFY') as SlotResultDetail['verdict'],
          reasons: ((item.reasons as string[] | undefined) ?? []).map(String),
          file_ids: ((item.fileIds as string[] | undefined) ?? (item.file_ids as string[] | undefined) ?? []).map(String),
          file_names: ((item.fileNames as string[] | undefined) ?? (item.file_names as string[] | undefined) ?? []).map(String),
          extras: (item.extras as SlotExtras | undefined) ?? {},
        })),
        clarifications: clarifications.map((item) => ({
          slot_name: String(item.slot_name ?? item.targetSlot ?? ''),
          message: String(item.message ?? ''),
          file_ids: ((item.file_ids as string[] | undefined) ?? (item.fileIds as string[] | undefined) ?? []).map(String),
        })),
        crossValidations: crossValidations.map((item) => ({
          slots: ((item.slots as string[] | undefined) ?? []).map(String),
          displayNames: ((item.displayNames as string[] | undefined) ?? []).map(String),
          verdict: String(item.verdict ?? 'NEED_CLARIFY') as CrossValidationResult['verdict'],
          reasons: ((item.reasons as string[] | undefined) ?? []).map(String),
          extras: (item.extras as Record<string, unknown> | undefined) ?? {},
        })),
        extras: extras as AnalysisExtras,
      },
    };
  }

  return data as AiResultDetailResponse;
};

export const getAiHistory = async (diagnosticId: number): Promise<AiAnalysisResultResponse[]> => {
  const response = await apiClient.get<BaseResponse<AiAnalysisResultResponse[]>>(
    `/v1/ai/run/diagnostics/${diagnosticId}/history`
  );
  const data = response.data.data as unknown as Array<Record<string, unknown>>;
  return (data ?? []).map(toAiAnalysisResult);
};
