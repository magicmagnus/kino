import roomViewData from "../data/room-view.json";
import TopSection from "../components/TopSection";
import BottomNavBar from "../components/BottomNavBar";
import SelectionButton from "../components/SelectionButton";
import SelectionButtonContainer from "../components/SelectionButtonContainer";
import Footer from "../components/Footer";
import Timeline from "../components/Timeline";
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

const RoomPage = () => {
    const { firstDate, setFirstDate, isMobile, showData } = useOutletContext();
    const { roomSlug } = useParams();
    const navigate = useNavigate();

    // Get all available room slugs
    const getAllRoomSlugs = () => {
        const slugs = [];
        for (const theater of roomViewData) {
            for (const room of theater.rooms) {
                slugs.push(room.slug || room.name);
            }
        }
        return slugs;
    };

    const allRoomSlugs = getAllRoomSlugs();

    // Check if the roomSlug from URL is valid
    const isValidRoom = (slug) => {
        if (!slug) return false;
        return allRoomSlugs.includes(slug);
    };

    // Determine the valid room to use - validate BEFORE setting state
    const validatedRoom = isValidRoom(roomSlug) ? roomSlug : allRoomSlugs[0];

    const [selectedRoom, setSelectedRoom] = useState(validatedRoom);

    // Sync URL with selectedRoom
    useEffect(() => {
        if (
            selectedRoom &&
            selectedRoom !== roomSlug &&
            isValidRoom(selectedRoom)
        ) {
            navigate(`/rooms/${selectedRoom}`, { replace: true });
        }
    }, [selectedRoom]);

    // Sync selectedRoom with URL
    useEffect(() => {
        if (roomSlug && roomSlug !== selectedRoom && isValidRoom(roomSlug)) {
            setSelectedRoom(roomSlug);
        }
    }, [roomSlug]);

    // Filter and Find - Updated to work with both slug and name
    const filteredRoomData = roomViewData.reduce(
        (filteredTheaters, theater) => {
            const filteredRooms = theater.rooms
                .filter((room) => (room.slug || room.name) === selectedRoom)
                .map((room) => ({
                    ...room,
                    dates: room.dates.filter(
                        (date) => date.date >= TODAY_FORMATTED,
                    ),
                }))
                .filter((room) => room.dates.length > 0);

            if (filteredRooms.length > 0) {
                filteredTheaters.push({
                    ...theater,
                    rooms: filteredRooms,
                });
            }

            return filteredTheaters;
        },
        [],
    );

    // Update firstDate when data changes
    useEffect(() => {
        if (filteredRoomData.length > 0) {
            setFirstDate(filteredRoomData[0].rooms[0].dates[0].date);
        }
    }, [filteredRoomData, setFirstDate]);

    useScrollToEarliest([selectedRoom]);

    // Redirect if we landed on an invalid URL
    if (!isValidRoom(roomSlug) && roomSlug !== undefined) {
        if (allRoomSlugs.length > 0) {
            return <Navigate to={`/rooms/${allRoomSlugs[0]}`} replace />;
        } else {
            return <Navigate to={`/rooms/`} replace />;
        }
    }

    // Safety check - no data for valid room (all dates in past)
    if (filteredRoomData.length === 0) {
        return <Navigate to={`/rooms/`} replace />;
    }

    const roomsSelectionButtons = (
        <SelectionButtonContainer>
            {roomViewData.map((theater, theaterIdx) =>
                theater.rooms.map((room, roomIdx) => (
                    <SelectionButton
                        key={`${theaterIdx}-${roomIdx}`}
                        onClick={() => setSelectedRoom(room.slug || room.name)}
                        selected={(room.slug || room.name) === selectedRoom}
                        text={room.name}
                    />
                )),
            )}
        </SelectionButtonContainer>
    );

    return (
        <>
            <SEOHead
                roomName={filteredRoomData[0]?.rooms[0]?.name}
                url={`https://kinoschurke.de/rooms/${selectedRoom}`}
                showData={showData}
            />
            <TopSection date={firstDate}>
                {!isMobile && roomsSelectionButtons}
            </TopSection>
            {filteredRoomData.map((theater, theaterIdx) =>
                theater.rooms.map((room, roomIdx) =>
                    room.dates.map((date, dateIdx) => (
                        <Timeline
                            key={`${theaterIdx}-${roomIdx}-${dateIdx}`}
                            schedule={date}
                            scheduleIdx={dateIdx}
                            isFirst={dateIdx === 0}
                            isLast={dateIdx === room.dates.length - 1}
                            title={formatDateString(date.date, true)}
                            date={date.date}
                        />
                    )),
                ),
            )}

            {/* cause we dont have a TimelineGroup that does the margin */}
            <div className="mb-5 lg:mb-8 2xl:mb-10" />

            <Footer isMobile={isMobile} />

            {isMobile && <BottomNavBar>{roomsSelectionButtons}</BottomNavBar>}
        </>
    );
};

export default RoomPage;
