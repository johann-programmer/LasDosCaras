import React from 'react';
import { Link } from 'react-router-dom';

const Author: React.FC = () => {
  return (
    <div className="app-page">
      <div className="app-page-container">
        <h1 className="app-title">Autores</h1>
        <p className="app-muted">Explora autores desde el tablero principal.</p>
        <Link to="/" className="app-btn app-btn-primary" style={{ width: 'fit-content' }}>
          Ir al inicio
        </Link>
      </div>
    </div>
  );
};

export default Author;
