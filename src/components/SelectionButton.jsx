import React from "react";

const SelectionButton = (props) => {
    const { onClick, selected, text } = props;
    return (
        <button
            onClick={onClick}
            className={
                "h-fit w-fit flex-shrink-0 flex-nowrap text-nowrap rounded-lg px-2 py-2 text-center text-xs transition-all duration-200 hover:bg-neutral-600 hover:text-white lg:px-3 lg:py-2 lg:text-lg 2xl:px-5 2xl:py-3 2xl:text-xl" +
                (selected
                    ? " bg-neutral-600 px-3 font-semibold text-white lg:px-5 2xl:px-7"
                    : " bg-neutral-800 text-gray-200")
            }
        >
            <p>{text}</p>
        </button>
    );
};

export default SelectionButton;
