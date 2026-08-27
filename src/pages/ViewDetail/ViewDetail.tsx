import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MessageSquare,
  Pencil,
  Share2,
  ThumbsDown,
  ThumbsUp,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cacheService } from '../../services/cacheService';
import './ViewDetail.css';

const API_BASE = 'http://localhost:3000/api';

type ReactionType = 'LIKE' | 'DISLIKE' | null;
type ApiSide = 'a' | 'b';

interface Source {
  title: string;
  url: string;
  type?: string;
}

interface SideView {
  title: string;
  content: string;
  likeCount: number;
  dislikeCount: number;
  myReaction: ReactionType;
  sources: Source[];
}

interface ReplyComment {
  id: string;
  authorName: string;
  createdAt: string;
  text: string;
}

interface ThreadComment {
  id: string;
  authorName: string;
  createdAt: string;
  text: string;
  replies: ReplyComment[];
}

interface ThreadItem {
  id: string;
  title?: string;
  createdAt: string;
  comments: ThreadComment[];
}

interface ViewDetailData {
  id: string;
  title: string;
  categoryName: string;
  categoryId: string;
  authorName: string;
  authorId: string;
  createdAt: string;
  youtubeUrl?: string;
  sideA: SideView;
  sideB: SideView;
  hashtags: string[];
}

const getYouTubeEmbedUrl = (url?: string) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (parsed.pathname.startsWith('/embed/')) {
        const id = parsed.pathname.split('/')[2];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/')[2];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
    }
  } catch {
    return null;
  }
  return null;
};

const mapSide = (side: any): SideView => ({
  title: side?.title ?? '',
  content: side?.description ?? side?.content ?? '',
  likeCount: side?.likeCount ?? 0,
  dislikeCount: side?.dislikeCount ?? 0,
  myReaction: (side?.myReaction as ReactionType) ?? null,
  sources: Array.isArray(side?.sources)
    ? side.sources.map((source: any) => ({
        title: source.label ?? source.title ?? source.url ?? 'Fuente',
        url: source.url ?? '',
        type: source.type,
      }))
    : [],
});

const mapApiViewToDetail = (view: any): ViewDetailData => {
  const sides = Array.isArray(view?.sides) ? view.sides : [];
  const sideA = sides.find((side: any) => side.type === 'SIDE') ?? {};
  const sideB =
    sides.find((side: any) => side.type === 'COUNTERPART') ?? {};

  const mappedSideA = mapSide(sideA);
  const mappedSideB = mapSide(sideB);

  const youtubeSource = [...mappedSideA.sources, ...mappedSideB.sources].find(
    (source) =>
      source.type === 'YOUTUBE' || Boolean(getYouTubeEmbedUrl(source.url))
  );

  return {
    id: String(view.id),
    title:
      mappedSideA.title && mappedSideB.title
        ? `${mappedSideA.title} vs ${mappedSideB.title}`
        : mappedSideA.title || mappedSideB.title || 'Publicación',
    categoryName: view.category?.name ?? '',
    categoryId: String(view.categoryId ?? view.category?.id ?? ''),
    authorName: view.author?.name ?? 'Autor',
    authorId: String(view.authorId ?? view.author?.id ?? ''),
    createdAt: view.createdAt ?? new Date().toISOString(),
    youtubeUrl: youtubeSource?.url,
    sideA: mappedSideA,
    sideB: mappedSideB,
    hashtags: Array.isArray(view.hashtags)
      ? view.hashtags.map((tag: any) =>
          typeof tag === 'string' ? tag : tag?.name ?? ''
        )
      : [],
  };
};

const mapComment = (comment: any): ThreadComment => ({
  id: String(comment.id),
  authorName: comment.user?.name ?? 'Usuario',
  createdAt: comment.createdAt ?? new Date().toISOString(),
  text: comment.content ?? '',
  replies: Array.isArray(comment.replies)
    ? comment.replies.map((reply: any) => ({
        id: String(reply.id),
        authorName: reply.user?.name ?? 'Usuario',
        createdAt: reply.createdAt ?? new Date().toISOString(),
        text: reply.content ?? '',
      }))
    : [],
});

const mapThreads = (threads: any[]): ThreadItem[] =>
  threads.map((thread) => ({
    id: String(thread.id),
    title: thread.title || undefined,
    createdAt: thread.createdAt ?? new Date().toISOString(),
    comments: Array.isArray(thread.comments)
      ? thread.comments.map(mapComment)
      : [],
  }));

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

export const ViewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isAuthenticated, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'both' | 'A' | 'B'>('both');
  const [newComment, setNewComment] = useState('');
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<ViewDetailData | null>(null);
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reactingSide, setReactingSide] = useState<ApiSide | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    threadId: string;
    parentId: string;
  } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const authHeaders = useMemo(
    () =>
      token
        ? {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        : { 'Content-Type': 'application/json' },
    [token]
  );

  const requireAuth = useCallback(() => {
    if (isAuthenticated && token) return true;
    navigate('/login', { state: { from: location }, replace: false });
    return false;
  }, [isAuthenticated, token, navigate, location]);

  const loadThreads = useCallback(async (viewId: string) => {
    const response = await fetch(`${API_BASE}/views/${viewId}/threads`);
    if (!response.ok) {
      throw new Error('No se pudieron cargar los comentarios.');
    }
    const payload = await response.json();
    const list = Array.isArray(payload?.threads) ? payload.threads : [];
    setThreads(mapThreads(list));
  }, []);

  useEffect(() => {
    if (!id) {
      setError('Publicación no encontrada.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadView = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/views/${id}`, {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error || 'No se pudo cargar la publicación.');
        }

        const payload = await response.json();
        if (cancelled) return;

        const view = payload?.view ?? payload;
        if (!view?.id) {
          throw new Error('La API no devolvió la publicación.');
        }

        setData(mapApiViewToDetail(view));
        await loadThreads(String(view.id));
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar la publicación.'
          );
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadView();
    return () => {
      cancelled = true;
    };
  }, [id, token, loadThreads]);

  useEffect(() => {
    if (id && data) {
      cacheService.addToHistory(id);
    }
  }, [id, data]);

  const embedUrl = useMemo(
    () => getYouTubeEmbedUrl(data?.youtubeUrl),
    [data?.youtubeUrl]
  );

  const commentsCount = useMemo(
    () =>
      threads.reduce(
        (total, thread) =>
          total +
          thread.comments.reduce(
            (sum, comment) => sum + 1 + comment.replies.length,
            0
          ),
        0
      ),
    [threads]
  );

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data?.title,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error al compartir:', err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReaction = async (
    side: ApiSide,
    type: 'like' | 'dislike'
  ) => {
    if (!id || !data) return;
    if (!requireAuth()) return;

    setActionError(null);
    setReactingSide(side);

    try {
      const response = await fetch(
        `${API_BASE}/views/${id}/sides/${side}/${type}`,
        {
          method: 'POST',
          headers: authHeaders,
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error || 'No se pudo registrar la reacción.'
        );
      }

      const result = await response.json();
      const sideKey = side === 'a' ? 'sideA' : 'sideB';

      setData((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          [sideKey]: {
            ...previous[sideKey],
            likeCount: result.likeCount ?? previous[sideKey].likeCount,
            dislikeCount:
              result.dislikeCount ?? previous[sideKey].dislikeCount,
            myReaction: (result.myReaction as ReactionType) ?? null,
          },
        };
      });
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar la reacción.'
      );
    } finally {
      setReactingSide(null);
    }
  };

  const handleCreateComment = async () => {
    if (!id || !newComment.trim()) return;
    if (!requireAuth()) return;

    setSubmittingComment(true);
    setActionError(null);

    try {
      const response = await fetch(`${API_BASE}/views/${id}/threads`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error || 'No se pudo publicar el comentario.'
        );
      }

      setNewComment('');
      await loadThreads(id);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'No se pudo publicar el comentario.'
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCreateReply = async () => {
    if (!id || !replyingTo || !replyText.trim()) return;
    if (!requireAuth()) return;

    setSubmittingReply(true);
    setActionError(null);

    try {
      const response = await fetch(
        `${API_BASE}/views/${id}/threads/${replyingTo.threadId}/comments`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            content: replyText.trim(),
            parentId: replyingTo.parentId,
          }),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'No se pudo publicar la respuesta.');
      }

      setReplyText('');
      setReplyingTo(null);
      await loadThreads(id);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'No se pudo publicar la respuesta.'
      );
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="view-detail-page view-detail-centered">
        <div className="view-detail-spinner" />
        <p>Cargando publicación...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="view-detail-page view-detail-centered">
        <p className="view-detail-error">
          {error || 'No se pudo cargar la publicación solicitada.'}
        </p>
        <Link to="/" className="view-detail-back">
          <ArrowLeft size={16} /> Volver al Tablero Principal
        </Link>
      </div>
    );
  }

  const showSideA = activeTab === 'both' || activeTab === 'A';
  const showSideB = activeTab === 'both' || activeTab === 'B';
  const isOwner = Boolean(
    user?.id && data.authorId && user.id === data.authorId
  );

  const renderSide = (
    sideKey: 'sideA' | 'sideB',
    apiSide: ApiSide,
    label: string
  ) => {
    const side = data[sideKey];
    const busy = reactingSide === apiSide;

    return (
      <section
        className={`view-detail-side ${
          apiSide === 'a' ? 'view-detail-side-a' : 'view-detail-side-b'
        }`}
      >
        <div>
          <div className="view-detail-side-top">
            <span
              className={`view-detail-badge ${
                apiSide === 'a'
                  ? 'view-detail-badge-a'
                  : 'view-detail-badge-b'
              }`}
            >
              {label}
            </span>
          </div>
          <h2>{side.title}</h2>
          <p className="view-detail-side-body">{side.content}</p>
        </div>

        <div className="view-detail-reactions">
          <button
            type="button"
            className={`view-detail-reaction-btn is-like ${
              side.myReaction === 'LIKE' ? 'is-active' : ''
            }`}
            onClick={() => handleReaction(apiSide, 'like')}
            disabled={busy}
            aria-pressed={side.myReaction === 'LIKE'}
          >
            {busy ? <Loader2 size={14} className="is-spinning" /> : <ThumbsUp size={14} />}
            <span>{side.likeCount}</span>
            <span className="view-detail-reaction-label">Me gusta</span>
          </button>
          <button
            type="button"
            className={`view-detail-reaction-btn is-dislike ${
              side.myReaction === 'DISLIKE' ? 'is-active' : ''
            }`}
            onClick={() => handleReaction(apiSide, 'dislike')}
            disabled={busy}
            aria-pressed={side.myReaction === 'DISLIKE'}
          >
            {busy ? <Loader2 size={14} className="is-spinning" /> : <ThumbsDown size={14} />}
            <span>{side.dislikeCount}</span>
            <span className="view-detail-reaction-label">No me gusta</span>
          </button>
        </div>

        {side.sources.length > 0 && (
          <div className="view-detail-sources">
            <h4>Fuentes y referencias</h4>
            <ul>
              {side.sources.map((source, index) => (
                <li key={`${source.url}-${index}`}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={12} />
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="view-detail-page">
      <div className="view-detail-container">
        <div className="view-detail-topline">
          <Link to="/" className="view-detail-back">
            <ArrowLeft size={16} /> Volver
          </Link>
          {data.categoryName && (
            <Link
              to={`/categories/${data.categoryId}`}
              className="view-detail-category"
            >
              {data.categoryName}
            </Link>
          )}
        </div>

        <header className="view-detail-header">
          <h1>{data.title}</h1>

          {data.hashtags.length > 0 && (
            <div className="view-detail-hashtags">
              {data.hashtags.map((tag) => (
                <span key={tag} className="view-detail-chip">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="view-detail-meta">
            <div className="view-detail-meta-left">
              <Link
                to={`/authors/${data.authorId}`}
                className="view-detail-author"
              >
                <User size={14} />
                <span>{data.authorName}</span>
              </Link>
              <span className="view-detail-meta-item">
                <Calendar size={14} />
                {new Date(data.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="view-detail-meta-actions">
              {isOwner && (
                <Link
                  to={`/views/${data.id}/edit`}
                  className="view-detail-edit"
                >
                  <Pencil size={16} />
                  <span>Editar publicación</span>
                </Link>
              )}

              <button
                type="button"
                className={`view-detail-share ${copied ? 'is-copied' : ''}`}
                onClick={handleShare}
              >
                {copied ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
                <span>{copied ? 'Copiado' : 'Compartir'}</span>
              </button>
            </div>
          </div>
        </header>

        {actionError && (
          <div className="view-detail-banner-error">{actionError}</div>
        )}

        {!isAuthenticated && (
          <div className="view-detail-banner-info">
            <Link to="/login" state={{ from: location }}>
              Inicia sesión
            </Link>{' '}
            para reaccionar o comentar.
          </div>
        )}

        {embedUrl && (
          <div className="view-detail-video">
            <iframe
              src={embedUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="view-detail-tabs-wrap">
          <div className="view-detail-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'both'}
              className={`view-detail-tab ${activeTab === 'both' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('both')}
            >
              Ambas posturas
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'A'}
              className={`view-detail-tab is-a ${activeTab === 'A' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('A')}
            >
              Solo Lado A
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'B'}
              className={`view-detail-tab is-b ${activeTab === 'B' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('B')}
            >
              Solo Lado B
            </button>
          </div>
        </div>

        <div
          className={`view-detail-sides ${activeTab === 'both' ? 'is-both' : ''}`}
        >
          {showSideA && renderSide('sideA', 'a', 'Lado A — Postura')}
          {showSideB && renderSide('sideB', 'b', 'Lado B — Contrapostura')}
        </div>

        <section className="view-detail-comments">
          <h3>
            <MessageSquare size={20} />
            Debate y comentarios ({commentsCount})
          </h3>

          <div className="view-detail-comment-box">
            <textarea
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              onFocus={() => {
                if (!isAuthenticated) {
                  requireAuth();
                }
              }}
              placeholder={
                isAuthenticated
                  ? 'Aporta un argumento respetuoso al debate...'
                  : 'Inicia sesión para comentar...'
              }
              rows={3}
              readOnly={!isAuthenticated}
              disabled={submittingComment}
            />

            <div className="view-detail-comment-actions">
              <button
                type="button"
                className="view-detail-submit"
                onClick={() => {
                  if (!requireAuth()) return;
                  void handleCreateComment();
                }}
                disabled={
                  submittingComment ||
                  (isAuthenticated && !newComment.trim())
                }
              >
                {submittingComment ? (
                  <>
                    <Loader2 size={16} className="is-spinning" />
                    Publicando...
                  </>
                ) : (
                  'Publicar comentario'
                )}
              </button>
            </div>
          </div>

          <div className="view-detail-comment-list">
            {threads.length === 0 ? (
              <p className="view-detail-empty-comments">
                Todavía no hay comentarios en este debate.
              </p>
            ) : (
              threads.map((thread) => (
                <article key={thread.id} className="view-detail-thread">
                  {thread.title && (
                    <h4 className="view-detail-thread-title">
                      {thread.title}
                    </h4>
                  )}

                  {thread.comments.map((comment) => (
                    <div key={comment.id} className="view-detail-comment-item">
                      <div className="view-detail-comment-head">
                        <span className="view-detail-comment-author">
                          {comment.authorName}
                        </span>
                        <span className="view-detail-comment-date">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p>{comment.text}</p>

                      <div className="view-detail-comment-footer">
                        <button
                          type="button"
                          className="view-detail-reply-btn"
                          onClick={() => {
                            if (!requireAuth()) return;
                            setReplyingTo({
                              threadId: thread.id,
                              parentId: comment.id,
                            });
                            setReplyText('');
                          }}
                        >
                          Responder
                        </button>
                      </div>

                      {replyingTo?.parentId === comment.id && (
                        <div className="view-detail-reply-box">
                          <textarea
                            value={replyText}
                            onChange={(event) =>
                              setReplyText(event.target.value)
                            }
                            placeholder="Escribe tu respuesta..."
                            rows={2}
                            disabled={submittingReply}
                          />
                          <div className="view-detail-reply-actions">
                            <button
                              type="button"
                              className="view-detail-btn-secondary"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              disabled={submittingReply}
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              className="view-detail-submit"
                              onClick={handleCreateReply}
                              disabled={
                                submittingReply || !replyText.trim()
                              }
                            >
                              {submittingReply ? 'Enviando...' : 'Responder'}
                            </button>
                          </div>
                        </div>
                      )}

                      {comment.replies.length > 0 && (
                        <div className="view-detail-replies">
                          {comment.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="view-detail-reply-item"
                            >
                              <div className="view-detail-comment-head">
                                <span className="view-detail-comment-author">
                                  {reply.authorName}
                                </span>
                                <span className="view-detail-comment-date">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>
                              <p>{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ViewDetail;
