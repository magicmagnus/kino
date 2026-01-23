// Footer.jsx
import React from "react";

const Footer = () => {
    return (
        <div className="sticky left-0 z-10 mt-auto h-fit w-screen bg-zinc-800 p-2 text-center text-white">
            <div className="flex items-center justify-center gap-2 text-[0.65rem] text-gray-400">
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
