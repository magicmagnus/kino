import React from "react";

const SelectionButton = (props) => {
    const { onClick, selected, text } = props;
    return (
        <button
            onClick={onClick}
            className={
                "h-fit w-fit flex-shrink-0 flex-nowrap text-nowrap rounded-lg px-1.5 py-2 text-center text-xs font-semibold transition-all duration-200 hover:bg-zinc-700 hover:text-white" +
                (selected ? " bg-zinc-700 px-3 text-white" : " text-gray-200")
            }
        >
            <p>{text}</p>
        </button>
    );
};

export default SelectionButton;
