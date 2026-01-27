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
        <div key={groupElementIdx} className="mb-5 lg:mb-8 2xl:mb-10">
            {/* sticky header */}
            <div className="sticky left-0 z-[12] flex h-fit w-screen items-center justify-start text-center">
                <h1 className="mb-1 flex-shrink-0 text-nowrap rounded-r-lg bg-[rgba(47,47,47,1)] px-8 py-1 text-lg font-semibold text-white lg:px-10 lg:py-2 lg:text-2xl 2xl:px-12 2xl:py-2 2xl:text-2xl">
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
                            isFirst={theaterIdx === 0 && roomIdx === 0}
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
