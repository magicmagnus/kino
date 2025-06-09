import React from "react";
import { HOURS, TODAY_FORMATTED } from "../utils/utils";
import MovieInfo from "../components/MovieInfo";
import TimeIndicator from "../components/TimeIndicator";

const TopSection = (props) => {
    const { children, movieData, date } = props;

    return (
        <>
            {/* sticky-left (but not top) button container */}
            <div className="sticky left-0 z-30 flex w-screen flex-col items-center justify-start gap-0 bg-zinc-900">
                <div className="w-screen py-2">
                    <div className="no-scrollbar flex gap-1.5 overflow-auto px-2">
                        {children}
                    </div>
                </div>
                <div className="flex w-screen justify-center bg-zinc-900">
                    {movieData && <MovieInfo movieData={movieData} />}
                </div>
            </div>

            {/* sticky-top hour markers */}
            <div className="sticky top-0 z-20 bg-zinc-900">
                {/* Hour markers top*/}
                <div className="relative flex h-6 bg-zinc-800">
                    {/* pad for the corner where the two stickys meet */}
                    {/* <div className="sticky left-0 z-20 flex w-6 flex-shrink-0 items-center justify-center bg-zinc-800 text-center" /> */}
                    <div className="relative ml-12 flex w-full">
                        {/* Height adjusted to match header height */}
                        <div className="absolute inset-0 h-full">
                            <TimeIndicator date={date} isTop={true} />
                        </div>
                        {HOURS.map((hour) => (
                            <div
                                key={hour}
                                className="z-[1] w-28 flex-shrink-0 py-1 text-right"
                            >
                                <p className="-ml-6 w-10 text-xs text-white">
                                    {hour}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default TopSection;
