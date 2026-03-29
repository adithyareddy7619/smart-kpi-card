import { DataPoint } from "./dataMapper";
import { MeasureType } from "./formatter";
export interface SparklineColors {
    actual: string;
    py: string;
    budget: string;
}
export interface SparklineWidths {
    actual: number;
    py: number;
    budget: number;
}
export interface TooltipField {
    label: string;
    value: number;
    formatString: string;
    displayValue?: string;
}
export interface DeltaOptions {
    showDelta: boolean;
    showDeltaPct: boolean;
    showDeltaAbs: boolean;
    pyDeltaLabel: string;
    budgetDeltaLabel: string;
    positiveDeltaColor: string;
    negativeDeltaColor: string;
}
export interface SparklineOptions {
    colors: SparklineColors;
    widths: SparklineWidths;
    fillUnder: boolean;
    markerShape: number;
    markerSize: number;
    showTooltip: boolean;
    actualLabel: string;
    pyLabel: string;
    budgetLabel: string;
    tooltipFields: TooltipField[][];
    delta: DeltaOptions;
}
declare const ACTUAL_LABELS: string[];
declare const PY_LABELS: string[];
declare const BUDGET_LABELS: string[];
export declare function getLabelName(labels: string[], idx: number): string;
export { ACTUAL_LABELS, PY_LABELS, BUDGET_LABELS };
export declare class SparklineRenderer {
    private canvas;
    private tooltipEl;
    private dataPoints;
    private opts;
    private measureType;
    private decimalPlaces;
    private pA;
    private pP;
    private pB;
    constructor(canvas: HTMLCanvasElement, tooltipEl: HTMLElement, opts: SparklineOptions, measureType: MeasureType, decimalPlaces: number);
    setData(dataPoints: DataPoint[]): void;
    draw(hovIdx?: number): void;
    private nearestIdx;
    private el;
    private buildTooltip;
    bindEvents(): void;
}
