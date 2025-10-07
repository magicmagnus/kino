import React from "react";
import { NavLink, Link } from "react-router-dom";
import InstallPWA from "./InstallPWA";

const Header = () => {
    const linkClass = ({ isActive }) => {
        return (
            "px-2.5 py-1.5 rounded-full font-semibold transition-all duration-200 sm:px-3 hover:bg-rose-500 hover:text-rose-50 " +
            (isActive
                ? " bg-rose-600 text-rose-50"
                : " bg-rose-900 text-gray-200")
        );
    };
    return (
        <header className="sticky top-0 z-40 flex h-fit w-full min-w-full items-center justify-between bg-zinc-950 px-3 py-3 text-white sm:p-4">
            <Link
                to="/"
                className="flex w-auto flex-1 items-center justify-start gap-1.5 sm:gap-3"
            >
                <img
                    src="/web-app-manifest-512x512-maskable.png"
                    alt="KinoSchurke"
                    className="h-6 w-6 sm:h-10 sm:w-10"
                />
                <h1 className="text-xl font-bold text-white sm:text-4xl">
                    Kino<span className="text-rose-600">Schurke</span>
                </h1>
            </Link>
            <nav className="flex gap-1.5 text-sm">
                <NavLink to="/dates" className={linkClass}>
                    Datum
                </NavLink>
                <NavLink to="/rooms" className={linkClass}>
                    Saal
                </NavLink>
                <NavLink to="/movies" className={linkClass}>
                    Film
                </NavLink>
                <NavLink
                    to="/events"
                    className={linkClass + " hidden sm:block"}
                >
                    Event
                </NavLink>
            </nav>
        </header>
    );
};

export default Header;
