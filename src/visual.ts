"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions       = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual                   = powerbi.extensibility.visual.IVisual;

import { VisualFormattingSettingsModel } from "./settings";
import { mapData }                       from "./dataMapper";
import { SparklineRenderer, ACTUAL_LABELS, PY_LABELS, BUDGET_LABELS, getLabelName, TooltipField } from "./sparkline";
import { detectMeasureType, formatValue, FONTS } from "./formatter";

export class Visual implements IVisual {
    private target:    HTMLElement;
    private fmtSvc:    FormattingSettingsService;
    private fmtModel:  VisualFormattingSettingsModel;
    private sparkline: SparklineRenderer | null = null;

    constructor(options: VisualConstructorOptions) {
        this.fmtSvc = new FormattingSettingsService();
        this.target = options.element;
        this.target.style.cssText = "width:100%;height:100%;overflow:hidden;display:block;";
    }

    public update(options: VisualUpdateOptions) {
        while (this.target.firstChild) {
            this.target.removeChild(this.target.firstChild);
        }
        this.sparkline = null;

        // Get visual viewport size
        const vw = options.viewport?.width  || 300;
        const vh = options.viewport?.height || 200;

        const dataView = options.dataViews?.[0];
        if (!dataView?.categorical) {
            this.showMessage("Add data fields to get started");
            return;
        }

        this.fmtModel = this.fmtSvc.populateFormattingSettingsModel(
            VisualFormattingSettingsModel, dataView);

        const s   = this.fmtModel;
        const cs  = s.cardSettings;
        const ts  = s.titleSettings;
        const vs  = s.valueSettings;
        const bs  = s.badgeSettings;
        const ls  = s.labelSettings;
        const ss  = s.sparklineSettings;
        const ds  = (s as any).deltaSettings;

        const cat = dataView.categorical;

        let actualCol:   powerbi.DataViewValueColumn | undefined;
        let pyCol:       powerbi.DataViewValueColumn | undefined;
        let budgetCol:   powerbi.DataViewValueColumn | undefined;
        let tooltip1Col: powerbi.DataViewValueColumn | undefined;
        let tooltip2Col: powerbi.DataViewValueColumn | undefined;
        let tooltip3Col: powerbi.DataViewValueColumn | undefined;

        if (cat.values) {
            for (const col of cat.values) {
                if (col.source.roles["actual"])   actualCol   = col;
                if (col.source.roles["py"])       pyCol       = col;
                if (col.source.roles["budget"])   budgetCol   = col;
                if (col.source.roles["tooltip1"]) tooltip1Col = col;
                if (col.source.roles["tooltip2"]) tooltip2Col = col;
                if (col.source.roles["tooltip3"]) tooltip3Col = col;
            }
        }

        if (!actualCol) {
            this.showMessage("Please add an Actual Value field");
            return;
        }

        const rawValues    = (actualCol.values || []).map(v => Number(v) || 0);
        const formatString = actualCol.source?.format || "";
        const measureType  = detectMeasureType(formatString, rawValues);
        const dp           = Number(vs.decimalPlaces.value) || 1;
        const du           = Number(vs.displayUnits.value)  || 0;

        const data = mapData(
            dataView, measureType,
            ss.autoScale.value,
            Number(ss.monthThreshold.value) || 2
        );

        if (!data || data.dataPoints.length === 0) {
            this.showMessage("No data available");
            return;
        }

        // Tooltip fields per data point
        const TOOLTIP_LABELS = ["", "Date", "Period", "Week", "Earliest Date", "Latest Date"];
        const getTooltipLabel = (col: powerbi.DataViewValueColumn, idx: number) => {
            const preset = TOOLTIP_LABELS[Math.max(0, Math.min(idx, TOOLTIP_LABELS.length-1))];
            return preset || col.source.displayName;
        };
        const fmtTooltipVal = (col: powerbi.DataViewValueColumn, i: number): string => {
            const raw = col.values[i];
            if (raw === null || raw === undefined) return "-";
            // Convert serial date number to Date if format indicates date
            const colFmt = col.source.format || "";
            const colFmtL = colFmt.toLowerCase();
            const isDateFmt = colFmtL.includes("d") || colFmtL.includes("m") || colFmtL.includes("y");
            if (typeof raw === "number" && isDateFmt && raw > 10000) {
                const d = new Date(raw);
                if (!isNaN(d.getTime())) {
                    if (colFmtL.includes("hh") || colFmtL.includes("h:")) {
                        return d.toLocaleString("en-US");
                    }
                    return d.toLocaleDateString("en-US");
                }
            }
            const fmt = col.source.format || "";
            if (raw instanceof Date) {
                // Use Power BI format string to decide date format
                if (fmt.includes("dddd") || fmt.toLowerCase().includes("mmmm")) {
                    return raw.toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
                } else if (fmt.includes("ddd") || fmt.toLowerCase().includes("mmm")) {
                    return raw.toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" });
                } else if (fmt.includes("dd") || fmt.includes("MM") || fmt.includes("yy")) {
                    return raw.toLocaleDateString("en-US");
                }
                return raw.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
            }
            const num = Number(raw);
            if (!isNaN(num) && num !== 0) {
                if (fmt.includes("%")) return (num * 100).toFixed(1) + "%";
                const abs = Math.abs(num);
                if (abs >= 1e6) return (num/1e6).toFixed(1) + "M";
                if (abs >= 1e3) return (num/1e3).toFixed(1) + "K";
                return num.toLocaleString("en-US", { maximumFractionDigits: 1 });
            }
            return raw.toString();
        };
        const t1Idx = Number(ls.tooltip1LabelIdx?.value) || 0;
        const t2Idx = Number(ls.tooltip2LabelIdx?.value) || 0;
        const t3Idx = Number(ls.tooltip3LabelIdx?.value) || 0;
        const tooltipFields: TooltipField[][] = data.dataPoints.map((_, i) => {
            const fields: TooltipField[] = [];
            if (tooltip1Col) fields.push({ label: getTooltipLabel(tooltip1Col, t1Idx), value: 0, formatString: "", displayValue: fmtTooltipVal(tooltip1Col, i) });
            if (tooltip2Col) fields.push({ label: getTooltipLabel(tooltip2Col, t2Idx), value: 0, formatString: "", displayValue: fmtTooltipVal(tooltip2Col, i) });
            if (tooltip3Col) fields.push({ label: getTooltipLabel(tooltip3Col, t3Idx), value: 0, formatString: "", displayValue: fmtTooltipVal(tooltip3Col, i) });
            return fields;
        });

        const actualLabel = getLabelName(ACTUAL_LABELS, Number(ls.actualLabelIdx.value)  || 0);
        const pyLabel     = getLabelName(PY_LABELS,     Number(ls.pyLabelIdx.value)      || 0);
        const budgetLabel = getLabelName(BUDGET_LABELS, Number(ls.budgetLabelIdx.value)  || 0);

        const titleFont = FONTS[Math.max(0, Math.min(Number(ts.fontFamily.value) || 0, FONTS.length - 1))];
        const valueFont = FONTS[Math.max(0, Math.min(Number(vs.fontFamily.value) || 0, FONTS.length - 1))];

        // --- CARD fills full viewport ---
        const card = this.el("div");
        card.style.cssText = `
            width:          ${vw}px;
            height:         ${vh}px;
            background:     ${cs.backgroundColor.value.value};
            border:         ${cs.borderWidth.value}px solid ${cs.borderColor.value.value};
            border-radius:  ${cs.borderRadius.value}px;
            padding:        12px 14px 0 14px;
            box-sizing:     border-box;
            display:        flex;
            flex-direction: column;
            font-family:    sans-serif;
            overflow:       hidden;
        `;

        // Top section â€” fixed height
        const topRow = this.el("div");
        topRow.style.cssText = "display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;gap:8px;flex-shrink:0;";

        const leftCol = this.el("div");
        leftCol.style.cssText = "display:flex;flex-direction:column;min-width:0;flex:1;";

        const titleEl = this.el("p");
        titleEl.textContent = data.measureName;
        titleEl.style.cssText = `margin:0 0 2px;font-size:${ts.fontSize.value}px;color:${ts.color.value.value};font-weight:${ts.bold.value ? "600" : "400"};font-style:${ts.italic.value ? "italic" : "normal"};font-family:${titleFont};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;
        leftCol.appendChild(titleEl);

        const valueRow = this.el("div");
        valueRow.style.cssText = "display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;";

        const valueEl = this.el("span");
        valueEl.textContent = formatValue(data.actualMain, measureType, dp, du);
        valueEl.style.cssText = `font-size:${vs.fontSize.value}px;color:${vs.color.value.value};font-weight:${vs.bold.value ? "600" : "400"};font-style:${vs.italic.value ? "italic" : "normal"};font-family:${valueFont};line-height:1.1;`;
        valueRow.appendChild(valueEl);

        if (vs.showTrendArrow.value && data.pyMain !== 0) {
            const arrow = this.el("span");
            arrow.textContent = data.pyPct >= 0 ? "\u25b2" : "\u25bc";
            arrow.style.cssText = `font-size:${Math.round(vs.fontSize.value * 0.5)}px;color:${vs.arrowColor.value.value};flex-shrink:0;font-family:sans-serif;`;
            valueRow.appendChild(arrow);
        }
        leftCol.appendChild(valueRow);
        topRow.appendChild(leftCol);

        const rightCol = this.el("div");
        rightCol.style.cssText = "display:flex;flex-direction:column;align-items:flex-end;gap:4px;padding-top:2px;flex-shrink:0;";

        const thresh = Number(bs.threshold.value) || 0;
        if (bs.showPY.value && data.pyMain !== 0) {
            rightCol.appendChild(this.makeBadge(pyLabel,     data.pyPct,     thresh, bs));
        }
        if (bs.showBudget.value && data.budgetMain !== 0) {
            rightCol.appendChild(this.makeBadge(budgetLabel, data.budgetPct, thresh, bs));
        }
        topRow.appendChild(rightCol);
        card.appendChild(topRow);

        // Sparkline strip â€” flex:1 fills ALL remaining height
        const strip = this.el("div");
        strip.style.cssText = "width:100%;flex:1;position:relative;min-height:40px;margin-top:4px;padding-bottom:6px;box-sizing:border-box;";

        const canvas = document.createElement("canvas");
        canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;cursor:crosshair;";
        strip.appendChild(canvas);

        // Granularity label
        if (ss.autoScale.value) {
            const gran = this.el("div");
            gran.style.cssText = "position:absolute;bottom:8px;right:5px;font-size:9px;color:rgba(120,120,120,0.45);pointer-events:none;font-style:italic;";
            gran.textContent   = data.granularity === "monthly" ? "Monthly" : "Weekly";
            strip.appendChild(gran);
        }

        // Tooltip
        const tooltipEl = this.el("div");
        tooltipEl.style.cssText = `position:absolute;display:none;background:#fff;border:0.5px solid #d0d0d0;border-radius:8px;padding:8px 12px;pointer-events:none;z-index:99;min-width:150px;box-shadow:0 2px 8px rgba(0,0,0,0.1);`;
        strip.appendChild(tooltipEl);
        card.appendChild(strip);
        this.target.appendChild(card);

        // Init sparkline
        this.sparkline = new SparklineRenderer(
            canvas, tooltipEl,
            {
                colors:  { actual: ss.actualColor.value.value, py: ss.pyColor.value.value, budget: ss.budgetColor.value.value },
                widths:  { actual: Number(ss.actualWidth.value) || 2, py: Number(ss.pyWidth.value) || 1, budget: Number(ss.budgetWidth.value) || 1 },
                fillUnder:   ss.fillUnder.value,
                markerShape: Math.max(0, Math.min(Number(ss.markerShape.value) || 0, 3)),
                markerSize:  Math.max(3, Number(ss.markerSize.value) || 5),
                showTooltip: ss.showTooltip.value,
                actualLabel, pyLabel, budgetLabel,
                tooltipFields,
                delta: {
                    showDelta:          ds?.showDelta?.value ?? true,
                    showDeltaPct:       ds?.showDeltaPct?.value ?? true,
                    showDeltaAbs:       ds?.showDeltaAbs?.value ?? false,
                    pyDeltaLabel:       ds?.pyDeltaLabelIdx?.value ?? 0,
                    budgetDeltaLabel:   ds?.budgetDeltaLabelIdx?.value ?? 0,
                    positiveDeltaColor: ds?.positiveDeltaColor?.value?.value ?? "#3B6D11",
                    negativeDeltaColor: ds?.negativeDeltaColor?.value?.value ?? "#A32D2D"
                }
            },
            measureType, dp
        );

        this.sparkline.setData(data.dataPoints);

        // Use ResizeObserver to redraw when strip size changes
        setTimeout(() => {
            if (this.sparkline) {
                this.sparkline.draw();
                this.sparkline.bindEvents();
            }
        }, 50);
    }

    private showMessage(msg: string) {
        const el = this.el("div");
        el.style.cssText = "display:flex;align-items:center;justify-content:center;height:100%;width:100%;font-size:13px;color:#888;font-family:sans-serif;padding:16px;box-sizing:border-box;text-align:center;";
        el.textContent = msg;
        this.target.appendChild(el);
    }

    private makeBadge(label: string, pct: number, thresh: number, bs: any): HTMLElement {
        const isPos = pct >= thresh;
        const badge = this.el("span");
        badge.textContent = label + " " + (isPos ? "\u25b3" : "\u25bd") + " " + Math.abs(pct).toFixed(1) + "%";
        badge.style.cssText = `display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:${bs.borderRadius.value}px;font-size:${bs.fontSize.value}px;font-weight:500;white-space:nowrap;font-family:sans-serif;background:${isPos ? bs.positiveBackground.value.value : bs.negativeBackground.value.value};color:${isPos ? bs.positiveColor.value.value : bs.negativeColor.value.value};`;
        return badge;
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.fmtSvc.buildFormattingModel(this.fmtModel);
    }

    private el(tag: string): HTMLElement {
        return document.createElement(tag);
    }
}











