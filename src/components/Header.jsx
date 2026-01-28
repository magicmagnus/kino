import React from "react";
import { NavLink, Link } from "react-router-dom";

const Header = ({ isMobile }) => {
    const linkClass = ({ isActive }) => {
        return (
            "px-3 py-2 lg:px-4 lg:py-3 2xl:px-5 2xl:py-4 rounded-lg :rounded-xl font-semibold flex items-center justify-center transition-all duration-200  hover:bg-neutral-100 hover:text-rose-600 " +
            (isActive
                ? " text-rose-600 bg-neutral-100 px-6 lg:px-8 2xl:px-10"
                : "  text-rose-600")
        );
    };
    return (
        <div
            style={{
                //paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))",
                "--padding-top-env": "env(safe-area-inset-top, 0px)",
            }}
            className="sticky top-0 z-40 flex h-fit w-full min-w-full items-center justify-between border-b border-neutral-700 bg-neutral-900 px-3 pb-3 pt-[calc(0.75rem+var(--padding-top-env))] text-white lg:px-4 lg:pb-4 lg:pt-[calc(1rem+var(--padding-top-env))] 2xl:px-6 2xl:pb-6 2xl:pt-[calc(1.5rem+var(--padding-top-env))]"
        >
            <Link
                to="/"
                className="flex h-7 w-auto flex-1 items-center justify-start gap-3 lg:h-12 2xl:h-16"
            >
                <img
                    src="/web-app-manifest-512x512-maskable.png"
                    alt="KinoSchurke"
                    className="size-7 lg:size-12 2xl:size-16"
                />
                <h1 className="-mt-0.5 font-jaro text-3xl text-white md:text-4xl lg:-mt-1 lg:pl-2 lg:text-6xl 2xl:-mt-1.5 2xl:text-7xl">
                    Kino
                    <span className="font-jaro text-rose-600">Schurke</span>
                </h1>
            </Link>
            {!isMobile && (
                <div className="flex gap-1 rounded-xl bg-rose-950 text-sm lg:text-lg">
                    <NavLink to="/dates" className={linkClass}>
                        <i className="fas fa-calendar-day hidden md:block"></i>
                        <p className="pl-1.5">Datum</p>
                    </NavLink>
                    <NavLink to="/rooms" className={linkClass}>
                        <i className="fas fa-door-open hidden md:block"></i>
                        <p className="pl-1.5">Saal</p>
                    </NavLink>
                    <NavLink to="/movies" className={linkClass}>
                        <i className="fas fa-film hidden md:block"></i>
                        <p className="pl-1.5">Film</p>
                    </NavLink>
                    <NavLink to="/events" className={linkClass}>
                        <i className="fas fa-tag hidden md:block"></i>
                        <p className="pl-1.5">Event</p>
                    </NavLink>
                    <NavLink to="/favorites" className={linkClass}>
                        <i className="fas fa-heart hidden md:block"></i>
                        <p className="pl-1.5">Favoriten</p>
                    </NavLink>
                </div>
            )}
        </div>
    );
};

export default Header;
