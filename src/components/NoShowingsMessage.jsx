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
            <i className="fas fa-filter text-4xl text-gray-500" />
            <p className="font-notoSans text-base text-gray-400 lg:text-lg 2xl:text-xl">
                Keine Vorstellungen für "{selectedOption}"{" "}
                {hasFilters && "mit den ausgewählten Filtern"} gefunden.
            </p>
            {hasFilters && (
                <>
                    <p className="font-notoSans text-base text-gray-500 lg:text-lg 2xl:text-xl">
                        Aktive Filter: {filterAttributes.join(", ")}
                    </p>

                    <button
                        onClick={onClearFilters}
                        className="mt-2 rounded-lg bg-rose-600 px-4 py-2 text-base text-white transition-colors hover:bg-rose-700 lg:text-lg 2xl:text-xl"
                    >
                        <i className="fas fa-times mr-2" />
                        Filter zurücksetzen
                    </button>
                </>
            )}
        </div>
    );
};

export default NoShowingsMessage;
