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
        <div className="sticky top-0 z-40 flex h-fit w-full min-w-full items-center justify-between border-b border-neutral-700 bg-neutral-900 p-3 text-white lg:p-4 2xl:p-6">
            <Link
                to="/"
                className="flex w-auto flex-1 items-center justify-start gap-1.5 sm:gap-3"
            >
                <img
                    src="/web-app-manifest-512x512-maskable.png"
                    alt="KinoSchurke"
                    className="size-6 lg:size-12 2xl:size-16"
                />
                <h1 className="text-xl font-bold text-white md:text-2xl lg:pl-2 lg:text-4xl 2xl:text-5xl">
                    Kino<span className="text-rose-600">Schurke</span>
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
                        <i className="fas fa-calendar hidden md:block"></i>
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
