// src/services/dataService.js
import { KinoheldDataTransformer } from "./dataTransformer";

class DataService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async fetchLiveData() {
        const cacheKey = "kinoheld-data";
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch("/.netlify/functions/api-proxy");
            if (!response.ok) throw new Error("Failed to fetch data");

            const rawData = await response.json();

            // Transform the data to match your current structure
            const transformedData = {
                dateView: KinoheldDataTransformer.transformToDateView(rawData),
                roomView: KinoheldDataTransformer.transformToRoomView(rawData),
                movieView:
                    KinoheldDataTransformer.transformToMovieView(rawData),
                moviesReference:
                    KinoheldDataTransformer.createMovieReference(rawData),
                rawData,
            };

            this.cache.set(cacheKey, {
                data: transformedData,
                timestamp: Date.now(),
            });

            return transformedData;
        } catch (error) {
            console.error("Failed to fetch live data:", error);
            // Fallback to static data if available
            return this.getFallbackData();
        }
    }

    async getFallbackData() {
        // Import your current static JSON files as fallback
        const [dateView, roomView, movieView, moviesReference] =
            await Promise.all([
                import("../data/date-view.json").then((m) => m.default),
                import("../data/room-view.json").then((m) => m.default),
                import("../data/movie-view.json").then((m) => m.default),
                import("../data/movies-reference.json").then((m) => m.default),
            ]);

        return { dateView, roomView, movieView, moviesReference };
    }
}

export const dataService = new DataService();
