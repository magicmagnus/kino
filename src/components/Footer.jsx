import React from "react";

const Footer = ({ isMobile, isMoviePage }) => {
    const marginBottom = isMoviePage ? 6 : 5.5;

    return (
        <div
            className="sticky left-0 z-10 mt-auto h-fit w-screen border-t-8 border-neutral-900 bg-neutral-800 p-2 text-center text-white"
            style={{
                marginBottom: isMobile
                    ? `calc(${marginBottom}rem + env(safe-area-inset-bottom, 0px))`
                    : "0",
            }}
        >
            <div className="flex items-center justify-center gap-2 text-[0.65rem] text-gray-400 lg:text-sm">
                <p className="">
                    &copy; 2026{" "}
                    <a
                        href="https://kinoschurke.de"
                        target="_blank"
                        rel="noreferrer"
                        className="text-rose-600"
                    >
                        Kinoschurke
                    </a>
                </p>

                <p className="">|</p>
                <p className="">
                    Made with{" "}
                    <span role="img" aria-label="heart">
                        ❤️
                    </span>{" "}
                    by{" "}
                    <a
                        href="https://github.com/magicmagnus/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-rose-600"
                    >
                        magicmagnus
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Footer;
