//import dateViewData from "../data/date-view.json";
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
import { useData } from "../contexts/DataContext";

const DatePage = () => {
    const { showCard, setShowCard, firstDate, setFirstDate } =
        useOutletContext();
    const { dateSlug } = useParams();
    const { data, loading, error } = useData();
    const navigate = useNavigate();

    // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
    const [selectedDate, setSelectedDate] = useState(null);

    // 1. Initialize selectedDate after we have data
    useEffect(() => {
        if (data && data.dateView) {
            const upcomingDateData = data.dateView.filter(
                (date) => date.date >= TODAY_FORMATTED,
            );

            if (upcomingDateData.length > 0) {
                // If we have a dateSlug from URL, validate and use it
                if (dateSlug) {
                    const validDate = data.dateView.find(
                        (date) => date.date === dateSlug,
                    );
                    if (validDate) {
                        setSelectedDate(dateSlug);
                    } else {
                        // If dateSlug is invalid, redirect to first available date
                        setSelectedDate(upcomingDateData[0]?.date);
                    }
                } else {
                    // If no dateSlug, use first available
                    setSelectedDate(upcomingDateData[0]?.date);
                }
            }
        }
    }, [data, dateSlug]);

    // 2. Update URL when selectedDate changes (but not on initial load with dateSlug)
    useEffect(() => {
        if (selectedDate && selectedDate !== dateSlug) {
            navigate(`/dates/${selectedDate}`, { replace: true });
        }
    }, [selectedDate, dateSlug, navigate]);

    // 4. Call useScrollToEarliest hook here (before any returns)
    useScrollToEarliest([selectedDate]);

    // NOW you can have conditional returns AFTER all hooks
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data || !data.dateView) return <div>No data available</div>;

    // ADD THIS CHECK: Wait for selectedDate to be set
    if (!selectedDate) return <div>Loading...</div>;

    const dateViewData = data.dateView;

    // Filter out dates before today
    const upcomingDateData = dateViewData.filter(
        (date) => date.date >= TODAY_FORMATTED,
    );

    // Find the data for the selected date
    const filteredDateData = dateViewData.find(
        (date) => date.date === selectedDate,
    );

    // Add error handling for when date is not found or is in the past
    if (!filteredDateData || selectedDate < TODAY_FORMATTED) {
        return <Navigate to={"/404/"} />;
    }

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
                        text={formatDateString(date.date, true)}
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
