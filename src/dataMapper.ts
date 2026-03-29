"use strict";

import powerbi from "powerbi-visuals-api";
import { MeasureType, aggregateValues } from "./formatter";

export interface DataPoint {
    label:  string;
    actual: number;
    py:     number;
    budget: number;
}

export interface MappedData {
    dataPoints:   DataPoint[];
    actualMain:   number;
    pyMain:       number;
    budgetMain:   number;
    pyPct:        number;
    budgetPct:    number;
    measureName:  string;
    granularity:  "monthly" | "weekly";
    formatString: string;
}

const MONTH_ORDER: Record<string, number> = {
    jan:1, feb:2, mar:3, apr:4, may:5, jun:6,
    jul:7, aug:8, sep:9, oct:10, nov:11, dec:12,
    january:1, february:2, march:3, april:4, june:6, july:7,
    august:8, september:9, october:10, november:11, december:12
};

function monthRank(label: string): number {
    const key = label.toLowerCase().trim();
    return MONTH_ORDER[key] ?? MONTH_ORDER[key.substring(0, 3)] ?? 99;
}

function weekRank(label: string): number {
    const m = label.match(/\d+/);
    return m ? parseInt(m[0], 10) : 99;
}

function sortPoints(pts: DataPoint[], granularity: "monthly" | "weekly"): DataPoint[] {
    return [...pts].sort((a, b) =>
        granularity === "monthly"
            ? monthRank(a.label) - monthRank(b.label)
            : weekRank(a.label)  - weekRank(b.label)
    );
}

export function mapData(
    dataView: powerbi.DataView,
    measureType: MeasureType,
    autoScale: boolean,
    monthThreshold: number
): MappedData | null {
    const cat = dataView?.categorical;
    if (!cat) return null;

    const catCols = cat.categories || [];

    // Find month and week columns by ROLE not by position
    let monthCat: powerbi.DataViewCategoryColumn | undefined;
    let weekCat:  powerbi.DataViewCategoryColumn | undefined;

    for (const c of catCols) {
        if (c.source?.roles?.["category"])  monthCat = c;
        if (c.source?.roles?.["category2"]) weekCat  = c;
    }

    // Fallback: if roles not found use position
    if (!monthCat && catCols.length >= 1) monthCat = catCols[0];
    if (!weekCat  && catCols.length >= 2) weekCat  = catCols[1];

    let actualCol:   powerbi.DataViewValueColumn | undefined;
    let pyCol:       powerbi.DataViewValueColumn | undefined;
    let budgetCol:   powerbi.DataViewValueColumn | undefined;

    if (cat.values) {
        for (const col of cat.values) {
            if (col.source.roles["actual"])  actualCol  = col;
            if (col.source.roles["py"])      pyCol      = col;
            if (col.source.roles["budget"])  budgetCol  = col;
        }
    }

    // Count distinct months to decide granularity
    let useMonthly = false;
    let granularity: "monthly" | "weekly" = "weekly";

    if (autoScale && monthCat) {
        const distinctMonths = new Set(
            (monthCat.values || []).map(v => v?.toString() || "")
        ).size;

        if (weekCat) {
            // Two fields: use distinct month count
            useMonthly = distinctMonths > monthThreshold;
        } else {
            // Single field: count-based fallback
            useMonthly = distinctMonths > monthThreshold * 4;
        }
        granularity = useMonthly ? "monthly" : "weekly";
    }

    let dataPoints: DataPoint[] = [];

    if (useMonthly && weekCat && monthCat) {
        // Aggregate weeks into months using monthCat as grouping key
        const monthMap   = new Map<string, { actual: number[], py: number[], budget: number[] }>();
        const monthOrder: string[] = [];

        (monthCat.values || []).forEach((m, i) => {
            const key = m?.toString() || "Unknown";
            if (!monthMap.has(key)) {
                monthMap.set(key, { actual: [], py: [], budget: [] });
                monthOrder.push(key);
            }
            const b = monthMap.get(key)!;
            b.actual.push(Number(actualCol?.values[i]) || 0);
            b.py.push(Number(pyCol?.values[i])         || 0);
            b.budget.push(Number(budgetCol?.values[i]) || 0);
        });

        dataPoints = monthOrder.map(month => ({
            label:  month,
            actual: aggregateValues(monthMap.get(month)!.actual, measureType),
            py:     aggregateValues(monthMap.get(month)!.py,     measureType),
            budget: aggregateValues(monthMap.get(month)!.budget, measureType)
        }));

    } else {
        // Weekly — use weekCat for labels if available
        const primaryValues = monthCat?.values || [];
        dataPoints = primaryValues.map((c, i) => ({
            label:  weekCat
                ? (weekCat.values[i]?.toString() || "")
                : (c?.toString() || ""),
            actual: Number(actualCol?.values[i]) || 0,
            py:     Number(pyCol?.values[i])     || 0,
            budget: Number(budgetCol?.values[i]) || 0
        }));
    }

    // Sort chronologically
    dataPoints = sortPoints(dataPoints, granularity);

    const actualMain = aggregateValues(dataPoints.map(p => p.actual), measureType);
    const pyMain     = aggregateValues(dataPoints.map(p => p.py),     measureType);
    const budgetMain = aggregateValues(dataPoints.map(p => p.budget), measureType);

    const pyPct     = pyMain     !== 0 ? ((actualMain - pyMain)     / Math.abs(pyMain))     * 100 : 0;
    const budgetPct = budgetMain !== 0 ? ((actualMain - budgetMain) / Math.abs(budgetMain)) * 100 : 0;

    return {
        dataPoints,
        actualMain,
        pyMain,
        budgetMain,
        pyPct,
        budgetPct,
        measureName:  actualCol?.source?.displayName || "KPI",
        granularity,
        formatString: actualCol?.source?.format || ""
    };
}
