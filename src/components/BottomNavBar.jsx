import React from "react";
import { NavLink } from "react-router-dom";

const NavButton = ({ to, label, iconClassName }) => {
    const linkClass = ({ isActive }) => {
        return (
            "flex-1 h-fit flex flex-col items-center justify-center rounded-full font-semibold transition-all duration-200 gap-0.25 " +
            (isActive ? "text-rose-600 bg-neutral-100" : "text-neutral-200")
        );
    };
    return (
        <NavLink to={to} className={({ isActive }) => linkClass({ isActive })}>
            {iconClassName && (
                <i className={iconClassName + " pt-2 text-xs"}></i>
            )}
            <p className="pb-2 text-xs">{label}</p>
        </NavLink>
    );
};

const BottomNavBar = ({ children }) => {
    return (
        <div
            className="fixed bottom-0 left-0 z-40 h-fit w-screen bg-neutral-800"
            style={{
                paddingBottom:
                    "var(--safe-area-bottom, env(safe-area-inset-bottom, 0px))",
            }}
        >
            {children}
            <div className="flex w-screen items-center justify-around bg-neutral-800 px-2 py-0 text-white backdrop-blur-md">
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
                    iconClassName="fas fa-tag"
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
