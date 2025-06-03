import movieViewData from "../data/movie-view.json";
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
    const navigate = useNavigate();

    const [selectedMovie, setSelectedMovie] = useState(
        movieSlug || movieViewData[0].slug,
    );

    // Update URL when selectedMovie changes
    useEffect(() => {
        if (selectedMovie && selectedMovie !== movieSlug) {
            navigate(`/movies/${selectedMovie}`, { replace: true });
        }
    }, [selectedMovie, movieSlug, navigate]);

    // Update selectedMovie when URL changes
    useEffect(() => {
        if (movieSlug && movieSlug !== selectedMovie) {
            setSelectedMovie(movieSlug);
        }
    }, [movieSlug]);

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

    useEffect(() => {
        if (filteredMovieData.dates.length > 0) {
            setFirstDate(filteredMovieData.dates[0].date);
        }
    }, [filteredMovieData.dates, setFirstDate]);

    useScrollToEarliest([selectedMovie]);

    return (
        <>
            <SEOHead
                movieTitle={movieData.title}
                url={`https://kinoschurke.de/movies/${selectedMovie}`}
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
