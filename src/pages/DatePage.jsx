import { Navigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

// Data
import dateViewData from "../data/date-view.json";

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

const DatePage = () => {
    // Get shared state from MainLayout
    const { isMobile, showData, filterAttributes, setFilterAttributes } =
        useOutletContext();

    // Use the unified data hook
    const {
        upcomingData,
        availableOptions,
        selectedOption,
        displayData,
        hasShowings,
        firstDate,
        setSelectedOption,
        shouldRedirect,
        redirectPath,
    } = usePageData({
        rawData: dateViewData,
        pageType: "datepage",
        basePath: "/dates",
        filterAttributes,
    });

    // Scroll to earliest showing when selection or filters change
    useScrollToEarliest([selectedOption, filterAttributes]);

    // Handle redirect for invalid URLs
    if (shouldRedirect) {
        return <Navigate to={redirectPath} replace />;
    }

    // Handle case where no data is available at all
    if (!displayData && availableOptions.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center text-gray-400">
                <p>Keine Vorstellungen verfügbar.</p>
            </div>
        );
    }

    // Selection buttons for dates
    const dateSelectionButtons = (
        <SelectionButtonContainer
            filterAttributes={filterAttributes}
            setFilterAttributes={setFilterAttributes}
        >
            {upcomingData.map((dateItem, index) => (
                <SelectionButton
                    key={index}
                    onClick={() => setSelectedOption(dateItem.date)}
                    selected={dateItem.date === selectedOption}
                    text={formatDateString(dateItem.date, true)}
                />
            ))}
        </SelectionButtonContainer>
    );

    return (
        <>
            <SEOHead
                date={formatDateString(selectedOption)}
                url={`https://kinoschurke.de/dates/${selectedOption}`}
                showData={showData}
            />

            <TopSection date={selectedOption}>
                {!isMobile && dateSelectionButtons}
            </TopSection>

            {/* Main Content */}
            {hasShowings ? (
                displayData.theaters.map((theater, theaterIdx) => (
                    <TimelineGroup
                        key={theaterIdx}
                        groupElement={theater}
                        groupElementIdx={theaterIdx}
                        parentGroupType="theater"
                        date={selectedOption}
                    />
                ))
            ) : (
                <NoShowingsMessage
                    selectedOption={formatDateString(selectedOption)}
                    filterAttributes={filterAttributes}
                    onClearFilters={() => setFilterAttributes([])}
                />
            )}

            <Footer isMobile={isMobile} />

            {isMobile && <BottomNavBar>{dateSelectionButtons}</BottomNavBar>}
        </>
    );
};

export default DatePage;
