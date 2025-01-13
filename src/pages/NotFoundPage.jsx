import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <section className="flex h-full flex-col items-center justify-center text-center text-white">
            <i className="fas fa-exclamation-triangle mb-4 text-9xl text-rose-400"></i>
            <h1 className="mb-4 text-4xl font-bold">404 Not Found</h1>
            <p className="mb-5 text-xl">Diese Seite existiert nicht...</p>
            <Link
                to="/"
                className="mt-4 rounded-full bg-rose-600 px-3 py-2 text-lg font-semibold text-white hover:bg-rose-900"
            >
                Startseite
            </Link>
        </section>
    );
};

export default NotFoundPage;
