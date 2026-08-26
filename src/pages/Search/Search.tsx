import React from 'react';
import { Link } from 'react-router-dom';

const Search: React.FC = () => {
  return (
    <div className="app-page">
      <div className="app-page-container">
        <h1 className="app-title">Búsqueda</h1>
        <p className="app-muted">
          Usa el buscador del inicio para encontrar publicaciones.
        </p>
        <Link to="/" className="app-btn app-btn-primary" style={{ width: 'fit-content' }}>
          Ir al inicio
        </Link>
      </div>
    </div>
  );
};

export default Search;
