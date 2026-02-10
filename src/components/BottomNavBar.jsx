import React from "react";
import { NavLink } from "react-router-dom";

const NavButton = ({ to, label, iconClassName }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                "flex h-fit flex-1 flex-col items-center justify-center gap-1 rounded-full font-semibold transition-all duration-200 " +
                (isActive ? "" : "")
            }
        >
            {({ isActive }) => (
                <>
                    {iconClassName && (
                        <div
                            className={`flex w-[60%] items-center justify-center rounded-full py-1.5 text-base ${isActive ? "bg-neutral-200 text-rose-600" : "text-neutral-300"}`}
                        >
                            <i className={`${iconClassName} `} />
                        </div>
                    )}
                    <p
                        className={`pb-0.5 text-xs ${isActive ? "text-white" : "text-neutral-300"}`}
                    >
                        {label}
                    </p>
                </>
            )}
        </NavLink>
    );
};

const BottomNavBar = ({ children }) => {
    return (
        <div className="fixed bottom-0 left-0 z-40 h-fit w-screen">
            {children}

            <div
                style={{
                    paddingBottom:
                        "var(--safe-area-bottom, env(safe-area-inset-bottom, 0px))",
                }}
                className="flex w-screen items-center justify-around bg-neutral-800 px-2 pt-1.5 text-white backdrop-blur-md"
            >
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
                    iconClassName="fas fa-bookmark"
                />
            </div>
        </div>
    );
};

export default BottomNavBar;
