import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import {
    expandFavoritesToShowings,
    filterExpandedShowings,
    groupShowingsByDate,
    hasFavoriteShowings,
    getFavoritesForManagement,
    getAvailableAttributes,
} from "../utils/favoritesUtils";
import { formatDateString } from "../utils/utils";

// Data
import dateViewData from "../data/date-view.json";
import moviesReference from "../data/movies-reference.json";

// Components
import TopSection from "../components/TopSection";
import BottomNavBar from "../components/BottomNavBar";
import FavoriteSelectionContainer from "../components/FavoriteSelectionContainer";
import Footer from "../components/Footer";
import TimelineGroup from "../components/TimelineGroup";
import SEOHead from "../components/SEOHead";
import { useScrollToEarliest } from "../hooks/useScrollToEarliest";

const FavoritesPage = () => {
    const { isMobile, showData, filterAttributes, setFilterAttributes } =
        useOutletContext();
    const { favorites, removeFavorite, clearAllFavorites } = useFavorites();

    // Session state for hidden favorites (not persisted)
    const [hiddenFavorites, setHiddenFavorites] = useState(new Set());

    // Step 1: Expand favorites to actual showings (before any filtering)
    const expandedShowings = useMemo(
        () =>
            expandFavoritesToShowings(favorites, dateViewData, moviesReference),
        [favorites],
    );

    // Get available attributes for the filter modal (from all expanded showings)
    const availableAttributes = useMemo(
        () => getAvailableAttributes(expandedShowings),
        [expandedShowings],
    );

    // Get favorites for management panel (uses unfiltered expanded showings for counts)
    const { movieFavorites, showFavorites } = useMemo(
        () =>
            getFavoritesForManagement(
                favorites,
                expandedShowings,
                moviesReference,
            ),
        [favorites, expandedShowings],
    );

    // Step 2: Apply attribute filters
    const filteredShowings = useMemo(
        () => filterExpandedShowings(expandedShowings, filterAttributes),
        [expandedShowings, filterAttributes],
    );

    // Step 3: Filter out hidden favorites from display
    const visibleShowings = useMemo(() => {
        return filteredShowings.filter((showing) => {
            // Check if the movie is hidden
            if (hiddenFavorites.has(`movie-${showing.movieId}`)) {
                return false;
            }
            // Check if the specific show is hidden
            if (hiddenFavorites.has(`show-${showing.showHash}`)) {
                return false;
            }
            return true;
        });
    }, [filteredShowings, hiddenFavorites]);

    // Step 4: Group visible showings for timeline display
    const groupedData = useMemo(
        () => groupShowingsByDate(visibleShowings),
        [visibleShowings],
    );

    const hasShowings = hasFavoriteShowings(groupedData);
    const firstDate = groupedData[0]?.date || null;

    // Determine empty state reason
    const hasAnyFavorites = favorites.length > 0;
    const hasExpandedShowings = expandedShowings.length > 0;
    const hasFilteredShowings = filteredShowings.length > 0;
    const hasVisibleShowings = visibleShowings.length > 0;

    // Toggle hide/show for a favorite
    const handleToggleHide = (type, id) => {
        const key = `${type}-${id}`;
        setHiddenFavorites((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    // Remove a favorite
    const handleRemove = (type, id) => {
        removeFavorite(type, id);
        // Also remove from hidden if it was hidden
        const key = `${type}-${id}`;
        setHiddenFavorites((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
        });
    };

    // Show all hidden favorites
    const handleShowAll = () => {
        setHiddenFavorites(new Set());
    };

    // Clear all favorites (with confirmation)
    const handleClearAll = () => {
        if (
            window.confirm(
                "Möchtest du wirklich alle Favoriten löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
            )
        ) {
            clearAllFavorites();
            setHiddenFavorites(new Set());
        }
    };

    useScrollToEarliest([filterAttributes, hiddenFavorites]);

    // Selection container for the TopSection/BottomNavBar
    const favoriteSelectionContainer = (
        <FavoriteSelectionContainer
            movieFavorites={movieFavorites}
            showFavorites={showFavorites}
            hiddenFavorites={hiddenFavorites}
            onToggleHide={handleToggleHide}
            onRemove={handleRemove}
            onClearAll={handleClearAll}
            onShowAll={handleShowAll}
            // Filter props
            filterAttributes={filterAttributes}
            setFilterAttributes={setFilterAttributes}
            availableAttributes={availableAttributes}
        />
    );

    // Render empty state based on reason
    const renderEmptyState = () => {
        // No favorites at all
        if (!hasAnyFavorites) {
            return (
                <div className="sticky left-0 flex min-h-[400px] w-screen flex-col items-center justify-center gap-4 px-8 text-center">
                    <i className="fa-regular fa-bookmark text-5xl text-neutral-600"></i>
                    <p className="font-notoSans text-xl font-semibold text-neutral-300">
                        Keine Favoriten vorhanden
                    </p>
                    <p className="max-w-md font-notoSans text-neutral-500">
                        Klicke auf das Lesezeichen-Symbol bei einem Film oder
                        einer Vorstellung, um sie hier zu speichern und
                        schneller wiederzufinden.
                    </p>
                </div>
            );
        }

        // Favorites exist but no upcoming showings
        if (!hasExpandedShowings) {
            return (
                <div className="sticky left-0 flex min-h-[400px] w-screen flex-col items-center justify-center gap-4 px-8 text-center">
                    <i className="fa-solid fa-calendar-xmark text-5xl text-neutral-600"></i>
                    <p className="font-notoSans text-xl font-semibold text-neutral-300">
                        Keine kommenden Vorstellungen
                    </p>
                    <p className="max-w-md font-notoSans text-neutral-500">
                        Deine favorisierten Filme haben derzeit keine
                        anstehenden Vorstellungen.
                    </p>
                </div>
            );
        }

        // Showings exist but none match the filter
        if (!hasFilteredShowings) {
            return (
                <div className="sticky left-0 flex min-h-[400px] w-screen flex-col items-center justify-center gap-4 px-8 text-center">
                    <i className="fa-solid fa-filter-circle-xmark text-5xl text-neutral-600"></i>
                    <p className="font-notoSans text-xl font-semibold text-neutral-300">
                        Keine Ergebnisse für Filter
                    </p>
                    <p className="max-w-md font-notoSans text-neutral-500">
                        Keine deiner favorisierten Vorstellungen entspricht den
                        aktuellen Filtereinstellungen.
                    </p>
                    <button
                        onClick={() => setFilterAttributes([])}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-white transition-colors hover:bg-rose-500"
                    >
                        <i className="fa-solid fa-filter-circle-xmark mr-2"></i>
                        Filter zurücksetzen
                    </button>
                </div>
            );
        }

        // All filtered showings are hidden
        if (!hasVisibleShowings) {
            return (
                <div className="sticky left-0 flex min-h-[400px] w-screen flex-col items-center justify-center gap-4 px-8 text-center">
                    <i className="fa-solid fa-eye-slash text-5xl text-neutral-600"></i>
                    <p className="font-notoSans text-xl font-semibold text-neutral-300">
                        Alle Favoriten ausgeblendet
                    </p>
                    <p className="max-w-md font-notoSans text-neutral-500">
                        Du hast alle deine Favoriten temporär ausgeblendet.
                    </p>
                    <button
                        onClick={handleShowAll}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-white transition-colors hover:bg-rose-500"
                    >
                        <i className="fa-solid fa-eye mr-2"></i>
                        Alle einblenden
                    </button>
                </div>
            );
        }

        return null;
    };

    return (
        <>
            <SEOHead
                title="Favoriten - Kinoschurke"
                description="Deine gemerkten Filme und Vorstellungen"
                url="https://kinoschurke.de/favorites"
                showData={showData}
            />

            <TopSection date={firstDate}>
                {!isMobile && favoriteSelectionContainer}
            </TopSection>

            {/* Main Content */}
            {hasShowings
                ? // Timeline view
                  groupedData.map((dateEntry, dateIdx) => (
                      <TimelineGroup
                          key={dateIdx}
                          groupElement={dateEntry}
                          groupElementIdx={dateIdx}
                          parentGroupType="date"
                          date={dateEntry.date}
                      />
                  ))
                : // Empty state
                  renderEmptyState()}

            <Footer isMobile={isMobile} isFavoritePage={true} />

            {isMobile && (
                <BottomNavBar>{favoriteSelectionContainer}</BottomNavBar>
            )}
        </>
    );
};

export default FavoritesPage;
