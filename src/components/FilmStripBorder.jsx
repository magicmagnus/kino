import React from "react";

export const FilmStripBorder = ({
    align = "top",
    squareSize = { base: 8, lg: 10, xl: 12 },
    gap = { base: 12, lg: 13, xl: 15 },
    borderRadius = { base: 2, lg: 2.5, xl: 3 },
    color = "#171717",
    opacity = 1,
    height = { base: 20, lg: 24, xl: 28 },
}) => {
    // Helper to get value (handles both number and object)
    const getValue = (prop, breakpoint) => {
        if (typeof prop === "number") return prop;
        return prop[breakpoint] ?? prop.base;
    };

    // Generate SVG for a specific breakpoint
    const generateSvg = (breakpoint) => {
        const size = getValue(squareSize, breakpoint);
        const g = getValue(gap, breakpoint);
        const radius = getValue(borderRadius, breakpoint);
        const tileSize = size + g;
        const offset = g / 2;

        const svgString = `
            <svg xmlns='http://www.w3.org/2000/svg' width='${tileSize}' height='${size}'>
                <rect 
                    x='${offset}' 
                    y='0' 
                    width='${size}' 
                    height='${size}' 
                    rx='${radius}' 
                    ry='${radius}' 
                    fill='${color}'
                />
            </svg>
        `
            .replace(/\s+/g, " ")
            .trim();

        return {
            encoded: encodeURIComponent(svgString),
            tileSize,
            size,
            height: getValue(height, breakpoint),
        };
    };

    const base = generateSvg("base");
    const lg = generateSvg("lg");
    const xl = generateSvg("xl");

    const baseStyles = {
        "--strip-height": `${base.height}px`,
        "--strip-bg": `url("data:image/svg+xml,${base.encoded}")`,
        "--strip-size": `${base.tileSize}px ${base.size}px`,
        "--strip-height-lg": `${lg.height}px`,
        "--strip-bg-lg": `url("data:image/svg+xml,${lg.encoded}")`,
        "--strip-size-lg": `${lg.tileSize}px ${lg.size}px`,
        "--strip-height-xl": `${xl.height}px`,
        "--strip-bg-xl": `url("data:image/svg+xml,${xl.encoded}")`,
        "--strip-size-xl": `${xl.tileSize}px ${xl.size}px`,
    };

    return (
        <div
            className={
                "pointer-events-none absolute -left-20 right-0 bg-neutral-800 " +
                (align === "top" ? " top-0" : " bottom-0")
            }
            style={baseStyles}
        >
            {/* Base (mobile) */}
            <div
                className="block lg:hidden"
                style={{
                    height: `var(--strip-height)`,
                    backgroundImage: `var(--strip-bg)`,
                    backgroundSize: `var(--strip-size)`,
                    backgroundRepeat: "repeat-x",
                    backgroundPosition: "center center",
                    opacity: opacity,
                }}
            />
            {/* Large screens */}
            <div
                className="hidden lg:block 2xl:hidden"
                style={{
                    height: `var(--strip-height-lg)`,
                    backgroundImage: `var(--strip-bg-lg)`,
                    backgroundSize: `var(--strip-size-lg)`,
                    backgroundRepeat: "repeat-x",
                    backgroundPosition: "center center",
                    opacity: opacity,
                }}
            />
            {/* XL screens */}
            <div
                className="hidden 2xl:block"
                style={{
                    height: `var(--strip-height-xl)`,
                    backgroundImage: `var(--strip-bg-xl)`,
                    backgroundSize: `var(--strip-size-xl)`,
                    backgroundRepeat: "repeat-x",
                    backgroundPosition: "center center",
                    opacity: opacity,
                }}
            />
        </div>
    );
};
