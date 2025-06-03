import { Helmet } from "react-helmet-async";

const SEOHead = ({
    title = "Kinoschurke",
    description = "Das Programm der Tübinger Kinos, in Timelines für einen schnellen Überblick.",
    image = "https://kinoschurke.de/preview_image.png",
    url,
    movieTitle,
    eventName,
    date,
}) => {
    // Generate dynamic content based on props
    let pageTitle = title;
    let pageDescription = description;
    let pageUrl = url || window.location.href;

    if (movieTitle) {
        pageTitle = `${movieTitle} - Kinoschurke`;
        pageDescription = `Alle Vorstellungen von "${movieTitle}" in Tübinger Kinos.`;
    } else if (eventName) {
        pageTitle = `${eventName} - Kinoschurke`;
        pageDescription = `Alle "${eventName}" Vorstellungen in Tübinger Kinos.`;
    } else if (date) {
        pageTitle = `Kinoprogramm ${date} - Kinoschurke`;
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
            <meta property="og:image" content={image} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta property="twitter:domain" content="kinoschurke.de" />
            <meta property="twitter:url" content={pageUrl} />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />
            <meta name="twitter:image" content={image} />

            {/* WhatsApp square image */}
            <meta
                property="og:image"
                content="https://kinoschurke.de/preview_image_sq.png"
            />
            <meta property="og:image:width" content="600" />
            <meta property="og:image:height" content="600" />
        </Helmet>
    );
};

export default SEOHead;
