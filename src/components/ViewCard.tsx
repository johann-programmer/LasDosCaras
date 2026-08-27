// src/components/ViewCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ThumbsUp, ThumbsDown, Calendar, User } from 'lucide-react';

export interface ViewPost {
  id: string;
  title: string;
  summary: string;
  categoryName: string;
  categoryId: string;
  authorName: string;
  authorId: string;
  createdAt: string;
  likesSideA: number;
  likesSideB: number;
  dislikesSideA: number;
  dislikesSideB: number;
  isFavorite?: boolean;
}

interface ViewCardProps {
  post: ViewPost;
  onToggleFavorite?: (id: string) => void;
  onShare?: (id: string) => void;
  isAuthenticated?: boolean;
  highlightTerm?: string;
}

const HighlightedText: React.FC<{ text: string; term?: string }> = ({
  text,
  term,
}) => {
  const cleanTerm = term?.trim();

  if (!cleanTerm) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${cleanTerm.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === cleanTerm.toLowerCase() ? (
          <mark key={`${part}-${index}`}>{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
};

export const ViewCard: React.FC<ViewCardProps> = ({ post, onToggleFavorite, isAuthenticated = false, highlightTerm }) => {
  return (
    <article className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-200 shadow-lg flex flex-col justify-between">
      <div className="p-5">
        {/* Encabezado: Categoría y Botón Favorito */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Link
            to={`/categories/${post.categoryId}`}
            className="text-xs font-semibold px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
          >
            {post.categoryName}
          </Link>
          {isAuthenticated && (
          <button
            onClick={() => onToggleFavorite?.(post.id)}
            className={`p-1.5 rounded-lg border transition-colors ${
              post.isFavorite
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
            title={post.isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          >
            <Heart className={`w-4 h-4 ${post.isFavorite ? 'fill-rose-500' : ''}`} />
          </button>
          )}
        </div>

        {/* Título y Resumen */}
        <Link to={`/views/${post.id}`}>
          <h2 className="text-lg font-bold text-white mb-2 line-clamp-2 hover:text-blue-400 transition-colors">
            <HighlightedText text={post.title} term={highlightTerm} />
          </h2>
        </Link>
        <p className="text-zinc-400 text-sm line-clamp-3 mb-4 leading-relaxed">
          <HighlightedText text={post.summary} term={highlightTerm} />
        </p>
      </div>

      {/* Pie de tarjeta: Lado A vs Lado B y Meta Autor */}
      <div className="border-t border-zinc-800/80 bg-zinc-950/50 p-4 space-y-3">
        {/* Balance Lado A vs Lado B */}
        <div className="grid grid-cols-2 gap-2 text-xs font-medium">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/30 text-emerald-400">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" /> Lado A
            </span>
            <span className="font-bold">{post.likesSideA}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-indigo-950/30 border border-indigo-800/30 text-indigo-400">
            <span className="flex items-center gap-1">
              <ThumbsDown className="w-3.5 h-3.5" /> Lado B
            </span>
            <span className="font-bold">{post.likesSideB}</span>
          </div>
        </div>

        {/* Autor y Fecha */}
        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
          <Link
            to={`/authors/${post.authorId}`}
            className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>{post.authorName}</span>
          </Link>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </article>
  );
};