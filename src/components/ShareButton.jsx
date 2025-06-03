import { useState } from "react";

const ShareButton = ({
    children,
    title,
    text,
    classNameBtn,
    isMovieCard = false,
}) => {
    const [showCopied, setShowCopied] = useState(false);

    const handleShare = async () => {
        // For MovieCard shares, include the current hash
        const shareUrl = isMovieCard
            ? window.location.href
            : window.location.href.split("#")[0]; // Remove hash for page shares

        const shareData = {
            title: title || "Kinoschurke.de - Dein Kinoprogramm",
            text: text || "Komm mit mir ins Kino!",
            url: shareUrl,
        };

        if (navigator.share && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // User cancelled or error occurred
                console.log("Share cancelled or failed:", err);
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                setShowCopied(true);
                setTimeout(() => setShowCopied(false), 2000);
            } catch (err) {
                console.error("Failed to copy URL:", err);
            }
        }
    };

    return (
        <>
            <button onClick={handleShare} className={classNameBtn}>
                <i className="fa-solid fa-share"></i>
                {children}
            </button>
            {/* Show copied message for 2 seconds after copying */}
            {showCopied && (
                <div className="absolute left-0 mt-1 rounded bg-green-600 px-2 py-1 text-xs text-white">
                    URL copied!
                </div>
            )}
        </>
    );
};

export default ShareButton;
