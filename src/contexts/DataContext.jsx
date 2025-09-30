import React, { createContext, useContext, useState, useEffect } from "react";
import { KinoheldDataTransformer } from "../services/dataTransformer";

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchLiveData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch from your Netlify function
            const response = await fetch("/.netlify/functions/api-proxy");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const rawData = await response.json();
            //console.log("Raw API data:", rawData);

            // Transform the data to match your current structure
            const transformedData = {
                dateView: KinoheldDataTransformer.transformToDateView(rawData),
                roomView: KinoheldDataTransformer.transformToRoomView(rawData),
                movieView:
                    KinoheldDataTransformer.transformToMovieView(rawData),
                eventView:
                    KinoheldDataTransformer.transformToEventView(rawData),
                moviesReference:
                    KinoheldDataTransformer.transformMoviesReference(rawData),
                showLookup: KinoheldDataTransformer.createShowLookup(rawData),
                rawData,
            };

            console.log("Transformed data:", transformedData);
            setData(transformedData);
            setLastUpdated(new Date());
            console.log("Live data fetched and transformed successfully");
        } catch (err) {
            console.error("Failed to fetch live data:", err);
            setError(err.message);

            // Fallback to static data
            try {
                const fallbackData = await getFallbackData();
                setData(fallbackData);
                console.log("Using fallback data");
            } catch (fallbackErr) {
                console.error("Fallback data also failed:", fallbackErr);
            }
        } finally {
            setLoading(false);
        }
    };

    const getFallbackData = async () => {
        try {
            // Import your current static JSON files as fallback
            const [
                dateView,
                roomView,
                movieView,
                eventView,
                moviesReference,
                showLookup,
            ] = await Promise.all([
                import("../data/date-view.json").then((m) => m.default),
                import("../data/room-view.json").then((m) => m.default),
                import("../data/movie-view.json").then((m) => m.default),
                import("../data/event-view.json").then((m) => m.default),
                import("../data/movies-reference.json").then((m) => m.default),
                import("../data/show-lookup.json").then((m) => m.default),
            ]);

            return {
                dateView,
                roomView,
                movieView,
                eventView,
                moviesReference,
                showLookup,
            };
        } catch (err) {
            console.error("Failed to load fallback data:", err);
            throw err;
        }
    };

    useEffect(() => {
        fetchLiveData();

        // Set up periodic refresh (every 10 minutes)
        const interval = setInterval(fetchLiveData, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const refreshData = () => {
        fetchLiveData();
    };

    return (
        <DataContext.Provider
            value={{
                data,
                loading,
                error,
                lastUpdated,
                refreshData,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};
