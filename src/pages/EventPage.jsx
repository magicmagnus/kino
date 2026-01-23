import eventViewData from "../data/event-view.json";
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
import { TODAY_FORMATTED } from "../utils/utils";
import { useScrollToEarliest } from "../hooks/useScrollToEarliest";
import SEOHead from "../components/SEOHead";

const EventPage = () => {
    const { firstDate, setFirstDate, isMobile, showDate } = useOutletContext();
    const { eventSlug } = useParams();
    const navigate = useNavigate();

    const [selectedEvent, setSelectedEvent] = useState(
        eventSlug || (eventViewData.length > 0 ? eventViewData[0].slug : null),
    );

    // Update URL when selectedEvent changes
    useEffect(() => {
        if (selectedEvent && selectedEvent !== eventSlug) {
            navigate(`/events/${selectedEvent}`, { replace: true });
        }
    }, [selectedEvent, eventSlug, navigate]);

    // Update selectedEvent when URL changes
    useEffect(() => {
        if (eventSlug && eventSlug !== selectedEvent) {
            setSelectedEvent(eventSlug);
        }
    }, [eventSlug]);

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

    useEffect(() => {
        if (filteredEventData.dates.length > 0) {
            setFirstDate(filteredEventData.dates[0].date);
        }
    }, [filteredEventData.dates, setFirstDate]);

    useScrollToEarliest([selectedEvent]);

    const eventSelectionButtons = (
        <SelectionButtonContainer>
            {eventViewData.map((event, eventIndex) => (
                <SelectionButton
                    key={eventIndex}
                    onClick={() => setSelectedEvent(event.slug)}
                    selected={selectedEvent === event.slug}
                    text={event.name}
                />
            ))}
        </SelectionButtonContainer>
    );

    return (
        <>
            <SEOHead
                eventName={eventData.name}
                url={`https://kinoschurke.de/events/${selectedEvent}`}
                showData={showDate}
            />
            <TopSection date={firstDate} eventData={eventData}>
                {/* Event buttons for Event View */}
                {!isMobile && eventSelectionButtons}
            </TopSection>
            {/* All Timeline Groups grouped by date */}
            {filteredEventData.dates.map((date, dateIdx) => (
                <TimelineGroup
                    key={dateIdx}
                    groupElement={date}
                    groupElementIdx={dateIdx}
                    parentGroupType="date"
                    date={date.date}
                />
            ))}

            <Footer />

            {isMobile && <BottomNavBar>{eventSelectionButtons}</BottomNavBar>}
        </>
    );
};

export default EventPage;
