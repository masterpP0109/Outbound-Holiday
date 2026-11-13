export const enquiryTimeZone = 'Africa/Harare';

export function formatEnquiryReference(yymmdd: string, sequence: number): string {
  const seq = Math.max(1, Math.trunc(sequence));
  const suffix = seq < 1000 ? String(seq).padStart(3, '0') : String(seq);
  return `OH-${yymmdd}-${suffix}`;
}

export function enquiryDateLabel(submittedAt?: string, reference?: string) {
  // Support both historical OH-YYYYMMDD-* and sequential OH-YYMMDD-XXX references.
  const legacyDate = reference?.match(/^OH-(\d{4})(\d{2})(\d{2})-/);
  const shortDate = !legacyDate ? reference?.match(/^OH-(\d{2})(\d{2})(\d{2})-/) : null;
  const fallbackIso = legacyDate
    ? `${legacyDate[1]}-${legacyDate[2]}-${legacyDate[3]}T12:00:00Z`
    : shortDate
      ? `20${shortDate[1]}-${shortDate[2]}-${shortDate[3]}T12:00:00Z`
      : undefined;
  const value = submittedAt ?? fallbackIso;
  if (!value || Number.isNaN(Date.parse(value))) return undefined;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: enquiryTimeZone,
  }).format(new Date(value));
}
