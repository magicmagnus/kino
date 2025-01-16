import React from "react";
import { NavLink, Link } from "react-router-dom";
import InstallPWA from "./InstallPWA";

const Header = () => {
    const linkClass = ({ isActive }) => {
        return (
            "px-3 py-1.5 rounded-full font-semibold transition-all duration-200 hover:bg-rose-500 hover:text-rose-50 " +
            (isActive
                ? " bg-rose-600 text-rose-50"
                : " bg-rose-900 text-gray-200")
        );
    };
    return (
        <div className="sticky top-0 z-40 flex h-fit w-full min-w-full items-center justify-between bg-zinc-950 p-4 text-white">
            <Link to="/" className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-rose-600 sm:text-4xl">
                    Kino<span className="text-white">Schurke</span>
                </h1>
            </Link>
            <div className="flex gap-1.5 text-sm">
                <NavLink to="/date" className={linkClass}>
                    Datum
                </NavLink>
                <NavLink to="/room" className={linkClass}>
                    Saal
                </NavLink>
                <NavLink to="/movie" className={linkClass}>
                    Film
                </NavLink>
            </div>
        </div>
    );
};

export default Header;
