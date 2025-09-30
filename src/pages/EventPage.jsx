import { useData } from "../contexts/DataContext";
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
import { TODAY_FORMATTED } from "../utils/utils";
import { useScrollToEarliest } from "../hooks/useScrollToEarliest";
import SEOHead from "../components/SEOHead";

const EventPage = () => {
    const { showCard, setShowCard, firstDate, setFirstDate } =
        useOutletContext();
    const { eventSlug } = useParams();
    const { data, loading, error } = useData();
    const navigate = useNavigate();

    // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
    const [selectedEvent, setSelectedEvent] = useState(null);

    // 1. Initialize selectedEvent after we have data
    useEffect(() => {
        if (data && data.eventView) {
            // If we have an eventSlug from URL, validate and use it
            if (eventSlug) {
                const validEvent = data.eventView.find(
                    (event) => event.slug === eventSlug,
                );
                if (validEvent) {
                    setSelectedEvent(eventSlug);
                } else {
                    // If eventSlug is invalid, redirect to first available event
                    setSelectedEvent(data.eventView[0]?.slug);
                }
            } else {
                // If no eventSlug, use first available
                setSelectedEvent(data.eventView[0]?.slug);
            }
        }
    }, [data, eventSlug]);

    // 2. Update URL when selectedEvent changes
    useEffect(() => {
        if (selectedEvent && selectedEvent !== eventSlug) {
            navigate(`/events/${selectedEvent}`, { replace: true });
        }
    }, [selectedEvent, eventSlug, navigate]);

    // 4. Call useScrollToEarliest hook here (before any returns)
    useScrollToEarliest([selectedEvent]);

    // NOW you can have conditional returns AFTER all hooks
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data || !data.eventView) return <div>No data available</div>;

    // ADD THIS CHECK: Wait for selectedEvent to be set
    if (!selectedEvent) return <div>Loading...</div>;

    const eventViewData = data.eventView;

    // Find the data for the selected event
    const eventData = eventViewData.find(
        (event) => event.slug === selectedEvent,
    );

    // Add error handling for when event is not found
    if (!eventData) {
        return <Navigate to={"/404/"} />;
    }

    // Filter out dates before today
    const filteredEventData = {
        ...eventData,
        dates: eventData.dates.filter((date) => date.date >= TODAY_FORMATTED),
    };

    return (
        <>
            <SEOHead
                eventName={eventData.name}
                url={`https://kinoschurke.de/events/${selectedEvent}`}
            />
            <TopSection date={firstDate} eventData={eventData}>
                {/* Event buttons for Event View */}
                {eventViewData.map((event, eventIndex) => (
                    <SelectionButton
                        key={eventIndex}
                        onClick={() => setSelectedEvent(event.slug)}
                        selected={selectedEvent === event.slug}
                        text={event.name}
                    />
                ))}
            </TopSection>
            {/* All Timeline Groups grouped by date */}
            {filteredEventData.dates.map((date, dateIdx) => (
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

export default EventPage;
