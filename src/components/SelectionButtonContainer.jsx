const SelectionButtonContainer = ({ children }) => {
    return children.length > 0 ? (
        <div className="w-screen border-b border-zinc-700 bg-zinc-900 py-1 backdrop-blur-md">
            <div className="no-scrollbar flex gap-1 overflow-auto px-1">
                {children}
            </div>
        </div>
    ) : null;
};

export default SelectionButtonContainer;
