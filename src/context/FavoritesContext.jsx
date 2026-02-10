import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { TODAY_FORMATTED } from "../utils/utils";

const FAVORITES_KEY = "kinoschurke-favorites";

// Create the context
const FavoritesContext = createContext(null);

/**
 * FavoritesProvider - Provides favorites state to all children
 * Wrap your app (or MainLayout) with this provider
 */
export const FavoritesProvider = ({ children }) => {
    // =========================================================================
    // State: Load favorites from localStorage
    // =========================================================================
    const [favorites, setFavorites] = useState(() => {
        try {
            const stored = localStorage.getItem(FAVORITES_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error("Error loading favorites from localStorage:", error);
        }
        return [];
    });

    // =========================================================================
    // Persist to localStorage whenever favorites change
    // =========================================================================
    useEffect(() => {
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        } catch (error) {
            console.error("Error saving favorites to localStorage:", error);
        }
    }, [favorites]);

    // =========================================================================
    // Auto-cleanup: Remove expired show favorites on mount
    // =========================================================================
    useEffect(() => {
        const cleanedFavorites = favorites.filter((fav) => {
            if (fav.type === "show" && fav.date) {
                // Remove if date is in the past
                return fav.date >= TODAY_FORMATTED;
            }
            return true; // Keep movie favorites
        });

        if (cleanedFavorites.length !== favorites.length) {
            setFavorites(cleanedFavorites);
        }
    }, []); // Only run on mount

    // =========================================================================
    // Derived: Quick lookup sets for performance
    // =========================================================================
    const favoriteMovieIds = useMemo(() => {
        return new Set(
            favorites
                .filter((fav) => fav.type === "movie")
                .map((fav) => fav.movieId),
        );
    }, [favorites]);

    const favoriteShowHashes = useMemo(() => {
        return new Set(
            favorites
                .filter((fav) => fav.type === "show")
                .map((fav) => fav.showHash),
        );
    }, [favorites]);

    // =========================================================================
    // Check functions
    // =========================================================================
    const isMovieFavorite = useCallback(
        (movieId) => {
            return favoriteMovieIds.has(movieId);
        },
        [favoriteMovieIds],
    );

    const isShowFavorite = useCallback(
        (showHash) => {
            return favoriteShowHashes.has(showHash);
        },
        [favoriteShowHashes],
    );

    const isFavorited = useCallback(
        (movieId, showHash) => {
            return isMovieFavorite(movieId) || isShowFavorite(showHash);
        },
        [isMovieFavorite, isShowFavorite],
    );

    // =========================================================================
    // Toggle functions
    // =========================================================================
    const toggleMovieFavorite = useCallback((movieId) => {
        setFavorites((prev) => {
            const isCurrentlyFavorite = prev.some(
                (fav) => fav.type === "movie" && fav.movieId === movieId,
            );

            if (isCurrentlyFavorite) {
                return prev.filter(
                    (fav) => !(fav.type === "movie" && fav.movieId === movieId),
                );
            } else {
                // Add movie favorite AND remove any show favorites for this movie
                const withoutShowFavorites = prev.filter(
                    (fav) => !(fav.type === "show" && fav.movieId === movieId),
                );

                return [
                    ...withoutShowFavorites,
                    {
                        type: "movie",
                        movieId,
                        addedAt: new Date().toISOString(),
                    },
                ];
            }
        });
    }, []);

    const toggleShowFavorite = useCallback((showInfo) => {
        const { movieId, showHash, date } = showInfo;

        setFavorites((prev) => {
            // Check if the movie is already favorited
            const movieIsFavorite = prev.some(
                (fav) => fav.type === "movie" && fav.movieId === movieId,
            );

            if (movieIsFavorite) {
                return prev;
            }

            const isCurrentlyFavorite = prev.some(
                (fav) => fav.type === "show" && fav.showHash === showHash,
            );

            if (isCurrentlyFavorite) {
                return prev.filter(
                    (fav) =>
                        !(fav.type === "show" && fav.showHash === showHash),
                );
            } else {
                return [
                    ...prev,
                    {
                        type: "show",
                        movieId,
                        showHash,
                        date,
                        addedAt: new Date().toISOString(),
                    },
                ];
            }
        });
    }, []);

    // =========================================================================
    // Utility functions
    // =========================================================================
    const removeFavorite = useCallback((type, id) => {
        setFavorites((prev) => {
            if (type === "movie") {
                return prev.filter(
                    (fav) => !(fav.type === "movie" && fav.movieId === id),
                );
            } else {
                return prev.filter(
                    (fav) => !(fav.type === "show" && fav.showHash === id),
                );
            }
        });
    }, []);

    const clearAllFavorites = useCallback(() => {
        setFavorites([]);
    }, []);

    // =========================================================================
    // Context value
    // =========================================================================
    const value = useMemo(
        () => ({
            favorites,
            favoriteMovieIds,
            favoriteShowHashes,
            isMovieFavorite,
            isShowFavorite,
            isFavorited,
            toggleMovieFavorite,
            toggleShowFavorite,
            removeFavorite,
            clearAllFavorites,
        }),
        [
            favorites,
            favoriteMovieIds,
            favoriteShowHashes,
            isMovieFavorite,
            isShowFavorite,
            isFavorited,
            toggleMovieFavorite,
            toggleShowFavorite,
            removeFavorite,
            clearAllFavorites,
        ],
    );

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

/**
 * Hook to use favorites context
 * Must be used within a FavoritesProvider
 */
export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
};

export default FavoritesContext;
