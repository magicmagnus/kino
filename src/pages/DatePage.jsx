import dateViewData from "../data/date-view.json";
import TopSection from "../components/TopSection";
import SelectionButton from "../components/SelectionButton";
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
    const { showCard, setShowCard, firstDate, setFirstDate } =
        useOutletContext();
    const { dateSlug } = useParams();
    const navigate = useNavigate();

    // Filter out dates before today
    const upcomingDateData = dateViewData.filter(
        (date) => date.date >= TODAY_FORMATTED,
    );

    const [selectedDate, setSelectedDate] = useState(
        dateSlug || upcomingDateData[0]?.date,
    );

    // Update URL when selectedDate changes
    useEffect(() => {
        if (selectedDate && selectedDate !== dateSlug) {
            navigate(`/dates/${selectedDate}`, { replace: true });
        }
    }, [selectedDate, dateSlug, navigate]);

    // Update selectedDate when URL changes
    useEffect(() => {
        if (dateSlug && dateSlug !== selectedDate) {
            setSelectedDate(dateSlug);
        }
    }, [dateSlug]);

    // Find the data for the selected date
    const filteredDateData = dateViewData.find(
        (date) => date.date === selectedDate,
    );

    // Add error handling for when date is not found or is in the past
    if (!filteredDateData || selectedDate < TODAY_FORMATTED) {
        return <Navigate to={"/404/"} />;
    }

    useScrollToEarliest([selectedDate]);

    return (
        <>
            <SEOHead
                date={formatDateString(selectedDate)}
                url={`https://kinoschurke.de/dates/${selectedDate}`}
            />
            <TopSection date={selectedDate}>
                {/* Date buttons for Date View */}
                {upcomingDateData.slice(0, 7).map((date, dateIndex) => (
                    <SelectionButton
                        onClick={() => setSelectedDate(date.date)}
                        key={dateIndex}
                        selected={date.date === selectedDate}
                        text={formatDateString(date.date)}
                    />
                ))}
            </TopSection>
            {/* All Timeline Groups */}
            {filteredDateData.theaters.map((theater, theaterIdx) => (
                <TimelineGroup
                    key={theaterIdx}
                    groupElement={theater}
                    groupElementIdx={theaterIdx}
                    parentGroupType="theater"
                    showCard={showCard}
                    setShowCard={setShowCard}
                    date={selectedDate}
                />
            ))}
        </>
    );
};

export default DatePage;
