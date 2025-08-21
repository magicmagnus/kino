export const HOUR_WIDTH = 112; // w-32 = 128px
export const START_HOUR = 9; // 9 AM
export const END_HOUR = 25; // 1 AM next day
export const TOTAL_HOURS = END_HOUR - START_HOUR + 1;
export const TIMELINE_WIDTH = TOTAL_HOURS * HOUR_WIDTH;
// export today as YYYY-MM-DD
export const TODAY_FORMATTED = new Date().toISOString().split("T")[0];

// Generate hours for the timeline (9 AM to 1 AM next day)
export const HOURS = Array.from({ length: 17 }, (_, i) => {
    const hour = (i + START_HOUR) % 24;
    return `${hour.toString().padStart(2, "0")}:00`;
});

export const timeToPixels = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const hoursFromStart =
        hours >= START_HOUR ? hours - START_HOUR : hours + 24 - START_HOUR;
    return (hoursFromStart * 60 + minutes) * (HOUR_WIDTH / 60);
};

export const formatDateString = (
    date,
    addNumbersToToday = false,
    weekdayFormat = "short",
) => {
    let dateObj = new Date(date);
    let today = new Date();
    let tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let formattedDate = dateObj.toLocaleDateString("de-DE", {
        month: "numeric",
        day: "numeric",
    });

    if (date === TODAY_FORMATTED) {
        return addNumbersToToday ? `Heute, ${formattedDate}` : "Heute";
    } else if (
        dateObj.getDate() === tomorrow.getDate() &&
        dateObj.getMonth() === tomorrow.getMonth() &&
        dateObj.getFullYear() === tomorrow.getFullYear()
    ) {
        return addNumbersToToday ? `Morgen, ${formattedDate}` : "Morgen";
    }

    return dateObj.toLocaleDateString("de-DE", {
        weekday: weekdayFormat,
        month: "numeric",
        day: "numeric",
    });
};

export const containsOmdu = (attributes) => {
    return attributes.includes("OmdU") || attributes.includes("OmU")
        ? "OmdU"
        : attributes.includes("OmeU")
          ? "OmeU"
          : attributes.includes("OV")
            ? "OV"
            : null;
};

export const getOtherAttribute = (attributes) => {
    return attributes.filter(
        (attribute) =>
            attribute !== "2D" &&
            attribute !== "3D" &&
            attribute !== "OmdU" &&
            attribute !== "OmeU" &&
            attribute !== "OmU" &&
            attribute !== "OV",
    )[0];
};
