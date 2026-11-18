import { DEFAULT_IMAGE, DEFAULT_VIDEO } from '../constants/assets';

/**
 * Преобразует URL медиафайлов из MinIO S3 (порт 9000)
 * в относительный путь через прокси React (Vite dev-сервер на порту 5173),
 * обеспечивая отсутствие CORS-ограничений и единый сетевой маршрут.
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url || url.trim() === '') {
    return DEFAULT_IMAGE;
  }
  // Если ссылка ведет напрямую на MinIO S3 (порт 9000), заменяем хост на проксируемый путь
  if (url.startsWith('http://127.0.0.1:9000/') || url.startsWith('http://localhost:9000/')) {
    return url.replace(/^http:\/\/(127\.0\.0\.1|localhost):9000/, '');
  }
  return url;
}

export function resolveVideoUrl(url?: string | null): string {
  if (!url || url.trim() === '') {
    return DEFAULT_VIDEO;
  }
  if (url.startsWith('http://127.0.0.1:9000/') || url.startsWith('http://localhost:9000/')) {
    return url.replace(/^http:\/\/(127\.0\.0\.1|localhost):9000/, '');
  }
  return url;
}
