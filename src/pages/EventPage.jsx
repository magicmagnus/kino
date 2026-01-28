import { Navigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

// Data
import eventViewData from "../data/event-view.json";

// Components
import TopSection from "../components/TopSection";
import BottomNavBar from "../components/BottomNavBar";
import SelectionButtonContainer from "../components/SelectionButtonContainer";
import SelectionButton from "../components/SelectionButton";
import Footer from "../components/Footer";
import TimelineGroup from "../components/TimelineGroup";
import SEOHead from "../components/SEOHead";
import NoShowingsMessage from "../components/NoShowingsMessage";

// Hooks
import { usePageData } from "../hooks/usePageData";
import { useScrollToEarliest } from "../hooks/useScrollToEarliest";

// Utils
import { formatDateString } from "../utils/utils";

const EventPage = () => {
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
        rawData: eventViewData,
        pageType: "eventpage",
        basePath: "/events",
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
                <p>Keine Events verfügbar.</p>
            </div>
        );
    }

    // Selection buttons for events
    const eventSelectionButtons = (
        <SelectionButtonContainer
            filterAttributes={filterAttributes}
            setFilterAttributes={setFilterAttributes}
        >
            {upcomingData.map((event, index) => (
                <SelectionButton
                    key={index}
                    onClick={() => setSelectedOption(event.slug)}
                    selected={event.slug === selectedOption}
                    text={event.name}
                />
            ))}
        </SelectionButtonContainer>
    );

    return (
        <>
            <SEOHead
                eventName={displayData?.name}
                eventSlug={selectedOption}
                url={`https://kinoschurke.de/events/${selectedOption}`}
                showData={showData}
            />

            <TopSection date={firstDate} eventData={displayData}>
                {!isMobile && eventSelectionButtons}
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
                    selectedOption={displayData?.name || selectedOption}
                    filterAttributes={filterAttributes}
                    onClearFilters={() => setFilterAttributes([])}
                />
            )}

            <Footer isMobile={isMobile} />

            {isMobile && <BottomNavBar>{eventSelectionButtons}</BottomNavBar>}
        </>
    );
};

export default EventPage;
