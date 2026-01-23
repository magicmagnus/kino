import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import TopSection from "../components/TopSection";
import BottomNavBar from "../components/BottomNavBar";
import SelectionButtonContainer from "../components/SelectionButtonContainer";
import Footer from "../components/Footer";
import TimelineGroup from "../components/TimelineGroup";
import SEOHead from "../components/SEOHead";
import { useScrollToEarliest } from "../hooks/useScrollToEarliest";

import { TODAY_FORMATTED } from "../utils/utils";
import CINEMA_LAYOUT from "../data/theaters-reference.json";
import movieViewData from "../data/movie-view.json";
import movieReference from "../data/movies-reference.json";

const FavoritesPage = () => {
    const { firstDate, setFirstDate, isMobile, showDate } = useOutletContext();

    const favoriteFilterButtons = null;

    return (
        <>
            <SEOHead
                title="Favoriten - Kinoschurke"
                description="Deine favorisierten Filme und Vorstellungen."
                url="https://kinoschurke.de/favorites"
            />
            <TopSection date={firstDate}>
                {/* Favorite filter buttons */}
                {!isMobile && favoriteFilterButtons}
            </TopSection>

            {/* Timeline Groups */}

            <div className="sticky left-0 flex min-h-[40vh] w-screen items-center justify-center">
                <div className="mx-10 text-center text-gray-400">
                    <i className="fa-regular fa-bookmark mb-4 text-6xl"></i>
                    <h3 className="mb-2 text-xl font-semibold">
                        Keine bevorstehenden Vorstellungen
                    </h3>
                    <p>
                        Wähle Filme oder einzelne Vorstellungen aus, um sie zu
                        Favoriten hinzuzufügen!
                    </p>
                </div>
            </div>

            <Footer />

            {isMobile && <BottomNavBar>{favoriteFilterButtons}</BottomNavBar>}
        </>
    );
};

export default FavoritesPage;
