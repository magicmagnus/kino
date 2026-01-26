import React from "react";
import {
    HOURS,
    TODAY_FORMATTED,
    HOUR_WIDTH,
    HOUR_WIDTH_LARGE,
    HOUR_WIDTH_XL,
    TOTAL_HOURS,
} from "../utils/utils";
import MovieInfo from "../components/MovieInfo";
import TimeIndicator from "../components/TimeIndicator";

const HourMarkersText = ({ date }) => {
    return (
        <div className="relative inset-0 ml-16 h-full">
            <TimeIndicator date={date} isTop={true} />
            {HOURS.map((hour, i) => (
                <div
                    key={hour}
                    style={{
                        "--i": i,
                        "--hour-width": `${HOUR_WIDTH}px`,
                        "--hour-width-lg": `${HOUR_WIDTH_LARGE}px`,
                        "--hour-width-xl": `${HOUR_WIDTH_XL}px`,
                        "--total-hours": TOTAL_HOURS,
                    }}
                    className="absolute left-[calc(var(--i)*var(--hour-width)-3px)] h-full w-12 text-right lg:left-[calc(var(--i)*var(--hour-width-lg)-3px)] lg:w-16 2xl:left-[calc(var(--i)*var(--hour-width-xl)-3px)] 2xl:w-20"
                >
                    <p className="translate-x-[-50%] pt-1 text-sm text-white lg:translate-x-[-55%] lg:text-lg 2xl:translate-x-[-60%] 2xl:pt-2 2xl:text-xl">
                        {hour}
                    </p>
                    <div className="absolute bottom-0 h-4 w-1.5 bg-neutral-800"></div>
                </div>
            ))}
        </div>
    );
};

const TopSection = (props) => {
    const { children, movieData, date } = props;

    return (
        <>
            {/* sticky-left (but not top) button container */}
            <div className="sticky left-0 z-30 flex w-fit flex-col items-center justify-start gap-0">
                {/* will be SelectionButtonContainer */}
                {children && children}
                <div className="flex w-screen justify-center bg-neutral-900">
                    {movieData && <MovieInfo movieData={movieData} />}
                </div>
            </div>

            {/* sticky-top hour markers */}
            <div className="sticky top-0 z-20 h-11 w-full bg-neutral-900 lg:h-12 2xl:h-14">
                {/* Hour markers top*/}
                <HourMarkersText date={date} />
            </div>
        </>
    );
};

export default TopSection;
