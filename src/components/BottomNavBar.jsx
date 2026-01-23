import React from "react";

import { NavLink, Link } from "react-router-dom";

const NavButton = ({ to, label, iconClassName }) => {
    const linkClass = ({ isActive }) => {
        return (
            " flex-1  h-fit flex flex-col items-center justify-center rounded-lg font-semibold transition-all duration-200 gap-0.25 " +
            (isActive ? "  text-rose-600 bg-gray-100" : "  text-gray-300")
        );
    };
    return (
        <NavLink to={to} className={({ isActive }) => linkClass({ isActive })}>
            {iconClassName && (
                <i className={iconClassName + " pt-1 text-xs"}></i>
            )}
            <p className="pb-1 text-xs">{label}</p>
        </NavLink>
    );
};

const BottomNavBar = ({ children }) => {
    return (
        <div className="sticky bottom-0 left-0 z-40 h-fit w-screen">
            {children}
            <div className="flex w-screen items-center justify-around bg-zinc-900 p-1 text-white backdrop-blur-md">
                <NavButton
                    to="/dates"
                    label="Datum"
                    iconClassName="fas fa-calendar-day"
                />
                <NavButton
                    to="/rooms"
                    label="Saal"
                    iconClassName="fas fa-door-open"
                />
                <NavButton
                    to="/movies"
                    label="Film"
                    iconClassName="fas fa-film"
                />
                <NavButton
                    to="/events"
                    label="Event"
                    iconClassName="fas fa-calendar"
                />
                <NavButton
                    to="/favorites"
                    label="Favoriten"
                    iconClassName="fas fa-heart"
                />
            </div>
        </div>
    );
};

export default BottomNavBar;
