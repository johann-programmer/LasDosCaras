import type { ViewPost } from '../components/ViewCard';

export const mapApiViewToPost = (view: any): ViewPost => {
  const sides = Array.isArray(view?.sides) ? view.sides : [];
  const sideA = sides.find((side: any) => side.type === 'SIDE') ?? {};
  const sideB =
    sides.find((side: any) => side.type === 'COUNTERPART') ?? {};

  const titleA = sideA.title ?? '';
  const titleB = sideB.title ?? '';
  const descriptionA = sideA.description ?? '';

  return {
    id: String(view.id),
    title:
      titleA && titleB
        ? `${titleA} vs ${titleB}`
        : titleA || titleB || 'Publicación',
    summary: descriptionA
      ? `${descriptionA.slice(0, 180)}${descriptionA.length > 180 ? '…' : ''}`
      : '',
    categoryName: view.category?.name ?? '',
    categoryId: String(view.categoryId ?? view.category?.id ?? ''),
    authorName: view.author?.name ?? 'Autor',
    authorId: String(view.authorId ?? view.author?.id ?? ''),
    createdAt: view.createdAt ?? new Date().toISOString(),
    likesSideA: sideA.likeCount ?? 0,
    likesSideB: sideB.likeCount ?? 0,
    dislikesSideA: sideA.dislikeCount ?? 0,
    dislikesSideB: sideB.dislikeCount ?? 0,
    isFavorite: Boolean(view.isFavorite),
  };
};
