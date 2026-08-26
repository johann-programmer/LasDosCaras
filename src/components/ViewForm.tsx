import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  Link as LinkIcon,
  Loader2,
  Plus,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './ViewForm.css';

type SourceType = 'LINK' | 'YOUTUBE' | 'DOCUMENT';
type SideKey = 'side' | 'counterpart';

interface SourceForm {
  type: SourceType;
  url: string;
  label: string;
}

interface SideForm {
  title: string;
  description: string;
  sources: SourceForm[];
}

interface ViewFormData {
  categoryId: string;
  side: SideForm;
  counterpart: SideForm;
  hashtags: string[];
}

interface Category {
  id: string;
  name: string;
}

interface ViewFormProps {
  mode: 'create' | 'edit';
  viewId?: string;
}

const API_BASE = 'http://localhost:3000/api';
const MIN_DESCRIPTION = 100;
const MAX_TITLE = 120;
const MAX_HASHTAGS = 10;

const emptySource = (): SourceForm => ({
  type: 'LINK',
  url: '',
  label: '',
});

const emptySide = (): SideForm => ({
  title: '',
  description: '',
  sources: [emptySource()],
});

const emptyForm = (): ViewFormData => ({
  categoryId: '',
  side: emptySide(),
  counterpart: emptySide(),
  hashtags: [],
});

const normalizeHashtag = (raw: string): string =>
  raw.trim().toLowerCase().replace(/^#/, '');

const isValidUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const getYouTubeId = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      return parsed.pathname.slice(1).split('/')[0] || null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v');
      }
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/')[2] || null;
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/')[2] || null;
      }
    }

    return null;
  } catch {
    return null;
  }
};

const mapApiViewToForm = (data: any): ViewFormData => {
  const sides = Array.isArray(data?.sides) ? data.sides : [];
  const sideA =
    sides.find((s: any) => s.type === 'SIDE') ?? data?.side;
  const sideB =
    sides.find((s: any) => s.type === 'COUNTERPART') ??
    data?.counterpart;

  const mapSide = (side: any): SideForm => {
    const sources = Array.isArray(side?.sources)
      ? side.sources.map((source: any) => ({
          type: (source.type as SourceType) || 'LINK',
          url: source.url ?? '',
          label: source.label ?? '',
        }))
      : [];

    return {
      title: side?.title ?? '',
      description: side?.description ?? side?.content ?? '',
      sources: sources.length > 0 ? sources : [emptySource()],
    };
  };

  const hashtags = Array.isArray(data?.hashtags)
    ? data.hashtags
        .map((tag: any) =>
          normalizeHashtag(
            typeof tag === 'string' ? tag : tag?.name ?? ''
          )
        )
        .filter(Boolean)
    : [];

  return {
    categoryId: String(data?.categoryId ?? data?.category?.id ?? ''),
    side: mapSide(sideA),
    counterpart: mapSide(sideB),
    hashtags,
  };
};

export const ViewForm: React.FC<ViewFormProps> = ({
  mode,
  viewId,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login', {
        replace: true,
        state: { from: location },
      });
    }
  }, [isAuthenticated, token, navigate, location]);

  const [form, setForm] = useState<ViewFormData>(emptyForm);
  const [baseline, setBaseline] = useState<string>(
    JSON.stringify(emptyForm())
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [loadingView, setLoadingView] = useState(mode === 'edit');
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});

  const dirty = useMemo(
    () => JSON.stringify(form) !== baseline,
    [form, baseline]
  );

  const filteredSuggestions = useMemo(() => {
    const query = normalizeHashtag(hashtagInput);
    if (!query) return [];

    return suggestions
      .filter(
        (tag) =>
          tag.includes(query) &&
          !form.hashtags.includes(tag)
      )
      .slice(0, 8);
  }, [suggestions, hashtagInput, form.hashtags]);

  useEffect(() => {
    let cancelled = false;

    const loadMeta = async () => {
      try {
        setLoadingMeta(true);

        const [categoriesRes, hashtagsRes] = await Promise.all([
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/hashtags`),
        ]);

        if (!categoriesRes.ok) {
          throw new Error('No se pudieron cargar las categorías.');
        }

        const categoriesJson = await categoriesRes.json();
        const categoriesList = Array.isArray(categoriesJson)
          ? categoriesJson
          : Array.isArray(categoriesJson.categories)
            ? categoriesJson.categories
            : [];

        const hashtagsJson = hashtagsRes.ok
          ? await hashtagsRes.json()
          : [];
        const hashtagsList = Array.isArray(hashtagsJson)
          ? hashtagsJson
          : Array.isArray(hashtagsJson.hashtags)
            ? hashtagsJson.hashtags
            : [];

        if (cancelled) return;

        setCategories(
          categoriesList.map((category: any) => ({
            id: String(category.id),
            name: category.name ?? category.categoryName ?? '',
          }))
        );

        setSuggestions(
          hashtagsList
            .map((tag: any) =>
              normalizeHashtag(
                typeof tag === 'string' ? tag : tag?.name ?? ''
              )
            )
            .filter(Boolean)
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error cargando datos del formulario.'
          );
        }
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    };

    loadMeta();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode !== 'edit' || !viewId) {
      setLoadingView(false);
      return;
    }

    let cancelled = false;

    const loadView = async () => {
      try {
        setLoadingView(true);
        setError(null);

        const response = await fetch(`${API_BASE}/views/${viewId}`, {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        });

        if (!response.ok) {
          throw new Error('No se pudo cargar la publicación.');
        }

        const data = await response.json();
        if (cancelled) return;

        const mapped = mapApiViewToForm(data?.view ?? data);
        setForm(mapped);
        setBaseline(JSON.stringify(mapped));
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar la publicación.'
          );
        }
      } finally {
        if (!cancelled) setLoadingView(false);
      }
    };

    loadView();
    return () => {
      cancelled = true;
    };
  }, [mode, viewId, token]);

  const updateSide = (
    sideKey: SideKey,
    patch: Partial<SideForm>
  ) => {
    setForm((previous) => ({
      ...previous,
      [sideKey]: { ...previous[sideKey], ...patch },
    }));
  };

  const updateSource = (
    sideKey: SideKey,
    index: number,
    patch: Partial<SourceForm>
  ) => {
    setForm((previous) => {
      const sources = previous[sideKey].sources.map((source, i) =>
        i === index ? { ...source, ...patch } : source
      );
      return {
        ...previous,
        [sideKey]: { ...previous[sideKey], sources },
      };
    });
  };

  const addSource = (sideKey: SideKey) => {
    setForm((previous) => ({
      ...previous,
      [sideKey]: {
        ...previous[sideKey],
        sources: [...previous[sideKey].sources, emptySource()],
      },
    }));
  };

  const removeSource = (sideKey: SideKey, index: number) => {
    setForm((previous) => {
      const sources = previous[sideKey].sources.filter(
        (_, i) => i !== index
      );
      return {
        ...previous,
        [sideKey]: {
          ...previous[sideKey],
          sources: sources.length > 0 ? sources : [emptySource()],
        },
      };
    });
  };

  const addHashtag = (raw: string) => {
    const tag = normalizeHashtag(raw);
    if (!tag) return;

    setForm((previous) => {
      if (
        previous.hashtags.includes(tag) ||
        previous.hashtags.length >= MAX_HASHTAGS
      ) {
        return previous;
      }
      return {
        ...previous,
        hashtags: [...previous.hashtags, tag],
      };
    });
    setHashtagInput('');
  };

  const removeHashtag = (tag: string) => {
    setForm((previous) => ({
      ...previous,
      hashtags: previous.hashtags.filter((item) => item !== tag),
    }));
  };

  const handleHashtagKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addHashtag(hashtagInput);
      return;
    }

    if (
      event.key === 'Backspace' &&
      !hashtagInput &&
      form.hashtags.length > 0
    ) {
      removeHashtag(form.hashtags[form.hashtags.length - 1]);
    }
  };

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!form.categoryId) {
      errors.categoryId = 'Selecciona una categoría.';
    }

    (['side', 'counterpart'] as SideKey[]).forEach((sideKey) => {
      const side = form[sideKey];
      const label =
        sideKey === 'side' ? 'Postura (Lado A)' : 'Contrapostura (Lado B)';

      if (!side.title.trim()) {
        errors[`${sideKey}.title`] = `El título de ${label} es requerido.`;
      } else if (side.title.length > MAX_TITLE) {
        errors[`${sideKey}.title`] =
          `Máximo ${MAX_TITLE} caracteres.`;
      }

      if (!side.description.trim()) {
        errors[`${sideKey}.description`] =
          `El argumento de ${label} es requerido.`;
      } else if (side.description.trim().length < MIN_DESCRIPTION) {
        errors[`${sideKey}.description`] =
          `Mínimo ${MIN_DESCRIPTION} caracteres.`;
      }

      if (side.sources.length < 1) {
        errors[`${sideKey}.sources`] =
          `Agrega al menos una fuente en ${label}.`;
      }

      side.sources.forEach((source, index) => {
        if (!source.label.trim()) {
          errors[`${sideKey}.sources.${index}.label`] =
            'El título de la fuente es requerido.';
        }
        if (!source.url.trim() || !isValidUrl(source.url)) {
          errors[`${sideKey}.sources.${index}.url`] =
            'Ingresa una URL válida.';
        } else if (
          source.type === 'YOUTUBE' &&
          !getYouTubeId(source.url)
        ) {
          errors[`${sideKey}.sources.${index}.url`] =
            'Ingresa una URL válida de YouTube.';
        }
      });
    });

    return errors;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError('Revisa los campos marcados antes de continuar.');
      return;
    }

    if (!token) {
      navigate('/login', {
        replace: true,
        state: { from: location },
      });
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      categoryId: form.categoryId,
      side: {
        title: form.side.title.trim(),
        description: form.side.description.trim(),
        sources: form.side.sources.map((source) => ({
          type: source.type,
          url: source.url.trim(),
          label: source.label.trim(),
        })),
      },
      counterpart: {
        title: form.counterpart.title.trim(),
        description: form.counterpart.description.trim(),
        sources: form.counterpart.sources.map((source) => ({
          type: source.type,
          url: source.url.trim(),
          label: source.label.trim(),
        })),
      },
      hashtags: form.hashtags,
    };

    try {
      const endpoint =
        mode === 'edit' && viewId
          ? `${API_BASE}/views/${viewId}`
          : `${API_BASE}/views`;

      const response = await fetch(endpoint, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const details = Array.isArray(body?.details)
          ? body.details
              .map((item: any) => item?.message || item)
              .filter(Boolean)
              .join(' ')
          : '';
        throw new Error(
          details ||
            body?.error ||
            body?.message ||
            'No se pudo guardar la publicación.'
        );
      }

      const data = await response.json();
      const savedId = data?.view?.id ?? data?.id ?? viewId;

      if (!savedId) {
        throw new Error('La API no devolvió el id de la publicación.');
      }

      setBaseline(JSON.stringify(form));
      navigate(`/views/${savedId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al guardar la publicación.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      dirty &&
      !window.confirm(
        'Hay cambios sin guardar. ¿Deseas salir sin guardar los cambios?'
      )
    ) {
      return;
    }
    navigate(-1);
  };

  if (loadingView || loadingMeta) {
    return (
      <div className="view-form-page view-form-centered">
        <Loader2 className="view-form-spinner" />
        <p>Cargando formulario...</p>
      </div>
    );
  }

  if (mode === 'edit' && error && baseline === JSON.stringify(emptyForm())) {
    return (
      <div className="view-form-page view-form-centered">
        <p className="view-form-error-text">{error}</p>
        <button
          type="button"
          className="view-form-btn view-form-btn-secondary"
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
      </div>
    );
  }

  const renderSideSection = (
    sideKey: SideKey,
    title: string,
    accent: 'a' | 'b'
  ) => {
    const side = form[sideKey];

    return (
      <section className={`view-form-card view-form-side-${accent}`}>
        <header className="view-form-card-header">
          <span className={`view-form-badge view-form-badge-${accent}`}>
            {title}
          </span>
        </header>

        <div className="view-form-field">
          <label htmlFor={`${sideKey}-title`}>
            Título descriptivo *
          </label>
          <input
            id={`${sideKey}-title`}
            type="text"
            maxLength={MAX_TITLE}
            value={side.title}
            onChange={(event) =>
              updateSide(sideKey, { title: event.target.value })
            }
            placeholder="Ej. A favor del desarrollo libre"
          />
          <div className="view-form-counter">
            {side.title.length}/{MAX_TITLE}
          </div>
          {fieldErrors[`${sideKey}.title`] && (
            <p className="view-form-field-error">
              {fieldErrors[`${sideKey}.title`]}
            </p>
          )}
        </div>

        <div className="view-form-field">
          <label htmlFor={`${sideKey}-description`}>
            Argumento principal *
          </label>
          <textarea
            id={`${sideKey}-description`}
            rows={7}
            value={side.description}
            onChange={(event) =>
              updateSide(sideKey, {
                description: event.target.value,
              })
            }
            placeholder="Desarrolla el argumento de esta postura..."
          />
          <div
            className={`view-form-counter ${
              side.description.trim().length < MIN_DESCRIPTION
                ? 'is-warning'
                : 'is-ok'
            }`}
          >
            {side.description.trim().length}/{MIN_DESCRIPTION} mínimo
          </div>
          {fieldErrors[`${sideKey}.description`] && (
            <p className="view-form-field-error">
              {fieldErrors[`${sideKey}.description`]}
            </p>
          )}
        </div>

        <div className="view-form-sources">
          <div className="view-form-sources-header">
            <h3>Fuentes *</h3>
            <button
              type="button"
              className="view-form-link-btn"
              onClick={() => addSource(sideKey)}
            >
              <Plus size={14} />
              Agregar fuente
            </button>
          </div>

          {fieldErrors[`${sideKey}.sources`] && (
            <p className="view-form-field-error">
              {fieldErrors[`${sideKey}.sources`]}
            </p>
          )}

          {side.sources.map((source, index) => {
            const youtubeId =
              source.type === 'YOUTUBE'
                ? getYouTubeId(source.url)
                : null;

            return (
              <div key={`${sideKey}-source-${index}`} className="view-form-source">
                <div className="view-form-source-top">
                  <select
                    value={source.type}
                    onChange={(event) =>
                      updateSource(sideKey, index, {
                        type: event.target.value as SourceType,
                      })
                    }
                    aria-label="Tipo de fuente"
                  >
                    <option value="LINK">Enlace</option>
                    <option value="YOUTUBE">YouTube</option>
                    <option value="DOCUMENT">Documento</option>
                  </select>

                  <button
                    type="button"
                    className="view-form-icon-btn"
                    onClick={() => removeSource(sideKey, index)}
                    aria-label="Eliminar fuente"
                    disabled={side.sources.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="view-form-field">
                  <label>Título descriptivo *</label>
                  <div className="view-form-input-with-icon">
                    {source.type === 'YOUTUBE' ? (
                      <Video size={16} />
                    ) : source.type === 'DOCUMENT' ? (
                      <FileText size={16} />
                    ) : (
                      <LinkIcon size={16} />
                    )}
                    <input
                      type="text"
                      value={source.label}
                      onChange={(event) =>
                        updateSource(sideKey, index, {
                          label: event.target.value,
                        })
                      }
                      placeholder="Nombre de la fuente"
                    />
                  </div>
                  {fieldErrors[`${sideKey}.sources.${index}.label`] && (
                    <p className="view-form-field-error">
                      {fieldErrors[`${sideKey}.sources.${index}.label`]}
                    </p>
                  )}
                </div>

                <div className="view-form-field">
                  <label>URL *</label>
                  <input
                    type="url"
                    value={source.url}
                    onChange={(event) =>
                      updateSource(sideKey, index, {
                        url: event.target.value,
                      })
                    }
                    placeholder={
                      source.type === 'YOUTUBE'
                        ? 'https://www.youtube.com/watch?v=...'
                        : 'https://...'
                    }
                  />
                  {fieldErrors[`${sideKey}.sources.${index}.url`] && (
                    <p className="view-form-field-error">
                      {fieldErrors[`${sideKey}.sources.${index}.url`]}
                    </p>
                  )}
                </div>

                {youtubeId && (
                  <div className="view-form-youtube-preview">
                    <iframe
                      title={`Vista previa YouTube ${sideKey} ${index + 1}`}
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="view-form-page">
      <div className="view-form-container">
        <header className="view-form-header">
          <h1>
            {mode === 'create'
              ? 'Nueva publicación'
              : 'Editar publicación'}
          </h1>
          <p>
            Presenta ambas posturas con argumentos y fuentes
            independientes.
          </p>
        </header>

        {error && <div className="view-form-banner-error">{error}</div>}

        <form className="view-form" onSubmit={handleSubmit} noValidate>
          <section className="view-form-card">
            <div className="view-form-field">
              <label htmlFor="categoryId">Categoría *</label>
              <select
                id="categoryId"
                value={form.categoryId}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    categoryId: event.target.value,
                  }))
                }
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {fieldErrors.categoryId && (
                <p className="view-form-field-error">
                  {fieldErrors.categoryId}
                </p>
              )}
            </div>

            <div className="view-form-field">
              <label htmlFor="hashtag-input">Hashtags</label>
              <div className="view-form-tags">
                {form.hashtags.map((tag) => (
                  <span key={tag} className="view-form-chip">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      aria-label={`Quitar ${tag}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  id="hashtag-input"
                  type="text"
                  value={hashtagInput}
                  onChange={(event) =>
                    setHashtagInput(event.target.value.replace(/,/g, ''))
                  }
                  onKeyDown={handleHashtagKeyDown}
                  placeholder={
                    form.hashtags.length >= MAX_HASHTAGS
                      ? `Máximo ${MAX_HASHTAGS} hashtags`
                      : 'Escribe y presiona Enter o coma'
                  }
                  disabled={form.hashtags.length >= MAX_HASHTAGS}
                />
              </div>

              {filteredSuggestions.length > 0 && (
                <ul className="view-form-suggestions">
                  {filteredSuggestions.map((tag) => (
                    <li key={tag}>
                      <button
                        type="button"
                        onClick={() => addHashtag(tag)}
                      >
                        #{tag}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <div className="view-form-sides">
            {renderSideSection('side', 'Postura (Lado A)', 'a')}
            {renderSideSection(
              'counterpart',
              'Contrapostura (Lado B)',
              'b'
            )}
          </div>

          <div className="view-form-actions">
            <button
              type="button"
              className="view-form-btn view-form-btn-secondary"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="view-form-btn view-form-btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="view-form-spinner-sm" />
                  {mode === 'edit' ? 'Guardando...' : 'Publicando...'}
                </>
              ) : mode === 'edit' ? (
                'Guardar cambios'
              ) : (
                'Publicar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ViewForm;
