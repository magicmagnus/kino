import FilterModal from "./FilterModal";

const SelectionButtonContainer = ({
    children,
    filterAttributes,
    setFilterAttributes,
}) => {
    return children.length > 0 ? (
        <div className="sticky left-0 top-0 z-30 w-screen">
            <div className="flex h-fit w-screen items-stretch justify-between border-b border-neutral-700 bg-neutral-900">
                <div className="no-scrollbar flex gap-1 overflow-auto px-2 py-1.5 lg:gap-2 lg:p-2 2xl:gap-3 2xl:p-3">
                    {children}
                </div>
                <div className="flex justify-end border-l border-neutral-700 py-1.5 pl-1.5 pr-2 lg:gap-2 lg:p-2 2xl:gap-3 2xl:p-3">
                    <div className="flex h-full items-center">
                        <FilterModal
                            filterAttributes={filterAttributes}
                            setFilterAttributes={setFilterAttributes}
                        />
                    </div>
                </div>
            </div>
        </div>
    ) : null;
};

export default SelectionButtonContainer;
