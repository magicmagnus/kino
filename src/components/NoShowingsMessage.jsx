import React from "react";

/**
 * Reusable component for displaying "no showings found" message
 * Used when attribute filters result in empty data
 */
const NoShowingsMessage = ({
    selectedOption,
    filterAttributes,
    onClearFilters,
}) => {
    const hasFilters = filterAttributes.length > 0;

    return (
        <div className="sticky left-0 flex min-h-[500px] w-screen flex-col items-center justify-center gap-4 px-8 text-center">
            <i
                className={`fas text-5xl text-neutral-600 ${hasFilters ? "fa-filter-circle-xmark" : "fa-calendar-xmark"}`}
            />
            <p className="font-notoSans text-xl font-semibold text-neutral-300">
                Keine Vorstellungen {!hasFilters ? "mehr" : ""} für "
                {selectedOption}" {hasFilters && "mit den ausgewählten Filtern"}{" "}
                gefunden.
            </p>
            {hasFilters && (
                <>
                    <p className="max-w-md font-notoSans text-neutral-500">
                        Aktive Filter: {filterAttributes.join(", ")}
                    </p>

                    <button
                        onClick={onClearFilters}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-base text-white transition-colors hover:bg-rose-700 lg:text-lg 2xl:text-xl"
                    >
                        <i className="fas fa-filter-circle-xmark mr-2" />
                        Filter zurücksetzen
                    </button>
                </>
            )}
        </div>
    );
};

export default NoShowingsMessage;
