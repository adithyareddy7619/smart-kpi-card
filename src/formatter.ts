"use strict";

export type MeasureType = "percent_decimal" | "percent_whole" | "number";

export function detectMeasureType(formatString: string, values: number[]): MeasureType {
    if (!formatString.includes("%")) return "number";
    const nonZero = values.filter(v => v !== 0 && !isNaN(v) && isFinite(v));
    if (nonZero.length === 0) return "number";
    const maxAbs = Math.max(...nonZero.map(Math.abs));
    return maxAbs <= 1.5 ? "percent_decimal" : "percent_whole";
}

export function formatValue(value: number, measureType: MeasureType, decimalPlaces: number, displayUnits: number = 0): string {
    if (measureType === "percent_decimal") {
        return (value * 100).toFixed(decimalPlaces) + "%";
    }
    if (measureType === "percent_whole") {
        return value.toFixed(decimalPlaces) + "%";
    }
    return formatNumber(value, displayUnits, decimalPlaces);
}

export function formatNumber(value: number, displayUnits: number = 0, decimalPlaces: number = 1): string {
    let divisor = 1;
    let suffix = "";
    if (displayUnits === 0) {
        if      (Math.abs(value) >= 1e12) { divisor = 1e12; suffix = "T"; }
        else if (Math.abs(value) >= 1e9)  { divisor = 1e9;  suffix = "B"; }
        else if (Math.abs(value) >= 1e6)  { divisor = 1e6;  suffix = "M"; }
        else if (Math.abs(value) >= 1e3)  { divisor = 1e3;  suffix = "K"; }
    } else if (displayUnits > 1) {
        divisor = displayUnits;
        if      (displayUnits === 1e3)  suffix = "K";
        else if (displayUnits === 1e6)  suffix = "M";
        else if (displayUnits === 1e9)  suffix = "B";
        else if (displayUnits === 1e12) suffix = "T";
    }
    return (value / divisor).toLocaleString("en-US", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
    }) + suffix;
}

export function aggregateValues(vals: number[], measureType: MeasureType): number {
    const clean = vals.filter(v => !isNaN(v) && isFinite(v));
    if (clean.length === 0) return 0;
    if (measureType !== "number") {
        return clean.reduce((a, b) => a + b, 0) / clean.length;
    }
    return clean.reduce((a, b) => a + b, 0);
}

export const FONTS: string[] = [
    "sans-serif", "Arial", "Calibri", "Century Gothic",
    "Georgia", "Segoe UI", "Tahoma", "Times New Roman",
    "Trebuchet MS", "Verdana"
];

export function getFont(index: number): string {
    return FONTS[Math.max(0, Math.min(index, FONTS.length - 1))];
}
