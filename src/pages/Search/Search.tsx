import React from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { apiFetch } from '../../services/api';
import { mapApiViewToPost } from '../../utils/mapView';
import { ViewCard, type ViewPost } from '../../components/ViewCard';
import './Search.css';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';

  const { data, loading, error } = useFetch<{
    posts: ViewPost[];
    total: number;
  }>(async () => {
    if (!query) {
      return { posts: [], total: 0 };
    }

    const encodedQuery = encodeURIComponent(query);
    const payload = await apiFetch<any>(`/search?q=${encodedQuery}`);
    const results = Array.isArray(payload)
      ? payload
      : payload?.results ?? payload?.views ?? payload?.posts ?? [];

    return {
      posts: Array.isArray(results) ? results.map(mapApiViewToPost) : [],
      total: Number(payload?.total ?? results.length),
    };
  }, [query]);

  const posts = data?.posts ?? [];

  return (
    <div className="search-page app-page">
      <div className="search-page-container app-page-container">
        <Link to="/" className="app-link">Volver al inicio</Link>
        <div className="search-heading">
          <SearchIcon aria-hidden="true" />
          <div>
            <h1 className="app-title">Resultados para: "{query}"</h1>
            {!loading && !error && (
              <p className="app-muted">{data?.total ?? 0} resultados</p>
            )}
          </div>
        </div>

        {loading && <p className="search-status app-muted">Cargando resultados...</p>}
        {error && <p className="search-status app-error">{error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p className="search-status app-muted">
            No se encontraron publicaciones para '{query}'
          </p>
        )}
        {!loading && !error && posts.length > 0 && (
          <div className="search-results-grid">
            {posts.map((post) => (
              <ViewCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
