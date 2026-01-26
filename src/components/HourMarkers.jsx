import React from "react";
import {
    HOUR_WIDTH,
    HOUR_WIDTH_LARGE,
    HOUR_WIDTH_XL,
    TOTAL_HOURS,
} from "../utils/utils";

const HourMarkers = (props) => {
    const { isFirst, isLast } = props;

    return (
        <div className="relative">
            {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        "--i": i,
                        "--hour-width": `${HOUR_WIDTH}px`,

                        "--hour-width-lg": `${HOUR_WIDTH_LARGE}px`,
                        "--hour-width-xl": `${HOUR_WIDTH_XL}px`,
                    }}
                    className={
                        "absolute left-[calc(var(--i)*var(--hour-width)-3px)] top-0 z-0 h-[calc(var(--hour-width)-2px)] w-1.5 bg-neutral-800 lg:left-[calc(var(--i)*var(--hour-width-lg)-3px)] lg:h-[calc(var(--hour-width-lg)-2px)] lg:w-1.5 2xl:left-[calc(var(--i)*var(--hour-width-xl)-3px)] 2xl:h-[calc(var(--hour-width-xl)-2px)]"
                    }
                />
            ))}
        </div>
    );
};

export default HourMarkers;
