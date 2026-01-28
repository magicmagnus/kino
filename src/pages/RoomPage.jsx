import { Navigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

// Data
import roomViewData from "../data/room-view.json";

// Components
import TopSection from "../components/TopSection";
import BottomNavBar from "../components/BottomNavBar";
import SelectionButtonContainer from "../components/SelectionButtonContainer";
import SelectionButton from "../components/SelectionButton";
import Footer from "../components/Footer";
import Timeline from "../components/Timeline";
import SEOHead from "../components/SEOHead";
import NoShowingsMessage from "../components/NoShowingsMessage";

// Hooks
import { usePageData } from "../hooks/usePageData";
import { useScrollToEarliest } from "../hooks/useScrollToEarliest";

// Utils
import { formatDateString } from "../utils/utils";

const RoomPage = () => {
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
        rawData: roomViewData,
        pageType: "roompage",
        basePath: "/rooms",
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
                <p>Keine Säle verfügbar.</p>
            </div>
        );
    }

    // Selection buttons for rooms (grouped by theater)
    const roomSelectionButtons = (
        <SelectionButtonContainer
            filterAttributes={filterAttributes}
            setFilterAttributes={setFilterAttributes}
        >
            {upcomingData.map((theater) =>
                theater.rooms.map((room, roomIndex) => (
                    <SelectionButton
                        key={`${theater.name}-${roomIndex}`}
                        onClick={() => setSelectedOption(room.slug)}
                        selected={room.slug === selectedOption}
                        text={room.name}
                    />
                )),
            )}
        </SelectionButtonContainer>
    );

    return (
        <>
            <SEOHead
                roomName={displayData?.name}
                url={`https://kinoschurke.de/rooms/${selectedOption}`}
                showData={showData}
            />

            <TopSection date={firstDate}>
                {!isMobile && roomSelectionButtons}
            </TopSection>

            {/* Main Content */}
            {hasShowings ? (
                displayData.dates.map((date, dateIdx) => (
                    <Timeline
                        key={dateIdx}
                        schedule={date}
                        scheduleIdx={dateIdx}
                        isFirst={dateIdx === 0}
                        isLast={dateIdx === displayData.dates.length - 1}
                        title={formatDateString(date.date, true)}
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

            {isMobile && <BottomNavBar>{roomSelectionButtons}</BottomNavBar>}
        </>
    );
};

export default RoomPage;
