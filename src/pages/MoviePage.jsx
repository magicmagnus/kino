import { useData } from "../contexts/DataContext";
import TopSection from "../components/TopSection";
import TimelineGroup from "../components/TimelineGroup";
import { Listbox } from "@headlessui/react";
import { useState, useEffect } from "react";
import {
    useOutletContext,
    useParams,
    Navigate,
    useNavigate,
} from "react-router-dom";
import { TODAY_FORMATTED } from "../utils/utils";
import { useScrollToEarliest } from "../hooks/useScrollToEarliest";
import MovieSelectionButton from "../components/MovieSelectionButton";
import SEOHead from "../components/SEOHead";

const MoviePage = () => {
    const { showCard, setShowCard, firstDate, setFirstDate } =
        useOutletContext();
    const { movieSlug } = useParams();
    const { data, loading, error } = useData();
    const navigate = useNavigate();

    // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
    const [selectedMovie, setSelectedMovie] = useState(null);

    // 1. Initialize selectedMovie after we have data
    useEffect(() => {
        if (data && data.movieView) {
            // If we have a movieSlug from URL, validate and use it
            if (movieSlug) {
                const validMovie = data.movieView.find(
                    (movie) => movie.slug === movieSlug,
                );
                if (validMovie) {
                    setSelectedMovie(movieSlug);
                } else {
                    // If movieSlug is invalid, redirect to first available movie
                    setSelectedMovie(data.movieView[0]?.slug);
                }
            } else {
                // If no movieSlug, use first available
                setSelectedMovie(data.movieView[0]?.slug);
            }
        }
    }, [data, movieSlug]);

    // 2. Update URL when selectedMovie changes
    useEffect(() => {
        if (selectedMovie && selectedMovie !== movieSlug) {
            navigate(`/movies/${selectedMovie}`, { replace: true });
        }
    }, [selectedMovie, movieSlug, navigate]);

    // 4. Call useScrollToEarliest hook here (before any returns)
    useScrollToEarliest([selectedMovie]);

    // NOW you can have conditional returns AFTER all hooks
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data || !data.movieView) return <div>No data available</div>;

    // ADD THIS CHECK: Wait for selectedMovie to be set
    if (!selectedMovie) return <div>Loading...</div>;

    const movieViewData = data.movieView;

    // Find the data for the selected movie
    const movieData = movieViewData.find(
        (movie) => movie.slug === selectedMovie,
    );

    // Add error handling for when movie is not found
    if (!movieData) {
        return <Navigate to={"/404/"} />;
    }

    // Filter out dates before today
    const filteredMovieData = {
        ...movieData,
        dates: movieData.dates.filter((date) => date.date >= TODAY_FORMATTED),
    };

    console.log("Movie data in MoviePage:", movieData);

    return (
        <>
            <SEOHead
                movieTitle={movieData.title}
                url={`https://kinoschurke.de/movies/${selectedMovie}`}
                movieSlug={selectedMovie}
            />
            <TopSection date={firstDate} movieData={movieData}>
                {/* Movie selection buttons */}
                {movieViewData.map((movie, movieIndex) => (
                    <MovieSelectionButton
                        key={movieIndex}
                        onClick={() => setSelectedMovie(movie.slug)}
                        selected={selectedMovie === movie.slug}
                        text={movie.title}
                        img={movie.posterUrl}
                    />
                ))}
            </TopSection>
            {/* All Timeline Groups */}
            {filteredMovieData.dates.map((date, dateIdx) => (
                <TimelineGroup
                    key={dateIdx}
                    groupElement={date}
                    groupElementIdx={dateIdx}
                    parentGroupType="date"
                    showCard={showCard}
                    setShowCard={setShowCard}
                    date={date.date}
                />
            ))}
        </>
    );
};

export default MoviePage;
