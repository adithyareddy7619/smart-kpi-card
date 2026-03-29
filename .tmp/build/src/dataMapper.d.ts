import powerbi from "powerbi-visuals-api";
import { MeasureType } from "./formatter";
export interface DataPoint {
    label: string;
    actual: number;
    py: number;
    budget: number;
}
export interface MappedData {
    dataPoints: DataPoint[];
    actualMain: number;
    pyMain: number;
    budgetMain: number;
    pyPct: number;
    budgetPct: number;
    measureName: string;
    granularity: "monthly" | "weekly";
    formatString: string;
}
export declare function mapData(dataView: powerbi.DataView, measureType: MeasureType, autoScale: boolean, monthThreshold: number): MappedData | null;
