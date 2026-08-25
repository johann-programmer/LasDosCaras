// src/pages/AuthorDetail/AuthorDetail.tsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { ViewCard, type ViewPost } from '../../components/ViewCard';
import { ArrowLeft, User, Calendar, FileText, RefreshCw } from 'lucide-react';

interface AuthorInfo {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  joinedAt: string;
  totalPosts: number;
}

interface AuthorResponse {
  author: AuthorInfo;
  posts: ViewPost[];
  totalPages: number;
}

export const AuthorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<number>(1);

  // Petición ajustada a la firma de tu hook useFetch
  const { data, loading, error, refetch } = useFetch<AuthorResponse>(
    async () => {
      const response = await fetch(`/api/authors/${id}?page=${page}&limit=6`);
      if (!response.ok) {
        throw new Error('No se pudo obtener la información del autor.');
      }
      return response.json();
    },
    [id, page]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 p-6 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 p-8 max-w-4xl mx-auto text-center space-y-4">
        <p className="text-rose-400">{error || 'No se pudo cargar el perfil del autor.'}</p>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Volver al Tablero Principal
        </Link>
      </div>
    );
  }

  const { author, posts, totalPages } = data;

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Botón Volver y Recargar */}
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al Tablero
        </Link>
        <button
          onClick={() => refetch()}
          className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          title="Recargar perfil"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Encabezado del Perfil */}
      <header className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {author.avatarUrl ? (
            <img
              src={author.avatarUrl}
              alt={author.name}
              className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-zinc-300">
              <User className="w-8 h-8" />
            </div>
          )}

          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-white">{author.name}</h1>
            {author.bio && <p className="text-zinc-400 text-sm max-w-2xl">{author.bio}</p>}
            
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Miembro desde {new Date(author.joinedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> {author.totalPosts} publicaciones
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Título de la Sección de Publicaciones */}
      <div className="border-b border-zinc-800 pb-3">
        <h2 className="text-lg font-bold text-white">Publicaciones de {author.name}</h2>
      </div>

      {/* Grilla de Publicaciones */}
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl">
          <p className="text-zinc-400 text-sm">Este autor aún no ha publicado debates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <ViewCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-6 border-t border-zinc-800">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
          >
            Anterior
          </button>
          <span className="text-xs text-zinc-500 font-medium">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};