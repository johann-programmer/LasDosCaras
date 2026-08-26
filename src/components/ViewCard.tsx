import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  User,
} from 'lucide-react';
import './ViewCard.css';

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
}

export const ViewCard: React.FC<ViewCardProps> = ({
  post,
  onToggleFavorite,
}) => {
  return (
    <article className="view-card">
      <div className="view-card-body">
        <div className="view-card-top">
          {post.categoryName ? (
            <Link
              to={`/categories/${post.categoryId}`}
              className="view-card-category"
            >
              {post.categoryName}
            </Link>
          ) : (
            <span className="view-card-category is-muted">Sin categoría</span>
          )}

          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(post.id)}
              className={`view-card-favorite ${
                post.isFavorite ? 'is-active' : ''
              }`}
              title={
                post.isFavorite
                  ? 'Quitar de favoritos'
                  : 'Guardar en favoritos'
              }
            >
              <Heart
                className={post.isFavorite ? 'is-filled' : ''}
                size={16}
              />
            </button>
          )}
        </div>

        <Link to={`/views/${post.id}`} className="view-card-title-link">
          <h2>{post.title}</h2>
        </Link>

        {post.summary && <p className="view-card-summary">{post.summary}</p>}
      </div>

      <div className="view-card-footer">
        <div className="view-card-reactions">
          <div className="view-card-side-stats is-a">
            <span className="view-card-side-label">Lado A</span>
            <div className="view-card-side-counts">
              <span title="Likes">
                <ThumbsUp size={13} />
                {post.likesSideA}
              </span>
              <span title="Dislikes">
                <ThumbsDown size={13} />
                {post.dislikesSideA}
              </span>
            </div>
          </div>

          <div className="view-card-side-stats is-b">
            <span className="view-card-side-label">Lado B</span>
            <div className="view-card-side-counts">
              <span title="Likes">
                <ThumbsUp size={13} />
                {post.likesSideB}
              </span>
              <span title="Dislikes">
                <ThumbsDown size={13} />
                {post.dislikesSideB}
              </span>
            </div>
          </div>
        </div>

        <div className="view-card-meta">
          <Link
            to={`/authors/${post.authorId}`}
            className="view-card-author"
          >
            <User size={14} />
            <span>{post.authorName}</span>
          </Link>
          <span className="view-card-date">
            <Calendar size={14} />
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </article>
  );
};

export default ViewCard;
