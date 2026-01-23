import { useState, useEffect } from "react";
import { findShowById } from "../utils/showLookup";

export const useShowParameter = () => {
    const [showData, setShowData] = useState(null);

    useEffect(() => {
        const handleShowParameter = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const showParam = urlParams.get("show");

            if (showParam) {
                const foundShowData = findShowById(showParam);

                if (foundShowData) {
                    setShowData(foundShowData);
                } else {
                    // Invalid show param - remove it from URL
                    const url = new URL(window.location);
                    url.searchParams.delete("show");
                    window.history.replaceState(null, null, url.toString());
                    setShowData(null);
                }
            } else {
                setShowData(null);
            }
        };

        // Handle initial load
        handleShowParameter();

        // Listen for URL changes (including navigation)
        const handleLocationChange = () => {
            handleShowParameter();
        };

        // Listen for popstate events (back/forward navigation)
        window.addEventListener("popstate", handleLocationChange);

        // Also listen for pushstate/replacestate (programmatic navigation)
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function (...args) {
            originalPushState.apply(history, args);
            handleLocationChange();
        };

        history.replaceState = function (...args) {
            originalReplaceState.apply(history, args);
            handleLocationChange();
        };

        return () => {
            window.removeEventListener("popstate", handleLocationChange);
            history.pushState = originalPushState;
            history.replaceState = originalReplaceState;
        };
    }, []);

    return showData;
};

// Helper function to open a show modal (updates URL)
export const openShowModal = (show, movieId) => {
    const showId = show.iframeUrl.split("showId=")[1]?.split("&")[0] || movieId;
    const showParam = `${showId}-${show.time.split(":").join("-")}`;

    const url = new URL(window.location);
    url.searchParams.set("show", showParam);
    window.history.pushState(null, null, url.toString());
};

// Helper function to close the show modal (updates URL)
export const closeShowModal = () => {
    const url = new URL(window.location);
    url.searchParams.delete("show");
    window.history.pushState(null, null, url.toString());
};
