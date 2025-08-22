import { Helmet } from "react-helmet-async";

const SEOHead = ({
    title = "Kinoschurke",
    description = "Das Programm der Tübinger Kinos, in Timelines für einen schnellen Überblick.",
    image = "https://www.kinoschurke.de/preview_image.png",
    url,
    movieTitle,
    movieSlug,
    eventName,
    roomName,
    date,
}) => {
    // Generate dynamic content based on props
    let pageTitle = title;
    let pageDescription = description;
    let pageUrl =
        url || (typeof window !== "undefined" ? window.location.href : "");
    let primaryImage = image;
    let twitterImage = "https://www.kinoschurke.de/preview_image_sq.png";

    if (movieTitle && movieSlug) {
        pageTitle = `${movieTitle} - Kinoschurke`;
        pageDescription = `Alle Vorstellungen von "${movieTitle}" in Tübinger Kinos.`;
        // Use the landscape image as primary (better for most platforms) - now PNG
        primaryImage = `https://www.kinoschurke.de/poster-variants/og/${movieSlug}.png`;
        // Use square for Twitter which works better with their card format - now PNG
        twitterImage = `https://www.kinoschurke.de/poster-variants/square/${movieSlug}.png`;
    } else if (eventName) {
        pageTitle = `${eventName} - Kinoschurke`;
        pageDescription = `Alle "${eventName}" Vorstellungen in Tübinger Kinos.`;
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
                    movieTitle
                        ? `${movieTitle} Poster`
                        : "Kinoschurke - Tübinger Kinoprogramm"
                }
            />

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
                    movieTitle
                        ? `${movieTitle} Poster`
                        : "Kinoschurke - Tübinger Kinoprogramm"
                }
            />
        </Helmet>
    );
};

export default SEOHead;
