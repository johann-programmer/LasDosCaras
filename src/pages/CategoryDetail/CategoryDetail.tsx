// src/pages/CategoryDetail/CategoryDetail.tsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { ViewCard, type ViewPost } from '../../components/ViewCard';
import { ArrowLeft, Layers, RefreshCw } from 'lucide-react';

interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  totalViews: number;
}

interface CategoryResponse {
  category: CategoryInfo;
  posts: ViewPost[];
  totalPages: number;
}

export const CategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<number>(1);

  // Adaptado a la firma de tu useFetch (función asíncrona + arreglo de dependencias)
  const { data, loading, error, refetch } = useFetch<CategoryResponse>(
    async () => {
      const response = await fetch(`/api/categories/${id}?page=${page}&limit=6`);
      if (!response.ok) {
        throw new Error('No se pudo obtener la categoría.');
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
        <p className="text-rose-400">{error || 'No se pudo cargar la categoría solicitada.'}</p>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Volver al Tablero Principal
        </Link>
      </div>
    );
  }

  const { category, posts, totalPages } = data;

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Botón Volver */}
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al Tablero
        </Link>
        <button
          onClick={() => refetch()}
          className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          title="Recargar categoría"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Encabezado de la Categoría */}
      <header className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/60 border border-blue-800/40 text-blue-400 rounded-full text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>Categoría Temática</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white">{category.name}</h1>
        <p className="text-zinc-400 text-sm md:text-base">{category.description}</p>
        <p className="text-xs text-zinc-500 pt-2">{category.totalViews} publicaciones en debate</p>
      </header>

      {/* Grilla de Publicaciones */}
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl">
          <p className="text-zinc-400 text-sm">No hay publicaciones disponibles en esta categoría.</p>
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