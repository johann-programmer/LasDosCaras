import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { ViewCard } from '../../components/ViewCard';
import { ArrowLeft, User, Calendar, FileText, RefreshCw } from 'lucide-react';
import { getAuthorDetailData, type AuthorPageData } from '../../services/authorService';

export const AuthorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);

  const { data, loading, error, refetch } = useFetch<AuthorPageData>(
    async () => {
      if (!id) throw new Error('Autor no especificado.');
      return await getAuthorDetailData(id, page);
    },
    [id, page]
  );

  const formatDate = (dateString: string) => {
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime())
      ? 'Fecha desconocida'
      : parsedDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="app-page app-page-centered">
        <p className="app-muted">Cargando perfil...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="app-page app-page-centered">
        <p className="app-error">{error || 'No se pudo cargar el perfil del autor.'}</p>
        <Link to="/" className="app-back">
          <ArrowLeft size={16} /> Volver al Tablero Principal
        </Link>
      </div>
    );
  }

  const { author, posts, totalPages } = data;

  return (
    <div className="app-page">
      <div className="app-page-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Link to="/" className="app-back">
            <ArrowLeft size={16} /> Volver al Tablero
          </Link>
          <button
            type="button"
            onClick={() => refetch()}
            className="app-icon-btn"
            title="Recargar perfil"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <header className="app-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '999px',
                border: '2px solid var(--app-border)',
                background: 'var(--app-bg-soft)',
                color: 'var(--app-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={28} />
            </div>

            <div>
              <h1 className="app-title" style={{ fontSize: '1.8rem' }}>
                {author.name}
              </h1>
              <div
                className="app-muted"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 14,
                  marginTop: 10,
                  fontSize: 12,
                }}
              >
                <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  <Calendar size={14} />
                  Miembro desde {formatDate(author.joinedAt)}
                </span>
                <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  <FileText size={14} />
                  {author.totalPosts} publicaciones
                </span>
              </div>
            </div>
          </div>
        </header>

        <h2 className="app-title" style={{ fontSize: '1.2rem' }}>
          Publicaciones de {author.name}
        </h2>

        {posts.length === 0 ? (
          <div className="app-card" style={{ textAlign: 'center' }}>
            <p className="app-muted">Este autor aún no ha publicado debates.</p>
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
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorDetail;