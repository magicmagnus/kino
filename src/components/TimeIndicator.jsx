import React, { useState, useEffect } from "react";
import {
    HOUR_WIDTH,
    START_HOUR,
    END_HOUR,
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
                setPosition(timeToPixels(timeString));
                if (isTop) {
                    setPosition(timeToPixels(timeString));
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
                "absolute bottom-0 z-[11] w-1 bg-rose-600 opacity-100 shadow-2xl" +
                (isFirst ? " bottom-0 h-36" : isTop ? " h-6" : " h-32") +
                " "
            }
            style={{
                left: `${position}px`,
                // boxShadow: "0 0 4px rgba(225, 29, 72, 0.99)",
            }}
        />
    );
};

export default TimeIndicator;
