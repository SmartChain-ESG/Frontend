const SLOT_LABELS: Record<string, string> = {
  'esg.energy.electricity.usage': '전기 사용량',
  'esg.energy.gas.usage': '가스 사용량',
  'esg.energy.water.usage': '수도 사용량',
  'esg.hazmat.inventory': '유해물질 목록',
  'esg.hazmat.msds': '물질안전보건자료(MSDS)',
  'esg.ethics.poster.image': '윤리경영 포스터/이미지',
  'esg.ethics.code': '윤리강령/행동강령',
  'esg.ethics.pledge': '윤리 서약서',
  'esg.ethics.distribution.log': '윤리강령 배포 로그',
  'safety.tbm.attendance': 'TBM 참석자 명단',
  'safety.tbm.photo': 'TBM 현장사진',
  'safety.tbm.checklist': 'TBM 체크리스트',
  'safety.education.status': '안전교육 이수 현황',
  'safety.fire.inspection': '소방 점검 결과',
  'safety.risk.assessment': '위험성 평가',
  'safety.management.system': '안전보건 관리체계',
  'safety.site.photos': '현장 사진',
  'safety.education.attendance': '교육 출석부',
  'safety.education.photo': '교육 사진',
  'safety.tbm': 'TBM(작업 전 안전회의)',
  'safety.other': '기타 문서',
  'compliance.contract': '하도급 계약서',
  'compliance.contract.sample': '표준하도급계약서 샘플',
  'compliance.education.privacy': '개인정보보호 교육',
  'compliance.education.plan': '교육 계획',
  'compliance.education.attendance': '교육 출석부',
  'compliance.education.photo': '교육 사진',
  'compliance.fair.trade': '공정거래 준수',
  'compliance.ethics.report': '윤리 신고 현황',
  'compliance.other': '기타 문서',
  'compliance.special_terms': '특약/부속합의서',
  'compliance.quote': '견적서/산출내역',
};

const SLOT_KEY_IN_TEXT_RE =
  /[a-z]+(?:\.[a-z0-9_]+){2,}(?:\s*(?:__x__|↔|<->|×)\s*[a-z]+(?:\.[a-z0-9_]+){2,})*/gi;

export const getSlotDisplayName = (slotName?: string, fallback?: string): string => {
  const pick = fallback && fallback.trim().length > 0 ? fallback : slotName;
  if (!pick) return '-';

  const normalized = pick.trim();
  const lower = normalized.toLowerCase();

  const direct = SLOT_LABELS[normalized] ?? SLOT_LABELS[lower];
  if (direct) return direct;

  // Cross-validation pairs can arrive as one string:
  // "__x__", "↔", "<->", or "×" separated slot keys.
  const pairParts = normalized
    .split(/\s*(?:__x__|↔|<->|×)\s*/g)
    .map((part) => part.trim())
    .filter(Boolean);
  if (pairParts.length > 1) {
    return pairParts
      .map((part) => SLOT_LABELS[part.toLowerCase()] ?? part)
      .join(' × ');
  }

  // Raw slot key like esg.energy.electricity.usage -> map by key if possible
  if (normalized.includes('.')) {
    return SLOT_LABELS[normalized.toLowerCase()] ?? normalized;
  }

  return normalized;
};

export const humanizeSlotText = (text?: string): string => {
  if (!text) return '';
  return text.replace(SLOT_KEY_IN_TEXT_RE, (raw) => getSlotDisplayName(raw, raw));
};
