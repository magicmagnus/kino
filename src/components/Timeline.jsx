import React from "react";
import HourMarkers from "./HourMarkers";
import MovieBlock from "./MovieBlock";
import {
    HOUR_WIDTH,
    HOUR_WIDTH_LARGE,
    HOUR_WIDTH_XL,
    TOTAL_HOURS,
} from "../utils/utils";
import TimeIndicator from "./TimeIndicator";
import { FilmStripBorder } from "./FilmStripBorder";

const Timeline = (props) => {
    const { schedule, scheduleIdx, isFirst, isLast, title, date } = props;
    return (
        <div
            style={{
                "--hour-width": `${HOUR_WIDTH}px`,
                "--hour-width-lg": `${HOUR_WIDTH_LARGE}px`,
                "--hour-width-xl": `${HOUR_WIDTH_XL}px`,
                "--total-hours": TOTAL_HOURS,
            }}
            key={scheduleIdx}
            className="relative flex w-fit items-center justify-center bg-neutral-900 text-center"
        >
            {/* children are Room name or Date as name - sticky left column  */}
            {/* Room name - sticky left column */}
            <div className="sticky left-0 z-[12] flex h-[calc(var(--hour-width))] w-8 items-center justify-center text-center lg:h-[calc(var(--hour-width-lg))] lg:w-10 2xl:h-[calc(var(--hour-width-xl))] 2xl:w-12">
                <div
                    className={`flex h-[calc(var(--hour-width))] w-8 flex-col items-center justify-center border-t-2 border-[rgba(47,47,47,1)] bg-[rgba(47,47,47,1)] shadow-[4px_0_4px_-4px_rgba(0,0,0,0.9)] lg:h-[calc(var(--hour-width-lg))] lg:w-10 2xl:h-[calc(var(--hour-width-xl))] 2xl:w-12 ${isFirst ? "rounded-tr-md" : ""} ${isLast ? "rounded-br-md" : ""}`}
                >
                    <p className="-translate-x-0.5 -rotate-90 transform text-nowrap text-sm text-white lg:text-base 2xl:text-base">
                        {title}
                    </p>
                </div>
            </div>
            {/* Timeline container - now with fixed width */}
            <div
                className={
                    "relative ml-8 h-[calc(var(--hour-width))] min-w-[calc(var(--hour-width)*var(--total-hours))] overflow-x-hidden bg-neutral-900 lg:ml-6 lg:h-[calc(var(--hour-width-lg))] lg:min-w-[calc(var(--hour-width-lg)*var(--total-hours))] 2xl:ml-4 2xl:h-[calc(var(--hour-width-xl))] 2xl:min-w-[calc(var(--hour-width-xl)*var(--total-hours))]" +
                    (isFirst ? "" : " border-t-2 border-neutral-900") +
                    " overflow-x-visible overflow-y-visible border-t-2 border-neutral-900"
                }
            >
                {/* Generate hour markers */}
                <HourMarkers isFirst={isFirst} isLast={isLast} />

                {/* Film strip border effect */}
                <FilmStripBorder align="top" />
                <FilmStripBorder align="bottom" />

                {/* MovieBlocks for this room */}
                {schedule.showings.map((show, showIdx) => (
                    <MovieBlock
                        key={showIdx}
                        show={show}
                        showIdx={showIdx}
                        date={date}
                    />
                ))}
                {/* Time indicator */}
                <TimeIndicator date={date} isFirst={isFirst} />
            </div>
        </div>
    );
};

export default Timeline;
