import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <div className="flex min-h-[80dvh] w-screen items-center justify-center">
            <section className="flex h-fit max-w-[80%] flex-col items-center justify-center rounded-3xl p-6 text-center text-white">
                {/* <i className="fas fa-exclamation-triangle mb-4 text-9xl text-rose-400"></i> */}
                <h1 className="mb-4 text-4xl font-bold">404</h1>
                <h2 className="mb-5 text-2xl">
                    This is not the page you're looking for...
                </h2>
                <img
                    src="/film-reel.svg"
                    alt="Filmrolle"
                    className="mb-6 h-32 w-32 fill-rose-600 text-rose-600 sm:h-48 sm:w-48"
                />

                <p>Da ist wohl etwas schief gelaufen</p>
                <Link
                    to="/"
                    className="mt-4 rounded-full bg-rose-600 px-3 py-2 text-lg font-semibold text-white hover:bg-rose-900"
                >
                    Zurück zur Startseite
                </Link>
            </section>
        </div>
    );
};

export default NotFoundPage;
