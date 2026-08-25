// src/pages/views/EditView.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Video } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';

interface CategoryOption {
  id: string;
  name: string;
}

interface SourceInput {
  title: string;
  url: string;
}

interface ViewDetailData {
  id: string;
  title: string;
  summary: string;
  categoryId: string;
  youtubeUrl?: string;
  sideA: {
    title: string;
    content: string;
    sources: SourceInput[];
  };
  sideB: {
    title: string;
    content: string;
    sources: SourceInput[];
  };
}

export const EditView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const [sideATitle, setSideATitle] = useState('');
  const [sideAContent, setSideAContent] = useState('');
  const [sideASources, setSideASources] = useState<SourceInput[]>([]);

  const [sideBTitle, setSideBTitle] = useState('');
  const [sideBContent, setSideBContent] = useState('');
  const [sideBSources, setSideBSources] = useState<SourceInput[]>([]);

  // Petición para cargar los datos existentes de la publicación
  const { data, loading, error } = useFetch<ViewDetailData>(
    async () => {
      const res = await fetch(`/api/views/${id}`);
      if (!res.ok) throw new Error('No se pudo cargar la publicación a editar.');
      return res.json();
    },
    [id]
  );

  // Cargar lista de categorías
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((cats) => setCategories(cats))
      .catch(() => setCategories([]));
  }, []);

  // Rellenar el formulario cuando los datos de la publicación estén listos
  useEffect(() => {
    if (data) {
      setTitle(data.title || '');
      setSummary(data.summary || '');
      setCategoryId(data.categoryId || '');
      setYoutubeUrl(data.youtubeUrl || '');
      if (data.sideA) {
        setSideATitle(data.sideA.title || '');
        setSideAContent(data.sideA.content || '');
        setSideASources(data.sideA.sources || []);
      }
      if (data.sideB) {
        setSideBTitle(data.sideB.title || '');
        setSideBContent(data.sideB.content || '');
        setSideBSources(data.sideB.sources || []);
      }
    }
  }, [data]);

  // Manejo de fuentes
  const addSource = (side: 'A' | 'B') => {
    if (side === 'A') setSideASources([...sideASources, { title: '', url: '' }]);
    else setSideBSources([...sideBSources, { title: '', url: '' }]);
  };

  const removeSource = (side: 'A' | 'B', index: number) => {
    if (side === 'A') setSideASources(sideASources.filter((_, i) => i !== index));
    else setSideBSources(sideBSources.filter((_, i) => i !== index));
  };

  const updateSource = (side: 'A' | 'B', index: number, field: 'title' | 'url', value: string) => {
    if (side === 'A') {
      const updated = [...sideASources];
      updated[index][field] = value;
      setSideASources(updated);
    } else {
      const updated = [...sideBSources];
      updated[index][field] = value;
      setSideBSources(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const payload = {
      title,
      summary,
      categoryId,
      youtubeUrl,
      sideA: { title: sideATitle, content: sideAContent, sources: sideASources.filter((s) => s.title.trim() && s.url.trim()) },
      sideB: { title: sideBTitle, content: sideBContent, sources: sideBSources.filter((s) => s.title.trim() && s.url.trim()) },
    };

    try {
      const response = await fetch(`/api/views/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('No se pudieron guardar los cambios.');

      navigate(`/views/${id}`);
    } catch (err: any) {
      setFormError(err.message || 'Error al actualizar el debate.');
    } finally {
      setSubmitting(false);
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
      <div className="min-h-screen bg-black text-zinc-100 p-8 max-w-4xl mx-auto text-center space-y-4">
        <p className="text-rose-400">{error || 'No se encontró la publicación.'}</p>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <Link to={`/views/${id}`} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Cancelar Edición
      </Link>

      <header className="space-y-2 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl md:text-4xl font-black text-white">Editar Debate</h1>
        <p className="text-zinc-400 text-sm">Modifica los detalles, argumentos o fuentes del debate.</p>
      </header>

      {formError && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/60 text-rose-300 rounded-xl text-sm">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información General */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-zinc-800/80 pb-2">Información General</h2>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Título Principal *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Categoría *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 focus:border-blue-500 outline-none"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-500" /> URL de YouTube
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Resumen *</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
              required
            />
          </div>
        </section>

        {/* Posturas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lado A */}
          <section className="bg-zinc-900/40 border border-emerald-900/40 rounded-2xl p-6 space-y-4">
            <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
              Lado A
            </span>
            <input
              type="text"
              value={sideATitle}
              onChange={(e) => setSideATitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none"
              required
            />
            <textarea
              value={sideAContent}
              onChange={(e) => setSideAContent(e.target.value)}
              rows={5}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none"
              required
            />
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Fuentes</span>
                <button type="button" onClick={() => addSource('A')} className="text-emerald-400 hover:underline inline-flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Agregar
                </button>
              </div>
              {sideASources.map((src, idx) => (
                <div key={idx} className="flex gap-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                  <input
                    type="text"
                    value={src.title}
                    onChange={(e) => updateSource('A', idx, 'title', e.target.value)}
                    className="w-1/2 bg-transparent text-xs text-white outline-none"
                  />
                  <input
                    type="url"
                    value={src.url}
                    onChange={(e) => updateSource('A', idx, 'url', e.target.value)}
                    className="w-1/2 bg-transparent text-xs text-zinc-400 outline-none"
                  />
                  <button type="button" onClick={() => removeSource('A', idx)} className="text-zinc-500 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Lado B */}
          <section className="bg-zinc-900/40 border border-indigo-900/40 rounded-2xl p-6 space-y-4">
            <span className="text-xs font-black text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/40">
              Lado B
            </span>
            <input
              type="text"
              value={sideBTitle}
              onChange={(e) => setSideBTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none"
              required
            />
            <textarea
              value={sideBContent}
              onChange={(e) => setSideBContent(e.target.value)}
              rows={5}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none"
              required
            />
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Fuentes</span>
                <button type="button" onClick={() => addSource('B')} className="text-indigo-400 hover:underline inline-flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Agregar
                </button>
              </div>
              {sideBSources.map((src, idx) => (
                <div key={idx} className="flex gap-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                  <input
                    type="text"
                    value={src.title}
                    onChange={(e) => updateSource('B', idx, 'title', e.target.value)}
                    className="w-1/2 bg-transparent text-xs text-white outline-none"
                  />
                  <input
                    type="url"
                    value={src.url}
                    onChange={(e) => updateSource('B', idx, 'url', e.target.value)}
                    className="w-1/2 bg-transparent text-xs text-zinc-400 outline-none"
                  />
                  <button type="button" onClick={() => removeSource('B', idx)} className="text-zinc-500 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditView;