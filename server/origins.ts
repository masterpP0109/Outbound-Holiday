export function allowedOrigins(): string[] {
  const origins = [process.env.APP_URL, ...(process.env.ALLOWED_ORIGINS ?? '').split(',')]
    .map(origin => origin?.trim()).filter(Boolean) as string[];
  if (process.env.NODE_ENV !== 'production') {
    for (const host of ['localhost', '127.0.0.1']) {
      for (const port of [3000, 3100, 5173]) origins.push(`http://${host}:${port}`);
    }
  }
  return origins;
}
