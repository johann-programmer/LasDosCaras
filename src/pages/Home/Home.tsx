// src/pages/Home.tsx
import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { ViewCard, type ViewPost } from '../../components/ViewCard';
import { Filter, RefreshCw, LayoutGrid } from 'lucide-react';

export const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState<number>(1);

  // Petición de publicaciones con useFetch
// Petición de publicaciones adaptada a tu hook useFetch
  const endpoint =
    selectedCategory === 'all'
      ? `/api/views?page=${page}&limit=6`
      : `/api/views?category=${selectedCategory}&page=${page}&limit=6`;

  const { data, loading, error, refetch } = useFetch<{
    posts: ViewPost[];
    totalPages: number;
  }>(
    async () => {
      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error('Error al cargar las publicaciones.');
      }
      return res.json();
    },
    [endpoint] // Dependencia para que se vuelva a ejecutar cuando cambie la categoría o la página
  );
  
  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header del Tablero */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <LayoutGrid className="w-8 h-8 text-blue-500" />
            Tablero Principal
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Explora opiniones, debates y contraposturas en tiempo real.
          </p>
        </div>

        {/* Filtro rápido de categorías */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl">
          <Filter className="w-4 h-4 text-zinc-400 ml-2" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="bg-transparent text-sm text-zinc-200 outline-none pr-4 cursor-pointer"
          >
            <option value="all" className="bg-zinc-900">Todas las categorías</option>
            <option value="tech" className="bg-zinc-900">Tecnología</option>
            <option value="politics" className="bg-zinc-900">Política</option>
            <option value="sports" className="bg-zinc-900">Deportes</option>
          </select>
        </div>
      </header>

      {/* Estados de Carga y Error */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-zinc-900/50 border border-zinc-800 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-6 bg-rose-950/30 border border-rose-800/40 rounded-xl text-center text-rose-300">
          <p className="font-semibold mb-2">Ocurrió un error al cargar las publicaciones.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 text-xs bg-rose-900/50 hover:bg-rose-800/50 px-3 py-1.5 rounded-lg border border-rose-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reintentar
          </button>
        </div>
      )}

      {/* Grilla de Publicaciones */}
      {!loading && !error && data?.posts && (
        <>
          {data.posts.length === 0 ? (
            <p className="text-center text-zinc-500 py-12">No hay publicaciones disponibles en esta sección.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.posts.map((post) => (
                <ViewCard key={post.id} post={post} onToggleFavorite={handleToggleFavorite} />
              ))}
            </div>
          )}

          {/* Paginación */}
          {data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
              >
                Anterior
              </button>
              <span className="text-xs text-zinc-400 font-mono">
                Página {page} de {data.totalPages}
              </span>
              <button
                disabled={page === data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};