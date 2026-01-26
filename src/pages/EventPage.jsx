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
    const { firstDate, setFirstDate, isMobile, showData } = useOutletContext();
    const { eventSlug } = useParams();
    const navigate = useNavigate();

    // Get all available event slugs
    const allEventSlugs = eventViewData.map((event) => event.slug);

    // Check if the eventSlug from URL is valid
    const isValidEvent = (slug) => {
        if (!slug) return false;
        return allEventSlugs.includes(slug);
    };

    // Determine the valid event to use - validate BEFORE setting state
    const validatedEvent = isValidEvent(eventSlug)
        ? eventSlug
        : allEventSlugs[0];

    const [selectedEvent, setSelectedEvent] = useState(validatedEvent);

    // Sync URL with selectedEvent
    useEffect(() => {
        if (
            selectedEvent &&
            selectedEvent !== eventSlug &&
            isValidEvent(selectedEvent)
        ) {
            navigate(`/events/${selectedEvent}`, { replace: true });
        }
    }, [selectedEvent]);

    // Sync selectedEvent with URL
    useEffect(() => {
        if (
            eventSlug &&
            eventSlug !== selectedEvent &&
            isValidEvent(eventSlug)
        ) {
            setSelectedEvent(eventSlug);
        }
    }, [eventSlug]);

    // Find the data for the selected event
    const eventData = eventViewData.find(
        (event) => event.slug === selectedEvent,
    );

    // Filter out dates before today
    const filteredEventData = eventData
        ? {
              ...eventData,
              dates: eventData.dates.filter(
                  (date) => date.date >= TODAY_FORMATTED,
              ),
          }
        : null;

    // Update firstDate when data changes
    useEffect(() => {
        if (filteredEventData && filteredEventData.dates.length > 0) {
            setFirstDate(filteredEventData.dates[0].date);
        }
    }, [filteredEventData?.dates, setFirstDate]);

    useScrollToEarliest([selectedEvent]);

    // Redirect if we landed on an invalid URL
    if (!isValidEvent(eventSlug) && eventSlug !== undefined) {
        if (allEventSlugs.length > 0) {
            return <Navigate to={`/events/${allEventSlugs[0]}`} replace />;
        } else {
            return <Navigate to={`/events/`} replace />;
        }
    }

    // Safety check - no data found
    if (!filteredEventData) {
        return <Navigate to={`/events/`} replace />;
    }

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
                showData={showData}
            />
            <TopSection date={firstDate} eventData={eventData}>
                {!isMobile && eventSelectionButtons}
            </TopSection>
            {filteredEventData.dates.map((date, dateIdx) => (
                <TimelineGroup
                    key={dateIdx}
                    groupElement={date}
                    groupElementIdx={dateIdx}
                    parentGroupType="date"
                    date={date.date}
                />
            ))}

            <Footer isMobile={isMobile} />

            {isMobile && <BottomNavBar>{eventSelectionButtons}</BottomNavBar>}
        </>
    );
};

export default EventPage;
