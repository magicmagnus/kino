import React from "react";
import Timeline from "./Timeline";
import { formatDateString } from "../utils/utils";

const TimelineGroup = (props) => {
    const { groupElement, groupElementIdx, parentGroupType, date } = props;

    let groupedList = [];
    // groupElement is either a room or a date
    if (parentGroupType === "theater") {
        groupedList = groupElement.rooms;
    } else if (parentGroupType === "date") {
        groupedList = groupElement.theaters;
    } else if (parentGroupType === "movie") {
        // for movie view, data will be grouped by first date then by room
        groupedList = groupElement.dates;
    }

    return (
        <div key={groupElementIdx}>
            {/* sticky header */}
            <div className="sticky left-0 z-[12] flex h-fit w-screen items-center justify-start text-left">
                <h1 className="mx-0 w-fit text-nowrap rounded-r-full bg-zinc-950 py-1 pl-2 pr-2 text-base font-semibold text-white shadow-[4px_0_4px_-4px_rgba(0,0,0,0.9)]">
                    {/* could be theater name or date name */}
                    {parentGroupType === "theater"
                        ? groupElement.name
                        : formatDateString(groupElement.date, true, "long")}
                </h1>
            </div>
            {/* loop over all schedules of the elements */}
            {parentGroupType === "theater" ? (
                groupedList.map((schedule, scheduleIdx) => (
                    <Timeline
                        key={scheduleIdx}
                        schedule={schedule}
                        scheduleIdx={scheduleIdx}
                        isFirst={scheduleIdx === 0}
                        isLast={scheduleIdx === groupedList.length - 1}
                        title={schedule.name}
                        date={date}
                    />
                ))
            ) : (
                <></>
            )}
            {parentGroupType === "date" ? (
                groupedList.map((theater, theaterIdx) =>
                    theater.rooms.map((room, roomIdx) => (
                        <Timeline
                            key={roomIdx}
                            schedule={room}
                            scheduleIdx={roomIdx}
                            isFirst={roomIdx === 0}
                            isLast={
                                roomIdx === theater.rooms.length - 1 &&
                                theaterIdx === groupedList.length - 1
                            }
                            title={room.name}
                            date={date}
                        />
                    )),
                )
            ) : (
                <></>
            )}
        </div>
    );
};

export default TimelineGroup;
