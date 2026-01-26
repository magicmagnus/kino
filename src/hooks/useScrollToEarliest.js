import { useEffect } from "react";
import {
    HOUR_WIDTH,
    HOUR_WIDTH_LARGE,
    HOUR_WIDTH_XL,
    START_HOUR,
} from "../utils/utils";

export const useScrollToEarliest = (dependencies = []) => {
    useEffect(() => {
        const scrollToEarliestShowing = () => {
            let width;
            if (window.innerWidth < 1024) {
                width = HOUR_WIDTH;
            } else if (window.innerWidth < 1536) {
                width = HOUR_WIDTH_LARGE;
            } else {
                width = HOUR_WIDTH_XL;
            }
            const container = document.querySelector(".overflow-y-auto");
            if (!container) return;

            const showings = container.querySelectorAll(
                "button.absolute.flex.movieblock",
            );

            if (!showings.length) return;

            let earliestLeft = Infinity;
            showings.forEach((showing) => {
                const leftValue =
                    getComputedStyle(showing).getPropertyValue("left");
                const left = parseInt(leftValue);

                if (left < earliestLeft) {
                    earliestLeft = left;
                }
            });
            console.log("--- Scrolling to earliest showing ---");
            console.log("Earliest left position:", earliestLeft);

            const timeIndicator = container.querySelector(".indicator");
            if (timeIndicator) {
                const indicatorLeftValue =
                    getComputedStyle(timeIndicator).getPropertyValue("left");
                const indicatorLeft = parseInt(indicatorLeftValue);

                // if the indicatorLeft is later than the earliestLeft, scroll to indicatorLeft instead
                if (indicatorLeft > earliestLeft) {
                    earliestLeft = indicatorLeft;
                    console.log(
                        "Scrolling to indicator left position:",
                        indicatorLeft,
                    );
                }
            }

            if (earliestLeft !== Infinity) {
                const hourOfShow =
                    Math.floor(earliestLeft / width) + START_HOUR;
                console.log("rounded hour of show:", hourOfShow);
                const scrollPosition = (hourOfShow - START_HOUR) * width;
                console.log("scroll position:", scrollPosition);

                container.scrollTo({
                    left: scrollPosition,
                    behavior: "smooth",
                });
            }
        };

        setTimeout(scrollToEarliestShowing, 100);
    }, dependencies);
};
