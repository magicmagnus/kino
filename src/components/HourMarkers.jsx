import React from "react";
import { HOUR_WIDTH, TOTAL_HOURS } from "../utils/utils";

const HourMarkers = (props) => {
    return (
        <div>
            {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                <div
                    key={i}
                    className="absolute top-0 mt-[15px] h-20 w-1 rounded-full bg-zinc-700"
                    style={{
                        left: `${i * HOUR_WIDTH - 2}px`, // minus 2 px to align with the hour markers
                        width: "4px", // was 4 px
                    }}
                />
            ))}
        </div>
    );
};

export default HourMarkers;
