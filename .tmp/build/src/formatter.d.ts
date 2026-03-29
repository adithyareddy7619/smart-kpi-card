export type MeasureType = "percent_decimal" | "percent_whole" | "number";
export declare function detectMeasureType(formatString: string, values: number[]): MeasureType;
export declare function formatValue(value: number, measureType: MeasureType, decimalPlaces: number, displayUnits?: number): string;
export declare function formatNumber(value: number, displayUnits?: number, decimalPlaces?: number): string;
export declare function aggregateValues(vals: number[], measureType: MeasureType): number;
export declare const FONTS: string[];
export declare function getFont(index: number): string;
