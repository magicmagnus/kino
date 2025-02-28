import React from "react";

const SelectionButton = (props) => {
    const { onClick, selected, text } = props;
    return (
        <button
            onClick={onClick}
            className={
                "h-fit w-fit flex-shrink-0 flex-nowrap text-nowrap rounded-full px-2.5 py-1.5 text-center text-sm font-semibold transition-all duration-200 hover:bg-rose-500 hover:text-rose-50 sm:px-3" +
                (selected
                    ? " bg-rose-600 text-rose-50"
                    : " bg-rose-900 text-gray-200")
            }
        >
            <p>{text}</p>
        </button>
    );
};

export default SelectionButton;
