// Public object URLs only; credentials remain server-side.
export function replaceImageUrls<T>(value: T, mapping: Record<string, string>): T {
  if (typeof value === 'string') return (mapping[value] ?? value) as T;
  if (Array.isArray(value)) return value.map(item => replaceImageUrls(item, mapping)) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceImageUrls(item, mapping)])) as T;
  return value;
}
