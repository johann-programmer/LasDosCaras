import { mapApiViewToPost } from '../utils/mapView';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface AuthorInfo {
  id: string;
  name: string;
  joinedAt: string;
  totalPosts: number;
}

export interface AuthorPageData {
  author: AuthorInfo;
  posts: ReturnType<typeof mapApiViewToPost>[];
  totalPages: number;
}

export const getAuthorDetailData = async (
  id: string,
  page: number = 1,
  limit: number = 6
): Promise<AuthorPageData> => {
  const [authorRes, viewsRes] = await Promise.all([
    fetch(`${API_BASE}/authors/${id}`),
    fetch(
      `${API_BASE}/views?autorId=${encodeURIComponent(id)}&page=${page}&limit=${limit}&sort=recent`
    ),
  ]);

  if (!authorRes.ok) {
    const body = await authorRes.json().catch(() => null);
    throw new Error(body?.error || 'No se pudo obtener la información del autor.');
  }

  const authorPayload = await authorRes.json();
  const author = authorPayload?.author ?? authorPayload;

  if (!author?.id) {
    throw new Error('La API no devolvió el autor.');
  }

  const viewsPayload = viewsRes.ok
    ? await viewsRes.json()
    : { views: [], total: 0, limit };

  const views = Array.isArray(viewsPayload?.views) ? viewsPayload.views : [];
  const total = Number(viewsPayload?.total ?? views.length);
  const viewLimit = Number(viewsPayload?.limit ?? limit);

  return {
    author: {
      id: String(author.id),
      name: author.name ?? 'Autor',
      joinedAt: author.createdAt ?? new Date().toISOString(),
      totalPosts: Number(author.publishedViewsCount ?? total ?? 0),
    },
    posts: views.map(mapApiViewToPost),
    totalPages: Math.max(1, Math.ceil(total / viewLimit) || 1),
  };
};