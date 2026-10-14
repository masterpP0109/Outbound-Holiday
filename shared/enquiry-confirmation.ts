export const enquiryTimeZone = 'Africa/Harare';

export function enquiryDateLabel(submittedAt?: string, reference?: string) {
  // Older notifications did not store the timestamp in their payload.
  const legacyDate = reference?.match(/^OH-(\d{4})(\d{2})(\d{2})-/);
  const value = submittedAt ?? (legacyDate ? `${legacyDate[1]}-${legacyDate[2]}-${legacyDate[3]}T12:00:00Z` : undefined);
  if (!value || Number.isNaN(Date.parse(value))) return undefined;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: enquiryTimeZone,
  }).format(new Date(value));
}
