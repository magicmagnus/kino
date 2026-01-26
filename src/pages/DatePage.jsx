import dateViewData from "../data/date-view.json";
import TopSection from "../components/TopSection";
import BottomNavBar from "../components/BottomNavBar";
import SelectionButtonContainer from "../components/SelectionButtonContainer";
import SelectionButton from "../components/SelectionButton";
import Footer from "../components/Footer";
import TimelineGroup from "../components/TimelineGroup";
import { useState, useEffect } from "react";
import {
    useOutletContext,
    useParams,
    Navigate,
    useNavigate,
} from "react-router-dom";
import { formatDateString, TODAY_FORMATTED } from "../utils/utils";
import { useScrollToEarliest } from "../hooks/useScrollToEarliest";
import SEOHead from "../components/SEOHead";

const DatePage = () => {
    const { firstDate, setFirstDate, isMobile, showData } = useOutletContext();
    const { dateSlug } = useParams();
    const navigate = useNavigate();

    // Filter out dates before today
    const upcomingDateData = dateViewData.filter(
        (date) => date.date >= TODAY_FORMATTED,
    );

    // Check if the dateSlug from URL is valid (exists in data and not in the past)
    const isValidDate = (date) => {
        if (!date || date < TODAY_FORMATTED) return false;
        return dateViewData.some((d) => d.date === date);
    };

    // Determine the valid date to use - validate BEFORE setting state
    const validatedDate = isValidDate(dateSlug)
        ? dateSlug
        : upcomingDateData[0]?.date;

    const [selectedDate, setSelectedDate] = useState(validatedDate);

    // Sync URL with selectedDate - only when user clicks a button (not from URL change)
    useEffect(() => {
        if (
            selectedDate &&
            selectedDate !== dateSlug &&
            isValidDate(selectedDate)
        ) {
            navigate(`/dates/${selectedDate}`, { replace: true });
        }
    }, [selectedDate]);

    // Sync selectedDate with URL - only when URL changes to a valid date
    useEffect(() => {
        if (dateSlug && dateSlug !== selectedDate && isValidDate(dateSlug)) {
            setSelectedDate(dateSlug);
        }
    }, [dateSlug]);

    // Find the data for the selected date
    const filteredDateData = dateViewData.find(
        (date) => date.date === selectedDate,
    );

    useScrollToEarliest([selectedDate]);

    // Redirect if we landed on an invalid URL (past date or non-existent)
    if (!isValidDate(dateSlug) && dateSlug !== undefined) {
        if (upcomingDateData.length > 0) {
            return (
                <Navigate to={`/dates/${upcomingDateData[0].date}`} replace />
            );
        } else {
            return <Navigate to={`/dates/`} replace />;
        }
    }

    // Safety check - shouldn't happen but just in case
    if (!filteredDateData) {
        return <Navigate to={`/dates/`} replace />;
    }

    const dateSelectionButtons = (
        <SelectionButtonContainer>
            {upcomingDateData
                .slice(0, 7) // Show only the next 7 days
                .map((date, dateIndex) => (
                    <SelectionButton
                        onClick={() => setSelectedDate(date.date)}
                        key={dateIndex}
                        selected={date.date === selectedDate}
                        text={formatDateString(date.date, true)}
                    />
                ))}
        </SelectionButtonContainer>
    );

    return (
        <>
            <SEOHead
                date={formatDateString(selectedDate)}
                url={`https://kinoschurke.de/dates/${selectedDate}`}
                showData={showData}
            />
            <TopSection date={selectedDate}>
                {/* Date buttons for Date View */}
                {!isMobile && dateSelectionButtons}
            </TopSection>
            {/* All Timeline Groups */}
            {filteredDateData.theaters.map((theater, theaterIdx) => (
                <TimelineGroup
                    key={theaterIdx}
                    groupElement={theater}
                    groupElementIdx={theaterIdx}
                    parentGroupType="theater"
                    date={selectedDate}
                />
            ))}

            <Footer isMobile={isMobile} />

            {isMobile && <BottomNavBar>{dateSelectionButtons}</BottomNavBar>}
        </>
    );
};

export default DatePage;
