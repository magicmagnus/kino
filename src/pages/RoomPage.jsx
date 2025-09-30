import { useData } from "../contexts/DataContext";
import TopSection from "../components/TopSection";
import SelectionButton from "../components/SelectionButton";
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
    const { showCard, setShowCard, firstDate, setFirstDate } =
        useOutletContext();
    const { roomSlug } = useParams();
    const { data, loading, error } = useData();
    const navigate = useNavigate();

    // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
    const [selectedRoom, setSelectedRoom] = useState(null);

    // Helper function to get first available room
    const getFirstAvailableRoom = (roomViewData) => {
        for (const theater of roomViewData) {
            for (const room of theater.rooms) {
                return room.slug || room.name;
            }
        }
        return null;
    };

    // 1. Initialize selectedRoom after we have data
    useEffect(() => {
        if (data && data.roomView) {
            // If we have a roomSlug from URL, validate and use it
            if (roomSlug) {
                const validRoom = data.roomView.some((theater) =>
                    theater.rooms.some(
                        (room) => (room.slug || room.name) === roomSlug,
                    ),
                );
                if (validRoom) {
                    setSelectedRoom(roomSlug);
                } else {
                    // If roomSlug is invalid, redirect to first available room
                    setSelectedRoom(getFirstAvailableRoom(data.roomView));
                }
            } else {
                // If no roomSlug, use first available
                setSelectedRoom(getFirstAvailableRoom(data.roomView));
            }
        }
    }, [data, roomSlug]);

    // 2. Update URL when selectedRoom changes (but not on initial load with roomSlug)
    useEffect(() => {
        if (selectedRoom && selectedRoom !== roomSlug) {
            navigate(`/rooms/${selectedRoom}`, { replace: true });
        }
    }, [selectedRoom, roomSlug, navigate]);

    // 4. Call useScrollToEarliest hook here (before any returns)
    useScrollToEarliest([selectedRoom]);

    // NOW you can have conditional returns AFTER all hooks
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data || !data.roomView) return <div>No data available</div>;

    // ADD THIS CHECK: Wait for selectedRoom to be set
    if (!selectedRoom) return <div>Loading...</div>;

    const roomViewData = data.roomView;
    console.log("Room View Data:", roomViewData);
    console.log("Selected room:", selectedRoom);

    // Filter and Find - Updated to work with both slug and name
    const filteredRoomData = roomViewData.reduce(
        (filteredTheaters, theater) => {
            // Filter room and dates in one pass
            const filteredRooms = theater.rooms
                .filter((room) => (room.slug || room.name) === selectedRoom)
                .map((room) => ({
                    ...room,
                    dates: room.dates.filter(
                        (date) => date.date >= TODAY_FORMATTED,
                    ),
                }))
                .filter((room) => room.dates.length > 0);

            // Only include theaters that have matching rooms with valid dates
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

    console.log("Filtered room data:", filteredRoomData);

    // Add error handling for when room is not found
    if (selectedRoom && filteredRoomData.length === 0) {
        return <Navigate to={"/404/"} />;
    }

    return (
        <>
            <SEOHead
                roomName={filteredRoomData[0]?.rooms[0]?.name}
                url={`https://kinoschurke.de/rooms/${selectedRoom}`}
            />
            <TopSection date={firstDate}>
                {/* Room buttons for Room View */}
                {roomViewData.map((theater, theaterIdx) =>
                    theater.rooms.map((room, roomIdx) => (
                        <SelectionButton
                            key={`${theaterIdx}-${roomIdx}`}
                            onClick={() =>
                                setSelectedRoom(room.slug || room.name)
                            }
                            selected={(room.slug || room.name) === selectedRoom}
                            text={room.name}
                        />
                    )),
                )}
            </TopSection>
            {/* All Timelines */}
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
                            showCard={showCard}
                            setShowCard={setShowCard}
                            date={date.date}
                        />
                    )),
                ),
            )}
        </>
    );
};

export default RoomPage;
