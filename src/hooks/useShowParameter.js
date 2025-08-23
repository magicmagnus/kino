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
                setShowData(foundShowData);
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
