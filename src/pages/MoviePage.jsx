import { Navigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

// Data
import movieViewData from "../data/movie-view.json";

// Components
import TopSection from "../components/TopSection";
import BottomNavBar from "../components/BottomNavBar";
import SelectionButtonContainer from "../components/SelectionButtonContainer";
import MovieSelectionButton from "../components/MovieSelectionButton";
import Footer from "../components/Footer";
import TimelineGroup from "../components/TimelineGroup";
import SEOHead from "../components/SEOHead";
import NoShowingsMessage from "../components/NoShowingsMessage";

// Hooks
import { usePageData } from "../hooks/usePageData";
import { useScrollToEarliest } from "../hooks/useScrollToEarliest";

// Utils
import { formatDateString } from "../utils/utils";

const MoviePage = () => {
    // Get shared state from MainLayout
    const { isMobile, showData, filterAttributes, setFilterAttributes } =
        useOutletContext();

    // Use the unified data hook
    const {
        upcomingData,
        selectedOption,
        displayData,
        hasShowings,
        firstDate,
        setSelectedOption,
        shouldRedirect,
        redirectPath,
    } = usePageData({
        rawData: movieViewData,
        pageType: "moviepage",
        basePath: "/movies",
        filterAttributes,
    });

    // Scroll to earliest showing when selection or filters change
    useScrollToEarliest([selectedOption, filterAttributes]);

    // Handle redirect for invalid URLs
    if (shouldRedirect) {
        return <Navigate to={redirectPath} replace />;
    }

    // Handle case where no data is available at all
    if (!displayData && upcomingData.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center text-gray-400">
                <p>Keine Filme verfügbar.</p>
            </div>
        );
    }

    // Selection buttons for movies
    const movieSelectionButtons = (
        <SelectionButtonContainer
            filterAttributes={filterAttributes}
            setFilterAttributes={setFilterAttributes}
        >
            {upcomingData.map((movie, index) => (
                <MovieSelectionButton
                    key={index}
                    onClick={() => setSelectedOption(movie.slug)}
                    selected={movie.slug === selectedOption}
                    text={movie.title}
                    img={movie.posterUrl}
                />
            ))}
        </SelectionButtonContainer>
    );

    return (
        <>
            <SEOHead
                movieTitle={displayData?.title}
                movieSlug={selectedOption}
                url={`https://kinoschurke.de/movies/${selectedOption}`}
                showData={showData}
            />

            <TopSection date={firstDate} movieData={displayData}>
                {!isMobile && movieSelectionButtons}
            </TopSection>

            {/* Main Content */}
            {hasShowings ? (
                displayData.dates.map((date, dateIdx) => (
                    <TimelineGroup
                        key={dateIdx}
                        groupElement={date}
                        groupElementIdx={dateIdx}
                        parentGroupType="date"
                        date={date.date}
                    />
                ))
            ) : (
                <NoShowingsMessage
                    selectedOption={displayData?.title || selectedOption}
                    filterAttributes={filterAttributes}
                    onClearFilters={() => setFilterAttributes([])}
                />
            )}

            <Footer isMobile={isMobile} isMoviePage={true} />

            {isMobile && <BottomNavBar>{movieSelectionButtons}</BottomNavBar>}
        </>
    );
};

export default MoviePage;
