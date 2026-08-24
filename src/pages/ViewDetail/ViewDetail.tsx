// src/pages/ViewDetail/ViewDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { cacheService } from '../../services/cacheService';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Calendar,
  User,
  ExternalLink,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface Source {
  title: string;
  url: string;
}

interface Comment {
  id: string;
  authorName: string;
  createdAt: string;
  text: string;
  side: 'A' | 'B';
}

interface ViewDetailData {
  id: string;
  title: string;
  summary: string;
  categoryName: string;
  categoryId: string;
  authorName: string;
  authorId: string;
  createdAt: string;
  youtubeUrl?: string;
  sideA: {
    title: string;
    content: string;
    likes: number;
    sources: Source[];
  };
  sideB: {
    title: string;
    content: string;
    likes: number;
    sources: Source[];
  };
  comments: Comment[];
}

export const ViewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'both' | 'A' | 'B'>('both');
  const [newComment, setNewComment] = useState('');
  const [selectedSide, setSelectedSide] = useState<'A' | 'B'>('A');
  const [copied, setCopied] = useState(false);

  // Petición de datos de la publicación
  const { data, loading, error } = useFetch<ViewDetailData>(`/views/${id}`);

  // Registrar automáticamente en el historial FIFO local (lasdoscaras_history)
  useEffect(() => {
    if (id && data) {
      cacheService.addToHistory(id);
    }
  }, [id, data]);

  // Manejador de Web Share API con fallback a portapapeles
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 p-6 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 p-8 max-w-4xl mx-auto text-center">
        <p className="text-rose-400 mb-4">No se pudo cargar la publicación solicitada.</p>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Volver al Tablero Principal
        </Link>
      </div>
    );
  }

  // Extraer ID de video de YouTube si existe la URL
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(data.youtubeUrl);

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Botón Volver y Categoría */}
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <Link
          to={`/categories/${data.categoryId}`}
          className="text-xs font-semibold px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-md"
        >
          {data.categoryName}
        </Link>
      </div>

      {/* Título y Metadata */}
      <header className="space-y-4">
        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">{data.title}</h1>
        <p className="text-zinc-400 text-base md:text-lg leading-relaxed">{data.summary}</p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-zinc-500 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <Link to={`/authors/${data.authorId}`} className="flex items-center gap-1.5 hover:text-zinc-300">
              <User className="w-4 h-4" /> <span>{data.authorName}</span>
            </Link>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {new Date(data.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copiado' : 'Compartir'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Video Embed de YouTube (si aplica) */}
      {embedUrl && (
        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
          <iframe
            src={embedUrl}
            title="YouTube video player"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Selector de Vista (Ambas Posturas / Lado A / Lado B) */}
      <div className="flex justify-center border-b border-zinc-800">
        <div className="flex gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800 mb-6">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'both' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Ambas Posturas
          </button>
          <button
            onClick={() => setActiveTab('A')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'A' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Solo Lado A
          </button>
          <button
            onClick={() => setActiveTab('B')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'B' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/50' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Solo Lado B
          </button>
        </div>
      </div>

      {/* Sección Enfrentada de Posturas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lado A */}
        {(activeTab === 'both' || activeTab === 'A') && (
          <section className="bg-zinc-900/60 border border-emerald-900/30 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
                  Lado A — Postura
                </span>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-emerald-400 hover:bg-emerald-900/40 transition-colors text-xs font-bold">
                  <ThumbsUp className="w-4 h-4" /> {data.sideA.likes}
                </button>
              </div>

              <h2 className="text-xl font-bold text-white">{data.sideA.title}</h2>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{data.sideA.content}</p>
            </div>

            {/* Fuentes Lado A */}
            {data.sideA.sources.length > 0 && (
              <div className="pt-4 border-t border-zinc-800/80">
                <h4 className="text-xs font-semibold text-zinc-400 mb-2">Fuentes y Referencias:</h4>
                <ul className="space-y-1">
                  {data.sideA.sources.map((source, index) => (
                    <li key={index}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> {source.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Lado B */}
        {(activeTab === 'both' || activeTab === 'B') && (
          <section className="bg-zinc-900/60 border border-indigo-900/30 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/40">
                  Lado B — Contrapostura
                </span>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/40 border border-indigo-800/40 rounded-lg text-indigo-400 hover:bg-indigo-900/40 transition-colors text-xs font-bold">
                  <ThumbsDown className="w-4 h-4" /> {data.sideB.likes}
                </button>
              </div>

              <h2 className="text-xl font-bold text-white">{data.sideB.title}</h2>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{data.sideB.content}</p>
            </div>

            {/* Fuentes Lado B */}
            {data.sideB.sources.length > 0 && (
              <div className="pt-4 border-t border-zinc-800/80">
                <h4 className="text-xs font-semibold text-zinc-400 mb-2">Fuentes y Referencias:</h4>
                <ul className="space-y-1">
                  {data.sideB.sources.map((source, index) => (
                    <li key={index}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> {source.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Hilo de Comentarios */}
      <section className="pt-8 border-t border-zinc-800 space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          Debate y Comentarios ({data.comments.length})
        </h3>

        {/* Publicar Comentario */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedSide('A')}
              className={`px-3 py-1 text-xs rounded-lg font-medium border transition-colors ${
                selectedSide === 'A' ? 'bg-emerald-950 border-emerald-700 text-emerald-400' : 'border-zinc-800 text-zinc-400'
              }`}
            >
              Apoyar Lado A
            </button>
            <button
              onClick={() => setSelectedSide('B')}
              className={`px-3 py-1 text-xs rounded-lg font-medium border transition-colors ${
                selectedSide === 'B' ? 'bg-indigo-950 border-indigo-700 text-indigo-400' : 'border-zinc-800 text-zinc-400'
              }`}
            >
              Apoyar Lado B
            </button>
          </div>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Aporta un argumento respetuoso al debate..."
            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 outline-none focus:border-zinc-700"
            rows={3}
          />

          <div className="flex justify-end">
            <button
              onClick={() => {
                if (!newComment.trim()) return;
                console.log('Nuevo comentario enviado:', { text: newComment, side: selectedSide });
                setNewComment('');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Publicar Comentario
            </button>
          </div>
        </div>

        {/* Listado de Comentarios */}
        <div className="space-y-3">
          {data.comments.map((comment) => (
            <div key={comment.id} className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">{comment.authorName}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    comment.side === 'A'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                      : 'bg-indigo-950 text-indigo-400 border border-indigo-800/40'
                  }`}
                >
                  Postura Lado {comment.side}
                </span>
              </div>
              <p className="text-zinc-300 text-sm">{comment.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};