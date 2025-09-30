// functions/api-proxy.js
exports.handler = async (event, context) => {
    // Handle preflight requests
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            },
            body: "",
        };
    }

    const cinemaIds = ["3623", "3625", "3627"]; // Your cinema IDs
    const apiUrl = `https://www.kinoheld.de/ajax/getShowsForCinemas?${cinemaIds.map((id) => `cinemaIds[]=${id}`).join("&")}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; kinoschurke)",
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=300", // 5 minute cache
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error("API proxy error:", error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                error: "Failed to fetch data",
                details: error.message,
                timestamp: new Date().toISOString(),
            }),
        };
    }
};
