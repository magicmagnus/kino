import React, { useState, useEffect } from "react";
import {
    START_HOUR,
    END_HOUR,
    HOUR_WIDTH,
    HOUR_WIDTH_LARGE,
    HOUR_WIDTH_XL,
    timeToPixels,
    TODAY_FORMATTED,
} from "../utils/utils";

const TimeIndicator = (props) => {
    const { date, isTop, isFirst } = props;

    const [position, setPosition] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updatePosition = () => {
            // First check if the timeline represents today
            if (date !== TODAY_FORMATTED) {
                setIsVisible(false);
                return;
            }

            let width;
            if (window.innerWidth < 1024) {
                width = HOUR_WIDTH;
            } else if (window.innerWidth < 1536) {
                width = HOUR_WIDTH_LARGE;
            } else {
                width = HOUR_WIDTH_XL;
            }

            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

            // Only show indicator if current time is within timeline window
            if (
                (hours >= START_HOUR && hours < 24) ||
                (hours >= 0 && hours < END_HOUR - 24)
            ) {
                setIsVisible(true);
                setPosition(timeToPixels(timeString, width));
                if (isTop) {
                    setPosition(timeToPixels(timeString, width));
                }
            } else {
                setIsVisible(false);
            }
        };

        // Update initially
        updatePosition();

        // Update every minute
        const interval = setInterval(updatePosition, 60000);

        return () => clearInterval(interval);
    }, [date]);

    if (!isVisible) return null;

    return (
        <div
            className={
                "indicator absolute bottom-0 h-[calc(var(--hour-width))] w-1 bg-rose-600 shadow-2xl lg:h-[calc(var(--hour-width-lg))] 2xl:h-[calc(var(--hour-width-xl))] " +
                (isTop
                    ? " z-[20] h-8 lg:h-10 2xl:h-12"
                    : isFirst
                      ? " h-[calc(var(--hour-width)+5rem)] overflow-y-visible lg:h-[calc(var(--hour-width-lg)+6rem)] 2xl:h-[calc(var(--hour-width-xl)+7rem)]" // higher to cover the group name area
                      : " z-[11]") +
                " "
            }
            style={{
                left: `${position - 2}px`, // minus 2 px to align with the hour markers, center-aligned
                // boxShadow: "0 0 4px rgba(225, 29, 72, 0.99)",
                "--hour-width": `${HOUR_WIDTH}px`,
                "--hour-width-lg": `${HOUR_WIDTH_LARGE}px`,
                "--hour-width-xl": `${HOUR_WIDTH_XL}px`,
            }}
        />
    );
};

export default TimeIndicator;
