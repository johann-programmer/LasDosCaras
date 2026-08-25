// src/pages/views/NewView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Send, Video, Link2 } from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
}

interface SourceInput {
  title: string;
  url: string;
}

export const NewView: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos principales del formulario
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Lado A
  const [sideATitle, setSideATitle] = useState('');
  const [sideAContent, setSideAContent] = useState('');
  const [sideASources, setSideASources] = useState<SourceInput[]>([]);

  // Lado B
  const [sideBTitle, setSideBTitle] = useState('');
  const [sideBContent, setSideBContent] = useState('');
  const [sideBSources, setSideBSources] = useState<SourceInput[]>([]);

  // Cargar categorías disponibles
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // Manejadores de fuentes (Lado A)
  const addSideASource = () => setSideASources([...sideASources, { title: '', url: '' }]);
  const removeSideASource = (index: number) =>
    setSideASources(sideASources.filter((_, i) => i !== index));
  const updateSideASource = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...sideASources];
    updated[index][field] = value;
    setSideASources(updated);
  };

  // Manejadores de fuentes (Lado B)
  const addSideBSource = () => setSideBSources([...sideBSources, { title: '', url: '' }]);
  const removeSideBSource = (index: number) =>
    setSideBSources(sideBSources.filter((_, i) => i !== index));
  const updateSideBSource = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...sideBSources];
    updated[index][field] = value;
    setSideBSources(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary || !categoryId || !sideATitle || !sideAContent || !sideBTitle || !sideBContent) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      title,
      summary,
      categoryId,
      youtubeUrl,
      sideA: {
        title: sideATitle,
        content: sideAContent,
        sources: sideASources.filter((s) => s.title.trim() && s.url.trim()),
      },
      sideB: {
        title: sideBTitle,
        content: sideBContent,
        sources: sideBSources.filter((s) => s.title.trim() && s.url.trim()),
      },
    };

    try {
      const response = await fetch('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error al publicar el debate.');
      }

      const data = await response.json();
      navigate(`/views/${data.id || ''}`);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado al guardar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Volver */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Cancelar y Volver
      </Link>

      <header className="space-y-2 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl md:text-4xl font-black text-white">Crear Nuevo Debate</h1>
        <p className="text-zinc-400 text-sm">
          Presenta una problemática o tema exponiendo objetivamente ambas posturas.
        </p>
      </header>

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/60 text-rose-300 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información General */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-zinc-800/80 pb-2">
            Información General
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Título Principal *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. ¿Debería regularse la Inteligencia Artificial de Código Abierto?"
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
                <Video className="w-4 h-4 text-red-500" /> URL de YouTube (Opcional)
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Resumen Introductorio *</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder="Breve contexto neutro sobre el tema en discusión..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
              required
            />
          </div>
        </section>

        {/* Posturas Enfrentadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulario Lado A */}
          <section className="bg-zinc-900/40 border border-emerald-900/40 rounded-2xl p-6 space-y-4">
            <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
              Lado A — Postura
            </span>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Título de la Postura *</label>
              <input
                type="text"
                value={sideATitle}
                onChange={(e) => setSideATitle(e.target.value)}
                placeholder="Ej. A favor del desarrollo libre"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Argumentación *</label>
              <textarea
                value={sideAContent}
                onChange={(e) => setSideAContent(e.target.value)}
                rows={5}
                placeholder="Detalla los argumentos a favor de esta postura..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none"
                required
              />
            </div>

            {/* Fuentes Lado A */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">Fuentes y Referencias</span>
                <button
                  type="button"
                  onClick={addSideASource}
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar fuente
                </button>
              </div>

              {sideASources.map((src, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                  <input
                    type="text"
                    placeholder="Nombre/Título"
                    value={src.title}
                    onChange={(e) => updateSideASource(idx, 'title', e.target.value)}
                    className="w-1/2 bg-transparent text-xs text-white outline-none"
                  />
                  <input
                    type="url"
                    placeholder="URL (https://...)"
                    value={src.url}
                    onChange={(e) => updateSideASource(idx, 'url', e.target.value)}
                    className="w-1/2 bg-transparent text-xs text-zinc-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeSideASource(idx)}
                    className="text-zinc-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Formulario Lado B */}
          <section className="bg-zinc-900/40 border border-indigo-900/40 rounded-2xl p-6 space-y-4">
            <span className="text-xs font-black text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/40">
              Lado B — Contrapostura
            </span>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Título de la Contrapostura *</label>
              <input
                type="text"
                value={sideBTitle}
                onChange={(e) => setSideBTitle(e.target.value)}
                placeholder="Ej. A favor del control y seguridad estricta"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Argumentación *</label>
              <textarea
                value={sideBContent}
                onChange={(e) => setSideBContent(e.target.value)}
                rows={5}
                placeholder="Detalla los argumentos en contra o la postura opuesta..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none"
                required
              />
            </div>

            {/* Fuentes Lado B */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">Fuentes y Referencias</span>
                <button
                  type="button"
                  onClick={addSideBSource}
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar fuente
                </button>
              </div>

              {sideBSources.map((src, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                  <input
                    type="text"
                    placeholder="Nombre/Título"
                    value={src.title}
                    onChange={(e) => updateSideBSource(idx, 'title', e.target.value)}
                    className="w-1/2 bg-transparent text-xs text-white outline-none"
                  />
                  <input
                    type="url"
                    placeholder="URL (https://...)"
                    value={src.url}
                    onChange={(e) => updateSideBSource(idx, 'url', e.target.value)}
                    className="w-1/2 bg-transparent text-xs text-zinc-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeSideBSource(idx)}
                    className="text-zinc-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Botón Guardar / Publicar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Publicando debate...' : 'Publicar Debate'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewView;