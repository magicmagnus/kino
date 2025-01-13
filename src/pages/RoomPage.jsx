import roomViewData from "../data/room-view.json";
import TopSection from "../components/TopSection";
import SelectionButton from "../components/SelectionButton";
import Timeline from "../components/Timeline";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { formatDateString, TODAY_FORMATTED } from "../utils/utils";
import { useScrollToEarliest } from "../hooks/useScrollToEarliest";

const RoomPage = () => {
    const { showCard, setShowCard, firstDate, setFirstDate } =
        useOutletContext();

    const [selectedRoom, setSelectedRoom] = useState("Saal Tarantino");

    // Filter and Find
    const filteredRoomData = roomViewData.reduce(
        (filteredTheaters, theater) => {
            // Filter room and dates in one pass
            const filteredRooms = theater.rooms
                .filter((room) => room.name === selectedRoom)
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

    // Add useEffect to handle firstDate update
    useEffect(() => {
        if (filteredRoomData.length > 0) {
            setFirstDate(filteredRoomData[0].rooms[0].dates[0].date);
        }
    }, [filteredRoomData, setFirstDate]);

    useScrollToEarliest([selectedRoom]);

    return (
        <>
            <TopSection date={firstDate}>
                {/* Room buttons for Room View */}
                {roomViewData.map((theater, theaterIdx) =>
                    theater.rooms.map((room, roomIdx) => (
                        <SelectionButton
                            key={roomIdx}
                            onClick={() => setSelectedRoom(room.name)}
                            selected={room.name === selectedRoom}
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
                            key={dateIdx}
                            schedule={date}
                            scheduleIdx={dateIdx}
                            isFirst={dateIdx === 0}
                            isLast={dateIdx === room.dates.length - 1}
                            title={formatDateString(date.date)}
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
