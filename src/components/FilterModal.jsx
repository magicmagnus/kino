import React, { useState } from "react";

// All available filter options
const AVAILABLE_FILTERS = [
    { key: "OmdU", label: "OmdU" },
    { key: "OmeU", label: "OmeU" },
    { key: "OV", label: "OV" },
    { key: "3D", label: "3D" },
    { key: "Dolby Atmos", label: "Dolby Atmos" },
];

const FilterModal = ({ filterAttributes, setFilterAttributes }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Check if a filter is active
    const isFilterActive = (filterKey) => {
        return filterAttributes.some(
            (attr) => attr.toLowerCase() === filterKey.toLowerCase(),
        );
    };

    // Toggle a single filter
    const toggleFilter = (filterKey) => {
        if (isFilterActive(filterKey)) {
            // Remove filter
            setFilterAttributes(
                filterAttributes.filter(
                    (attr) => attr.toLowerCase() !== filterKey.toLowerCase(),
                ),
            );
        } else {
            // Add filter
            setFilterAttributes([...filterAttributes, filterKey]);
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setFilterAttributes([]);
    };

    // Select all filters
    const selectAllFilters = () => {
        setFilterAttributes(AVAILABLE_FILTERS.map((f) => f.key));
    };

    return (
        <div className="relative h-full">
            {/* Filter toggle button */}
            <button
                onClick={() => setIsModalOpen(!isModalOpen)}
                className={`flex h-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors lg:px-3 lg:py-2 lg:text-lg 2xl:px-5 2xl:py-3 2xl:text-xl ${
                    filterAttributes.length > 0
                        ? "bg-rose-600 text-white"
                        : "bg-neutral-700 text-neutral-200"
                }`}
            >
                <i className="fas fa-filter" />
                <span>Filter</span>
                {filterAttributes.length > 0 && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-white font-bold text-rose-600 lg:size-5 2xl:size-6">
                        {filterAttributes.length}
                    </span>
                )}
            </button>

            {/* Modal dropdown */}
            {isModalOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsModalOpen(false)}
                    />

                    {/* Modal content */}
                    <div className="absolute bottom-full right-0 z-50 mb-3 h-fit w-60 rounded-xl bg-neutral-800 p-3 shadow-xl md:top-full md:mt-3 lg:mt-5 lg:w-72 lg:p-4 2xl:mt-6 2xl:w-96 2xl:p-5">
                        <div className="-mt-0.5 mb-3 ml-1 flex items-center justify-between text-base lg:text-lg 2xl:text-xl">
                            <h3 className="font-semibold text-white">Filter</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-neutral-400 hover:text-white"
                            >
                                <i className="fas fa-times" />
                            </button>
                        </div>

                        {/* Filter options */}
                        <div className="flex flex-col gap-2">
                            {AVAILABLE_FILTERS.map((filter) => (
                                <button
                                    key={filter.key}
                                    onClick={() => toggleFilter(filter.key)}
                                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors lg:text-base 2xl:text-lg ${
                                        isFilterActive(filter.key)
                                            ? "bg-rose-600 text-white"
                                            : "bg-neutral-700 text-neutral-200 hover:bg-neutral-600"
                                    }`}
                                >
                                    <span>{filter.label}</span>
                                    {isFilterActive(filter.key) && (
                                        <i className="fas fa-check" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-4 flex gap-2 text-xs lg:text-base 2xl:text-lg">
                            <button
                                onClick={clearFilters}
                                className="flex-1 rounded-lg bg-neutral-700 px-3 py-2 text-neutral-200 hover:bg-neutral-600"
                            >
                                Alle löschen
                            </button>
                            <button
                                onClick={selectAllFilters}
                                className="flex-1 rounded-lg bg-neutral-700 px-3 py-2 text-neutral-200 hover:bg-neutral-600"
                            >
                                Alle wählen
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FilterModal;
