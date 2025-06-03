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
        if (isMovieCard) {
            // For MovieCard shares, include the current URL with show parameter
            shareUrl = window.location.href;
        } else {
            // For page shares, remove the show parameter
            const url = new URL(window.location);
            url.searchParams.delete("show");
            shareUrl = url.toString();
        }

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
