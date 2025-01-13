import dateViewData from "../data/date-view.json";
import TopSection from "../components/TopSection";
import SelectionButton from "../components/SelectionButton";
import TimelineGroup from "../components/TimelineGroup";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { formatDateString, TODAY_FORMATTED } from "../utils/utils";
import { useScrollToEarliest } from "../hooks/useScrollToEarliest";

const DatePage = () => {
    const { showCard, setShowCard, firstDate, setFirstDate } =
        useOutletContext();

    // Filter out dates before today
    const upcomingDateData = dateViewData.filter(
        (date) => date.date >= TODAY_FORMATTED,
    );

    const [selectedDate, setSelectedData] = useState(upcomingDateData[0].date);

    // Find the data for the selected date
    const filteredDateData = dateViewData.find(
        (date) => date.date === selectedDate,
    );

    useScrollToEarliest([selectedDate]);

    return (
        <>
            <TopSection date={selectedDate}>
                {/* Date buttons for Date View */}
                {upcomingDateData.slice(0, 7).map((date, dateIndex) => (
                    <SelectionButton
                        onClick={() => setSelectedData(date.date)}
                        key={dateIndex}
                        selected={date.date === selectedDate}
                        text={formatDateString(date.date)}
                    />
                ))}
            </TopSection>
            {/* All Timeline Groups */}
            {filteredDateData.theaters.map((theater, theaterIdx) => (
                <TimelineGroup
                    key={theaterIdx}
                    groupElement={theater}
                    groupElementIdx={theaterIdx}
                    parentGroupType="theater"
                    showCard={showCard}
                    setShowCard={setShowCard}
                    date={selectedDate}
                />
            ))}
        </>
    );
};

export default DatePage;
