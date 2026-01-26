import movieViewData from "../data/movie-view.json";
import TopSection from "../components/TopSection";
import BottomNavBar from "../components/BottomNavBar";
import SelectionButtonContainer from "../components/SelectionButtonContainer";
import Footer from "../components/Footer";
import TimelineGroup from "../components/TimelineGroup";
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
    const { firstDate, setFirstDate, isMobile, showData } = useOutletContext();
    const { movieSlug } = useParams();
    const navigate = useNavigate();

    // Get all available movie slugs
    const allMovieSlugs = movieViewData.map((movie) => movie.slug);

    // Check if the movieSlug from URL is valid
    const isValidMovie = (slug) => {
        if (!slug) return false;
        return allMovieSlugs.includes(slug);
    };

    // Determine the valid movie to use - validate BEFORE setting state
    const validatedMovie = isValidMovie(movieSlug)
        ? movieSlug
        : allMovieSlugs[0];

    const [selectedMovie, setSelectedMovie] = useState(validatedMovie);

    // Sync URL with selectedMovie
    useEffect(() => {
        if (
            selectedMovie &&
            selectedMovie !== movieSlug &&
            isValidMovie(selectedMovie)
        ) {
            navigate(`/movies/${selectedMovie}`, { replace: true });
        }
    }, [selectedMovie]);

    // Sync selectedMovie with URL
    useEffect(() => {
        if (
            movieSlug &&
            movieSlug !== selectedMovie &&
            isValidMovie(movieSlug)
        ) {
            setSelectedMovie(movieSlug);
        }
    }, [movieSlug]);

    // Find the data for the selected movie
    const movieData = movieViewData.find(
        (movie) => movie.slug === selectedMovie,
    );

    // Filter out dates before today
    const filteredMovieData = movieData
        ? {
              ...movieData,
              dates: movieData.dates.filter(
                  (date) => date.date >= TODAY_FORMATTED,
              ),
          }
        : null;

    // Update firstDate when data changes
    useEffect(() => {
        if (filteredMovieData && filteredMovieData.dates.length > 0) {
            setFirstDate(filteredMovieData.dates[0].date);
        }
    }, [filteredMovieData?.dates, setFirstDate]);

    useScrollToEarliest([selectedMovie]);

    // Redirect if we landed on an invalid URL
    if (!isValidMovie(movieSlug) && movieSlug !== undefined) {
        if (allMovieSlugs.length > 0) {
            return <Navigate to={`/movies/${allMovieSlugs[0]}`} replace />;
        } else {
            return <Navigate to={`/movies/`} replace />;
        }
    }

    // Safety check - no data found
    if (!filteredMovieData) {
        return <Navigate to={`/movies/`} replace />;
    }

    const movieSelectionButtons = (
        <SelectionButtonContainer>
            {movieViewData.map((movie, movieIndex) => (
                <MovieSelectionButton
                    key={movieIndex}
                    onClick={() => setSelectedMovie(movie.slug)}
                    selected={selectedMovie === movie.slug}
                    text={movie.title}
                    img={movie.posterUrl}
                />
            ))}
        </SelectionButtonContainer>
    );

    return (
        <>
            <SEOHead
                movieTitle={movieData.title}
                url={`https://kinoschurke.de/movies/${selectedMovie}`}
                movieSlug={selectedMovie}
                showData={showData}
            />
            <TopSection date={firstDate} movieData={movieData}>
                {!isMobile && movieSelectionButtons}
            </TopSection>
            {filteredMovieData.dates.map((date, dateIdx) => (
                <TimelineGroup
                    key={dateIdx}
                    groupElement={date}
                    groupElementIdx={dateIdx}
                    parentGroupType="date"
                    date={date.date}
                />
            ))}

            <Footer isMobile={isMobile} isMoviePage={true} />

            {isMobile && <BottomNavBar>{movieSelectionButtons}</BottomNavBar>}
        </>
    );
};

export default MoviePage;
