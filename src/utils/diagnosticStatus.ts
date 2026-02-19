import type { DiagnosticStatus, DomainCode } from '../types/api.types';
import { DIAGNOSTIC_STATUS_LABELS } from '../types/api.types';

const SAFETY_OR_COMPLIANCE = new Set<DomainCode>(['SAFETY', 'COMPLIANCE']);

export function isSafetyOrComplianceDomain(domainCode?: string | null): boolean {
  return domainCode === 'SAFETY' || domainCode === 'COMPLIANCE';
}

export function getDiagnosticStatusLabel(
  status: DiagnosticStatus,
  domainCode?: string | null,
): string {
  if (SAFETY_OR_COMPLIANCE.has(domainCode as DomainCode)) {
    if (status === 'APPROVED') return '심사중';
    if (status === 'COMPLETED') return '승인됨';
  }

  if (domainCode === 'ESG' && status === 'SUBMITTED') {
    return '심사중';
  }
  if (domainCode === 'ESG' && status === 'REVIEWING') {
    return '원청 심사중';
  }

  return DIAGNOSTIC_STATUS_LABELS[status] || status;
}

export function getDiagnosticStatusVisualStatus(
  status: DiagnosticStatus,
  domainCode?: string | null,
): DiagnosticStatus {
  if (SAFETY_OR_COMPLIANCE.has(domainCode as DomainCode)) {
    if (status === 'APPROVED') return 'REVIEWING';
    if (status === 'COMPLETED') return 'APPROVED';
  }

  if (domainCode === 'ESG' && status === 'SUBMITTED') {
    return 'REVIEWING';
  }

  return status;
}
