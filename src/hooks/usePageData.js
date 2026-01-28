import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    removePastDates,
    extractAvailableOptions,
    findSelectedData,
    filterByAttributes,
    hasShowingsToDisplay,
    getFirstDate,
} from "../utils/dataUtils";

/**
 * Custom hook that encapsulates the common data loading and filtering logic
 * for all main pages (DatePage, RoomPage, MoviePage, EventPage)
 *
 * @param {Object} config - Configuration object
 * @param {Array} config.rawData - The raw JSON data import
 * @param {string} config.pageType - One of: "datepage", "roompage", "moviepage", "eventpage"
 * @param {string} config.basePath - URL base path (e.g., "/dates", "/rooms")
 * @param {string} config.urlParam - Name of the URL parameter (e.g., "dateSlug", "roomSlug")
 * @param {Array<string>} config.filterAttributes - Active attribute filters from context
 *
 * @returns {Object} - All the data and functions needed by the page
 */
export const usePageData = ({
    rawData,
    pageType,
    basePath,
    filterAttributes,
}) => {
    const params = useParams();
    const navigate = useNavigate();

    // Determine the URL parameter name based on pageType
    const urlParamName = {
        datepage: "dateSlug",
        roompage: "roomSlug",
        moviepage: "movieSlug",
        eventpage: "eventSlug",
    }[pageType];

    const urlSlug = params[urlParamName];

    // =========================================================================
    // STEP 1: HARD FILTER - Remove past dates (memoized, stable)
    // =========================================================================
    const upcomingData = useMemo(
        () => removePastDates(rawData, pageType),
        [rawData, pageType],
    );

    // =========================================================================
    // STEP 2: Extract available options for SelectionButtons
    // =========================================================================
    const availableOptions = useMemo(
        () => extractAvailableOptions(upcomingData, pageType),
        [upcomingData, pageType],
    );

    // =========================================================================
    // STEP 3: Validate URL & Manage Selection State
    // =========================================================================

    // Check if an option is valid
    const isValidOption = (option) => {
        return option && availableOptions.includes(option);
    };

    // Determine initial selection
    const getValidatedOption = () => {
        if (isValidOption(urlSlug)) {
            return urlSlug;
        }
        return availableOptions[0] || null;
    };

    const [selectedOption, setSelectedOption] = useState(getValidatedOption);

    // Sync URL → State (when URL changes externally)
    useEffect(() => {
        if (urlSlug && urlSlug !== selectedOption && isValidOption(urlSlug)) {
            setSelectedOption(urlSlug);
        }
    }, [urlSlug, availableOptions]);

    // Sync State → URL (when state changes internally)
    useEffect(() => {
        if (
            selectedOption &&
            selectedOption !== urlSlug &&
            isValidOption(selectedOption)
        ) {
            navigate(`${basePath}/${selectedOption}`, { replace: true });
        }
    }, [selectedOption, basePath, navigate]);

    // Handle case where current selection becomes invalid (e.g., data refresh)
    useEffect(() => {
        if (
            selectedOption &&
            !isValidOption(selectedOption) &&
            availableOptions.length > 0
        ) {
            setSelectedOption(availableOptions[0]);
        }
    }, [availableOptions]);

    // =========================================================================
    // STEP 4: Extract Selected Item's Data
    // =========================================================================
    const selectedOptionData = useMemo(
        () => findSelectedData(upcomingData, selectedOption, pageType),
        [upcomingData, selectedOption, pageType],
    );

    // =========================================================================
    // STEP 5: SOFT FILTER - Apply Attribute Filters
    // =========================================================================
    const displayData = useMemo(
        () =>
            filterByAttributes(selectedOptionData, filterAttributes, pageType),
        [selectedOptionData, filterAttributes, pageType],
    );

    // =========================================================================
    // Derived Values
    // =========================================================================
    const hasShowings = useMemo(
        () => hasShowingsToDisplay(displayData, pageType),
        [displayData, pageType],
    );

    const firstDate = useMemo(
        () => getFirstDate(displayData, pageType),
        [displayData, pageType],
    );

    // Check if we need to redirect (invalid URL)
    const shouldRedirect = urlSlug !== undefined && !isValidOption(urlSlug);
    const redirectPath =
        availableOptions.length > 0
            ? `${basePath}/${availableOptions[0]}`
            : basePath;

    // =========================================================================
    // Return everything the page needs
    // =========================================================================
    return {
        // Data
        upcomingData, // For SelectionButtons (all valid options)
        availableOptions, // Array of valid option identifiers
        selectedOption, // Currently selected option
        selectedOptionData, // Unfiltered data for selected option
        displayData, // Filtered data ready to render

        // Derived values
        hasShowings, // Boolean: does displayData have any showings?
        firstDate, // First date in displayData (for TopSection)

        // Actions
        setSelectedOption, // Function to change selection
        isValidOption, // Function to validate an option

        // Navigation
        shouldRedirect, // Boolean: does URL need redirect?
        redirectPath, // Path to redirect to
        urlSlug, // Current URL parameter
    };
};
