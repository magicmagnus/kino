import movieViewData from "../data/movie-view.json";
import TopSection from "../components/TopSection";
import TimelineGroup from "../components/TimelineGroup";
import { Listbox } from "@headlessui/react";
import { useState, useEffect } from "react";
import { useOutletContext, useParams, Navigate } from "react-router-dom";
import { TODAY_FORMATTED } from "../utils/utils";
import { useScrollToEarliest } from "../hooks/useScrollToEarliest";
import MovieSelectionButton from "../components/MovieSelectionButton";

const MoviePage = () => {
    const { showCard, setShowCard, firstDate, setFirstDate } =
        useOutletContext();

    const { movieSlug } = useParams(); // Get movieslug from URL

    const [selectedMovie, setSelectedMovie] = useState(
        movieSlug || movieViewData[0].slug,
    );

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
            <TopSection date={firstDate} movieData={movieData}>
                {/* dropdown menu with "seach" btn aside */}
                {/* <Listbox value={selectedMovie} onChange={setSelectedMovie}>
                    {({ open }) => (
                        <>
                            <Listbox.Button className="z-20 flex h-fit w-full items-center justify-center rounded-md bg-rose-600 px-2 py-1 text-sm text-white shadow-lg transition-all duration-200 hover:bg-rose-800 sm:w-96">
                                <p>{movieData.title}</p>
                                <i
                                    className={`fa-solid transform pb-0.5 pl-2 transition-transform duration-200 ${open ? "fa-chevron-up" : "fa-chevron-down"}`}
                                ></i>
                            </Listbox.Button>
                            <Listbox.Options
                                className={
                                    "absolute left-0 right-0 top-0 z-10 m-2 max-h-[600px] w-[calc(100%-1rem)] overflow-auto rounded-md bg-rose-800 pt-8 text-center text-sm text-white shadow-lg sm:w-96"
                                }
                            >
                                {movieViewData.map((movie, movieIndex) => (
                                    <Listbox.Option
                                        key={movieIndex}
                                        value={movie.slug}
                                        className={({ active }) =>
                                            `cursor-pointer px-3 py-2 ${active ? "bg-rose-600" : "bg-rose-800"} `
                                        }
                                    >
                                        {movie.title}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </>
                    )}
                </Listbox> */}
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
