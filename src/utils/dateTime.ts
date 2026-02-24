export const KST_TIME_ZONE = 'Asia/Seoul';
const KST_OFFSET = '+09:00';
const HAS_TIMEZONE_REGEX = /([zZ]|[+\-]\d{2}:?\d{2})$/;
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_WITHOUT_TIMEZONE_REGEX = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}(?::\d{2}(?:\.\d{1,6})?)?)$/;

export function parseServerDate(dateStr?: string | null): Date {
  if (!dateStr) return new Date(NaN);
  const input = dateStr.trim();
  if (!input) return new Date(NaN);

  if (DATE_ONLY_REGEX.test(input)) {
    return new Date(`${input}T00:00:00${KST_OFFSET}`);
  }

  if (!HAS_TIMEZONE_REGEX.test(input)) {
    const match = input.match(DATETIME_WITHOUT_TIMEZONE_REGEX);
    if (match) {
      // Backend LocalDateTime is timezone-naive; treat it as KST wall-clock time.
      return new Date(`${match[1]}T${match[2]}${KST_OFFSET}`);
    }
  }

  return new Date(input);
}

export function formatKoreanDate(
  dateStr?: string | null,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' },
): string {
  const date = parseServerDate(dateStr);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleDateString('ko-KR', { ...options, timeZone: KST_TIME_ZONE });
}

export function formatKoreanDateTime(
  dateStr?: string | null,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
): string {
  const date = parseServerDate(dateStr);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleString('ko-KR', { ...options, timeZone: KST_TIME_ZONE });
}

function toKstDateParts(date: Date): { year: string; month: string; day: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';

  return { year, month, day };
}

export function formatKoreanYmd(dateStr?: string | null, separator = '/'): string {
  const date = parseServerDate(dateStr);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  const { year, month, day } = toKstDateParts(date);
  if (!year || !month || !day) {
    return '-';
  }
  return [year, month, day].join(separator);
}

export function formatNowKoreanYmd(separator = '-'): string {
  const { year, month, day } = toKstDateParts(new Date());
  return [year, month, day].join(separator);
}

export function formatKoreanRelativeTime(dateStr?: string | null): string {
  const date = parseServerDate(dateStr);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  const diffMs = new Date().getTime() - date.getTime();
  if (diffMs < 0) {
    return formatKoreanDate(dateStr, { month: 'short', day: 'numeric' });
  }
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return formatKoreanDate(dateStr, { month: 'short', day: 'numeric' });
}
