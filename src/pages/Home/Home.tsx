// src/pages/Home/Home.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import { ViewCard, type ViewPost } from '../../components/ViewCard';

import {
  Filter,
  RefreshCw,
  LayoutGrid,
  Search,
  Sun,
  Moon,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  X,
  Share2,
  Plus,
} from 'lucide-react';

import {
  useNavigate,
  useSearchParams,
  useLocation,
  Link,
} from 'react-router-dom';

import './Home.css';

const API_BASE = 'http://localhost:3000/api';

interface Category {
  id: string;
  name: string;
}

interface Hashtag {
  id?: string;
  name: string;
}

interface ViewsListResponse {
  posts: ViewPost[];
  totalPages: number;
  total: number;
}

const mapApiViewToPost = (view: any): ViewPost => {
  const sides = Array.isArray(view?.sides) ? view.sides : [];
  const sideA = sides.find((side: any) => side.type === 'SIDE') ?? {};
  const sideB =
    sides.find((side: any) => side.type === 'COUNTERPART') ?? {};

  const titleA = sideA.title ?? '';
  const titleB = sideB.title ?? '';
  const descriptionA = sideA.description ?? '';

  return {
    id: String(view.id),
    title:
      titleA && titleB
        ? `${titleA} vs ${titleB}`
        : titleA || titleB || 'Publicación',
    summary: descriptionA
      ? `${descriptionA.slice(0, 180)}${descriptionA.length > 180 ? '…' : ''}`
      : '',
    categoryName: view.category?.name ?? '',
    categoryId: String(view.categoryId ?? view.category?.id ?? ''),
    authorName: view.author?.name ?? 'Autor',
    authorId: String(view.authorId ?? view.author?.id ?? ''),
    createdAt: view.createdAt ?? new Date().toISOString(),
    likesSideA: sideA.likeCount ?? 0,
    likesSideB: sideB.likeCount ?? 0,
    dislikesSideA: sideA.dislikeCount ?? 0,
    dislikesSideB: sideB.dislikeCount ?? 0,
    isFavorite: Boolean(view.isFavorite),
  };
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { user, token, isAuthenticated, logout } = useAuth();

  const selectedCategory =
    searchParams.get('category') ?? 'all';

  const selectedHashtag =
    searchParams.get('hashtag') ?? '';

  const selectedSort =
    searchParams.get('sort') ?? 'recent';

  const pageParam = Number(
    searchParams.get('page') ?? '1'
  );

  const page =
    Number.isFinite(pageParam) && pageParam > 0
      ? pageParam
      : 1;

  const [searchText, setSearchText] = useState(
    searchParams.get('q') ?? ''
  );

  const [hashtagInput, setHashtagInput] =
    useState('');

  const [profileMenuOpen, setProfileMenuOpen] =
    useState(false);

  const [isDark, setIsDark] = useState(true);

  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [hashtags, setHashtags] = useState<Hashtag[]>(
    []
  );

  const [favoriteIds, setFavoriteIds] =
    useState<Set<string>>(() => {
      if (typeof window === 'undefined') {
        return new Set();
      }

      try {
        const saved =
          window.localStorage.getItem(
            'lasdoscaras_favorites'
          );

        if (!saved) {
          return new Set();
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
          return new Set();
        }

        return new Set(parsed.map(String));
      } catch {
        return new Set();
      }
    });

  const [shareMessage, setShareMessage] =
    useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const savedTheme =
      window.localStorage.getItem(
        'lasdoscaras_theme'
      );

    const dark = savedTheme !== 'light';

    setIsDark(dark);

    document.documentElement.classList.toggle(
      'dark',
      dark
    );
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;

    setIsDark(nextDark);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        'lasdoscaras_theme',
        nextDark ? 'dark' : 'light'
      );
    }

    document.documentElement.classList.toggle(
      'dark',
      nextDark
    );
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      'lasdoscaras_favorites',
      JSON.stringify(Array.from(favoriteIds))
    );
  }, [favoriteIds]);

  useEffect(() => {
    if (!isAuthenticated) {
      setProfileMenuOpen(false);
    }
  }, [isAuthenticated]);

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();

    params.set('page', String(page));
    params.set('limit', '6');

    if (
      selectedCategory &&
      selectedCategory !== 'all'
    ) {
      params.set(
        'category',
        selectedCategory
      );
    }

    if (selectedHashtag) {
      params.set(
        'hashtag',
        selectedHashtag
      );
    }

    const sort =
      selectedSort === 'likes' || selectedSort === 'dislikes'
        ? selectedSort
        : 'recent';

    params.set('sort', sort);

    return `${API_BASE}/views?${params.toString()}`;
  }, [
    page,
    selectedCategory,
    selectedHashtag,
    selectedSort,
  ]);

  const {
    data,
    loading,
    error,
    refetch,
  } = useFetch<ViewsListResponse>(
    async () => {
      const res = await fetch(endpoint, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      });

      if (!res.ok) {
        throw new Error(
          'Error al cargar las publicaciones.'
        );
      }

      const payload = await res.json();
      const views = Array.isArray(payload?.views)
        ? payload.views
        : Array.isArray(payload)
          ? payload
          : [];

      const total = Number(payload?.total ?? views.length);
      const limit = Number(payload?.limit ?? 6);
      const totalPages = Math.max(1, Math.ceil(total / limit));

      return {
        posts: views.map(mapApiViewToPost),
        total,
        totalPages,
      };
    },
    [endpoint, token]
  );

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const response =
          await fetch(`${API_BASE}/categories`);

        if (!response.ok) {
          throw new Error(
            'No se pudieron cargar las categorías.'
          );
        }

        const result = await response.json();

        const list = Array.isArray(result)
          ? result
          : Array.isArray(result.categories)
            ? result.categories
            : [];

        const normalized = list.map(
          (category: any) => ({
            id: String(category.id),
            name:
              category.name ??
              category.categoryName ??
              '',
          })
        );

        if (!cancelled) {
          setCategories(normalized);
        }
      } catch (err) {
        console.error(
          'Error cargando categorías:',
          err
        );
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHashtags = async () => {
      try {
        const response =
          await fetch(`${API_BASE}/hashtags`);

        if (!response.ok) {
          throw new Error(
            'No se pudieron cargar los hashtags.'
          );
        }

        const result = await response.json();



        const list = Array.isArray(result)

          ? result

          : Array.isArray(result.hashtags)

          ? result.hashtags

          : [];

        const normalized = list.map(
          (hashtag: any) => ({
            id:
              hashtag.id !== undefined
                ? String(hashtag.id)
                : undefined,

            name:
              typeof hashtag === 'string'
                ? hashtag
                : hashtag.name ??
                hashtag.tag ??
                '',
          })
        );

        if (!cancelled) {
          setHashtags(
            normalized.filter(
              (item: Hashtag) =>
                Boolean(item.name)
            )
          );
        }
      } catch (err) {
        console.error(
          'Error cargando hashtags:',
          err
        );
      }
    };

    loadHashtags();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const trimmed = searchText.trim();

    if (!trimmed) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSearchParams(
        (previous) => {
          const next =
            new URLSearchParams(previous);

          next.set('q', trimmed);

          return next;
        },
        {
          replace: true,
        }
      );
    }, 300);

    return () =>
      window.clearTimeout(timeout);
  }, [
    searchText,
    setSearchParams,
  ]);

  const updateFilter = (
    key: string,
    value: string
  ) => {
    setSearchParams((previous) => {
      const next =
        new URLSearchParams(previous);

      if (
        !value ||
        (key === 'category' &&
          value === 'all')
      ) {
        next.delete(key);
      } else {
        next.set(key, value);
      }

      next.set('page', '1');

      return next;
    });
  };

  const changePage = (
    nextPage: number
  ) => {
    setSearchParams((previous) => {
      const next =
        new URLSearchParams(previous);

      next.set(
        'page',
        String(nextPage)
      );

      return next;
    });
  };

  const addHashtag = (
    hashtag: string
  ) => {
    const clean =
      hashtag
        .trim()
        .replace(/^#/, '');

    if (!clean) {
      return;
    }

    updateFilter(
      'hashtag',
      clean
    );

    setHashtagInput('');
  };

  const removeHashtag = () => {
    updateFilter(
      'hashtag',
      ''
    );
  };

  const toggleFavorite = async (
    postId: string
  ) => {
    if (!isAuthenticated || !token) {
      navigate('/login', {
        state: { from: location },
      });
      return;
    }

    const currentlyFavorite =
      favoriteIds.has(postId);

    setFavoriteIds((previous) => {
      const next = new Set(previous);

      if (currentlyFavorite) {
        next.delete(postId);
      } else {
        next.add(postId);
      }

      return next;
    });

    try {
      const response =
        await fetch(
          `${API_BASE}/views/${postId}/favorite`,
          {
            method:
              currentlyFavorite
                ? 'DELETE'
                : 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        throw new Error(
          'No se pudo actualizar el favorito.'
        );
      }
    } catch (err) {
      setFavoriteIds((previous) => {
        const next = new Set(previous);

        if (currentlyFavorite) {
          next.add(postId);
        } else {
          next.delete(postId);
        }

        return next;
      });

      console.error(
        'Error actualizando favorito:',
        err
      );
    }
  };

  const sharePost = async (
    postId: string
  ) => {
    const url =
      `${window.location.origin}/views/${postId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Las Dos Caras',
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(
        url
      );

      setShareMessage(
        'Enlace copiado'
      );

      window.setTimeout(() => {
        setShareMessage(null);
      }, 2000);
    } catch (err) {
      console.error(
        'No se pudo compartir:',
        err
      );
    }
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    const query =
      searchText.trim();

    if (!query) {
      return;
    }

    navigate(
      `/search?q=${encodeURIComponent(
        query
      )}`
    );
  };

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
  };

  const posts =
    data?.posts?.map((post) => ({
      ...post,
      isFavorite:
        isAuthenticated &&
        (favoriteIds.has(post.id) || Boolean(post.isFavorite)),
    })) ?? [];

  useEffect(() => {
    if (!data?.posts?.length || !isAuthenticated) {
      return;
    }

    setFavoriteIds((previous) => {
      const next = new Set(previous);
      data.posts.forEach((post) => {
        if (post.isFavorite) {
          next.add(post.id);
        }
      });
      return next;
    });
  }, [data, isAuthenticated]);

  return (
    <div
      className={`home-page ${isDark
        ? 'home-dark'
        : 'home-light'
        }`}
    >
      {/* ================= NAVBAR ================= */}

      <nav className="home-navbar">
        <div className="home-navbar-inner">

          {/* Logo */}

          <Link
            to="/"
            className="home-logo"
          >
            <div className="home-logo-icon">
              <LayoutGrid />
            </div>

            <span>
              Las Dos Caras
            </span>
          </Link>

          {/* Categorías */}

          <Link
            to="/categories/:id"
            className="home-categories-link"
          >
            Categorías
          </Link>

          {/* Buscador */}

          <div className="home-search">
            <Search />

            <input
              type="search"
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
              onKeyDown={
                handleSearchKeyDown
              }
              placeholder="Buscar publicaciones..."
            />
          </div>

          {/* Acciones */}

          <div className="home-actions">

            {/* Tema */}

            <button
              type="button"
              onClick={toggleTheme}
              className="home-icon-button"
              title={
                isDark
                  ? 'Cambiar a tema claro'
                  : 'Cambiar a tema oscuro'
              }
            >
              {isDark ? (
                <Sun />
              ) : (
                <Moon />
              )}
            </button>

            {!isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    navigate('/login')
                  }
                  className="home-login-button"
                >
                  <LogIn />
                  Iniciar sesión
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate('/register')
                  }
                  className="home-register-button"
                >
                  <UserPlus />
                  Registro
                </button>
              </>
            ) : (
              <div className="home-profile">

                <button
                  type="button"
                  onClick={() =>
                    setProfileMenuOpen(
                      (open) => !open
                    )
                  }
                  className="home-profile-button"
                >
                  <span>
                    {user?.name}
                  </span>

                  <ChevronDown />
                </button>

                {profileMenuOpen && (
                  <div className="home-profile-menu">

                    {user && (
                      <Link
                        to="/profile"
                        onClick={() =>
                          setProfileMenuOpen(
                            false
                          )
                        }
                      >
                        Perfil
                      </Link>
                    )}

                    {user && (
                      <Link
                        to={`/authors/${user.id}`}
                        onClick={() =>
                          setProfileMenuOpen(
                            false
                          )
                        }
                      >
                        Mis publicaciones
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                    >
                      <LogOut />
                      Cerrar sesión
                    </button>

                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ================= CONTENIDO ================= */}

      <main className="home-main">

        {/* Encabezado */}

        <header className="home-heading">

          <div>
            <h1>
              <LayoutGrid />
              Tablero Principal
            </h1>

            <p>
              Explora opiniones, debates y
              contraposturas en tiempo real.
            </p>
          </div>

          <button
            type="button"
            className="home-create-button home-create-button-main"
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login', {
                  state: { from: { pathname: '/views/new' } },
                });
                return;
              }
              navigate('/views/new');
            }}
          >
            <Plus />
            Crear publicación
          </button>

        </header>

        {/* ================= FILTROS ================= */}

        <section className="home-filters">

          {/* Categoría */}

          <div className="home-filter-item">

            <Filter />

            <select
              value={
                selectedCategory
              }
              onChange={(event) =>
                updateFilter(
                  'category',
                  event.target.value
                )
              }
            >
              <option value="all">
                Todas las categorías
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>

          </div>

          {/* Hashtag */}

          <div className="home-hashtag">

            <input
              type="text"
              value={hashtagInput}
              onChange={(event) =>
                setHashtagInput(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  'Enter'
                ) {
                  event.preventDefault();

                  addHashtag(
                    hashtagInput
                  );
                }
              }}
              placeholder="Buscar por hashtag y presiona Enter..."
            />

            {hashtagInput.trim() &&
              hashtags.length > 0 && (
                <div className="home-hashtag-suggestions">

                  {hashtags
                    .filter(
                      (hashtag) =>
                        hashtag.name
                          .toLowerCase()
                          .includes(
                            hashtagInput
                              .trim()
                              .replace(
                                /^#/,
                                ''
                              )
                              .toLowerCase()
                          )
                    )
                    .slice(0, 8)
                    .map(
                      (hashtag) => (
                        <button
                          key={
                            hashtag.id ??
                            hashtag.name
                          }
                          type="button"
                          onClick={() =>
                            addHashtag(
                              hashtag.name
                            )
                          }
                        >
                          #
                          {
                            hashtag.name
                          }
                        </button>
                      )
                    )}

                </div>
              )}

            {selectedHashtag && (
              <div className="home-active-hashtag">
                <span>
                  #
                  {
                    selectedHashtag
                  }

                  <button
                    type="button"
                    onClick={
                      removeHashtag
                    }
                    title="Eliminar hashtag"
                  >
                    <X />
                  </button>
                </span>
              </div>
            )}

          </div>

          {/* Ordenamiento */}

          <div className="home-filter-item">

            <select
              value={selectedSort}
              onChange={(event) =>
                updateFilter(
                  'sort',
                  event.target.value
                )
              }
            >
              <option value="recent">
                Más recientes
              </option>

              <option value="likes">
                Más likes
              </option>

              <option value="dislikes">
                Más dislikes
              </option>
            </select>

          </div>

        </section>

        {/* ================= CARGANDO ================= */}

        {loading && (
          <div className="home-post-grid">

            {[1, 2, 3, 4, 5, 6].map(
              (i) => (
                <div
                  key={i}
                  className="home-loading-card"
                />
              )
            )}

          </div>
        )}

        {/* ================= ERROR ================= */}

        {error && (
          <div className="home-error">

            <p>
              Ocurrió un error al cargar
              las publicaciones.
            </p>

            <button
              onClick={refetch}
            >
              <RefreshCw />
              Reintentar
            </button>

          </div>
        )}

        {/* ================= PUBLICACIONES ================= */}

        {!loading &&
          !error && (
            <>
              {posts.length === 0 ? (
                <div className="home-empty">
                  <LayoutGrid />

                  <p>
                    No hay publicaciones
                    disponibles en esta
                    sección.
                  </p>
                </div>
              ) : (
                <div className="home-post-grid">

                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className="home-post-wrapper"
                    >

                      <ViewCard
                        post={post}
                        onToggleFavorite={toggleFavorite}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          sharePost(
                            post.id
                          )
                        }
                        title="Compartir"
                        className="home-share-button"
                      >
                        <Share2 />
                      </button>

                    </article>
                  ))}

                </div>
              )}

              {/* ================= PAGINACIÓN ================= */}

              {data &&
                data.totalPages > 1 && (
                  <div className="home-pagination">

                    <button
                      disabled={
                        page === 1
                      }
                      onClick={() =>
                        changePage(
                          page - 1
                        )
                      }
                    >
                      Anterior
                    </button>

                    <span>
                      Página {page} de{' '}
                      {
                        data.totalPages
                      }
                    </span>

                    <button
                      disabled={
                        page ===
                        data.totalPages
                      }
                      onClick={() =>
                        changePage(
                          page + 1
                        )
                      }
                    >
                      Siguiente
                    </button>

                  </div>
                )}
            </>
          )}

      </main>

      {/* ================= MENSAJE ================= */}

      {shareMessage && (
        <div className="home-share-message">
          {shareMessage}
        </div>
      )}

    </div>
  );
};