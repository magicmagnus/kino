const SelectionButtonContainer = ({ children }) => {
    return children.length > 0 ? (
        <div className="w-screen border-b border-neutral-700 bg-neutral-900 backdrop-blur-md">
            <div className="no-scrollbar flex gap-1 overflow-auto p-1 lg:gap-2 lg:p-2 2xl:gap-3 2xl:p-3">
                {children}
            </div>
        </div>
    ) : null;
};

export default SelectionButtonContainer;
