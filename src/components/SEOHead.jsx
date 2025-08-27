import { Helmet } from "react-helmet-async";
import { useShowParameter } from "../hooks/useShowParameter";
import { formatDateString, isDateTodayOrTomorrow } from "../utils/utils";

const SEOHead = ({
    title = "Kinoschurke",
    description = "Das Programm der Tübinger Kinos, in Timelines für einen schnellen Überblick.",
    image = "https://kinoschurke.de/preview_image.png",
    url,
    movieTitle,
    movieSlug,
    eventName,
    roomName,
    date,
}) => {
    // Get show data from URL parameter
    const showData = useShowParameter();

    // Generate dynamic content based on props
    let pageTitle = title;
    let pageDescription = description;
    let pageUrl = typeof window !== "undefined" ? window.location.href : "";
    let primaryImage = image;
    let twitterImage = "https://kinoschurke.de/preview_image_sq.png";

    // Priority 1: If there's a show parameter, use the movie from that show
    if (showData && showData.movieInfo) {
        const showMovieTitle = showData.movieInfo.title;
        const showMovieSlug = showData.movieInfo.slug;

        const useFillerWord = !isDateTodayOrTomorrow(showData.date);
        const formattedDate = formatDateString(showData.date);

        pageTitle =
            `"${showMovieTitle}"` +
            (useFillerWord
                ? ` am ${formattedDate}`
                : `, ${formattedDate.toLowerCase()}`) +
            ` um ${showData.show.time}h`;
        pageDescription =
            `Schau dir "${showMovieTitle}"` +
            (useFillerWord
                ? ` am ${formattedDate}`
                : `, ${formattedDate.toLowerCase()}`) +
            ` um ${showData.show.time}h in Tübingen mit mir an. Klicke hier für mehr Infos!`;
        primaryImage = `https://kinoschurke.de/poster-variants/og/${showMovieSlug}.png`;
        twitterImage = `https://kinoschurke.de/poster-variants/square/${showMovieSlug}.png`;
    }
    // Priority 2: If no show parameter but we have movie data from props
    else if (movieTitle && movieSlug) {
        pageTitle = `${movieTitle} - Kinoschurke`;
        pageDescription = `Alle Vorstellungen von "${movieTitle}" in Tübingen.`;
        // Use the same domain as your primary domain (no www)
        primaryImage = `https://kinoschurke.de/poster-variants/og/${movieSlug}.png`;
        twitterImage = `https://kinoschurke.de/poster-variants/square/${movieSlug}.png`;
    } else if (eventName) {
        pageTitle = `${eventName} - Kinoschurke`;
        pageDescription = `Alle "${eventName}" Vorstellungen in Tübingen.`;
    } else if (roomName) {
        pageTitle = `${roomName} - Kinoschurke`;
        pageDescription = `Das Kinoprogramm für ${roomName} in Tübingen.`;
    } else if (date) {
        pageTitle = `${date} - Kinoschurke`;
        pageDescription = `Das Kinoprogramm für ${date} in Tübingen.`;
    }

    return (
        <Helmet>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />

            {/* Open Graph */}
            <meta property="og:url" content={pageUrl} />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />

            {/* Single primary OG image */}
            <meta property="og:image" content={primaryImage} />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta
                property="og:image:alt"
                content={
                    showData?.movieInfo?.title || movieTitle
                        ? `${showData?.movieInfo?.title || movieTitle} Poster`
                        : "Kinoschurke - Tübinger Kinoprogramm"
                }
            />

            {/* WhatsApp square image */}
            <meta property="og:image" content={twitterImage} />
            <meta property="og:image:width" content="600" />
            <meta property="og:image:height" content="600" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta property="twitter:domain" content="kinoschurke.de" />
            <meta property="twitter:url" content={pageUrl} />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />
            <meta name="twitter:image" content={twitterImage} />
            <meta
                name="twitter:image:alt"
                content={
                    showData?.movieInfo?.title || movieTitle
                        ? `${showData?.movieInfo?.title || movieTitle} Poster`
                        : "Kinoschurke - Tübinger Kinoprogramm"
                }
            />
        </Helmet>
    );
};

export default SEOHead;
