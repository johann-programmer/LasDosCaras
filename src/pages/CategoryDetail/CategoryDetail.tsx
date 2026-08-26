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

  const { data, loading, error, refetch } = useFetch<CategoryResponse>(
    async () => {
      const response = await fetch(
        `http://localhost:3000/api/categories/${id}?page=${page}&limit=6`
      );
      if (!response.ok) {
        throw new Error('No se pudo obtener la categoría.');
      }
      return response.json();
    },
    [id, page]
  );

  if (loading) {
    return (
      <div className="app-page app-page-centered">
        <p className="app-muted">Cargando categoría...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="app-page app-page-centered">
        <p className="app-error">
          {error || 'No se pudo cargar la categoría solicitada.'}
        </p>
        <Link to="/" className="app-back">
          <ArrowLeft size={16} /> Volver al Tablero Principal
        </Link>
      </div>
    );
  }

  const { category, posts, totalPages } = data;

  return (
    <div className="app-page">
      <div className="app-page-container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Link to="/" className="app-back">
            <ArrowLeft size={16} /> Volver al Tablero
          </Link>
          <button
            type="button"
            onClick={() => refetch()}
            className="app-icon-btn"
            title="Recargar categoría"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <header className="app-card">
          <div className="app-badge" style={{ marginBottom: 12 }}>
            <Layers size={14} />
            Categoría temática
          </div>
          <h1 className="app-title">{category.name}</h1>
          <p className="app-muted" style={{ marginTop: 8 }}>
            {category.description}
          </p>
          <p className="app-muted" style={{ marginTop: 10, fontSize: 12 }}>
            {category.totalViews} publicaciones en debate
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="app-card" style={{ textAlign: 'center' }}>
            <p className="app-muted">
              No hay publicaciones disponibles en esta categoría.
            </p>
          </div>
        ) : (
          <div className="app-grid">
            {posts.map((post) => (
              <ViewCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="app-pagination">
            <button
              type="button"
              className="app-btn"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Anterior
            </button>
            <span className="app-muted">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              className="app-btn"
              disabled={page === totalPages}
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
