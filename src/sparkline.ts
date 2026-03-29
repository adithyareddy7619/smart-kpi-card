"use strict";

import { DataPoint } from "./dataMapper";
import { MeasureType, formatValue } from "./formatter";

export interface SparklineColors {
    actual: string;
    py:     string;
    budget: string;
}

export interface SparklineWidths {
    actual: number;
    py:     number;
    budget: number;
}

export interface TooltipField {
    label: string;
    value: number;
    formatString: string;
    displayValue?: string;  // pre-formatted display value (handles dates)
}

export interface DeltaOptions {
    showDelta:          boolean;
    showDeltaPct:       boolean;
    showDeltaAbs:       boolean;
    pyDeltaLabel:       string;
    budgetDeltaLabel:   string;
    positiveDeltaColor: string;
    negativeDeltaColor: string;
}

export interface SparklineOptions {
    colors:        SparklineColors;
    widths:        SparklineWidths;
    fillUnder:     boolean;
    markerShape:   number;
    markerSize:    number;
    showTooltip:   boolean;
    actualLabel:   string;
    pyLabel:       string;
    budgetLabel:   string;
    tooltipFields: TooltipField[][];  // per data point
    delta: DeltaOptions;
}

const SHAPES = ["circle", "diamond", "square", "triangle"];

const ACTUAL_LABELS  = ["Actual", "Value", "Current", "This Year", "Actual Value", "KPI"];
const PY_LABELS      = ["PY", "Prior Year", "Last Year", "Previous Year", "Benchmark"];
const BUDGET_LABELS  = ["Budget", "Target", "Plan", "Forecast", "Goal"];

export function getLabelName(labels: string[], idx: number): string {
    return labels[Math.max(0, Math.min(idx, labels.length - 1))];
}

export { ACTUAL_LABELS, PY_LABELS, BUDGET_LABELS };

function drawShape(ctx: CanvasRenderingContext2D, x: number, y: number, shape: string, size: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    switch (shape) {
        case "diamond":
            ctx.moveTo(x, y - size); ctx.lineTo(x + size, y);
            ctx.lineTo(x, y + size); ctx.lineTo(x - size, y);
            ctx.closePath(); break;
        case "square":
            ctx.rect(x - size, y - size, size * 2, size * 2); break;
        case "triangle":
            ctx.moveTo(x, y - size); ctx.lineTo(x + size, y + size);
            ctx.lineTo(x - size, y + size); ctx.closePath(); break;
        default:
            ctx.arc(x, y, size, 0, Math.PI * 2); break;
    }
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
}

function drawLine(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[], color: string, lw: number) {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = color; ctx.lineWidth = lw;
    ctx.lineJoin = "round";  ctx.lineCap  = "round";
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();
}

export class SparklineRenderer {
    private canvas:      HTMLCanvasElement;
    private tooltipEl:   HTMLElement;
    private dataPoints:  DataPoint[] = [];
    private opts:        SparklineOptions;
    private measureType: MeasureType;
    private decimalPlaces: number;

    private pA: { x: number; y: number; v: number; l: string }[] = [];
    private pP: { x: number; y: number; v: number; l: string }[] = [];
    private pB: { x: number; y: number; v: number; l: string }[] = [];

    constructor(
        canvas: HTMLCanvasElement,
        tooltipEl: HTMLElement,
        opts: SparklineOptions,
        measureType: MeasureType,
        decimalPlaces: number
    ) {
        this.canvas        = canvas;
        this.tooltipEl     = tooltipEl;
        this.opts          = opts;
        this.measureType   = measureType;
        this.decimalPlaces = decimalPlaces;
    }

    public setData(dataPoints: DataPoint[]) {
        this.dataPoints = dataPoints;
    }

    public draw(hovIdx?: number) {
        const strip = this.canvas.parentElement;
        if (!strip) return;
        this.canvas.width  = strip.offsetWidth;
        this.canvas.height = strip.offsetHeight;

        const ctx = this.canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const pts = this.dataPoints;
        const n   = pts.length;
        if (n < 2) return;

        const pad = 8;
        const W   = this.canvas.width  - pad * 2;
        const H   = this.canvas.height - pad * 2;

        const allVals = pts.flatMap(p => [p.actual, p.py, p.budget])
            .filter(v => v !== 0 && !isNaN(v) && isFinite(v));
        if (allVals.length === 0) return;

        const minV = Math.min(...allVals) * 0.92;
        const maxV = Math.max(...allVals) * 1.05;
        const rng  = maxV - minV || 1;

        const toX = (i: number) => pad + (i / (n - 1)) * W;
        const toY = (v: number) => pad + H - ((v - minV) / rng) * H;

        this.pA = pts.map((p, i) => ({ x: toX(i), y: toY(p.actual), v: p.actual, l: p.label }));
        this.pP = pts.map((p, i) => ({ x: toX(i), y: toY(p.py),     v: p.py,     l: p.label }));
        this.pB = pts.map((p, i) => ({ x: toX(i), y: toY(p.budget), v: p.budget, l: p.label }));

        if (this.opts.fillUnder) {
            ctx.beginPath();
            this.pA.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
            ctx.lineTo(this.pA[this.pA.length - 1].x, this.canvas.height - pad);
            ctx.lineTo(this.pA[0].x, this.canvas.height - pad);
            ctx.closePath();
            const grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            grad.addColorStop(0, this.opts.colors.actual + "44");
            grad.addColorStop(1, this.opts.colors.actual + "00");
            ctx.fillStyle = grad; ctx.fill();
        }

        if (this.pP.some(p => p.v !== 0)) drawLine(ctx, this.pP, this.opts.colors.py,     this.opts.widths.py);
        if (this.pB.some(p => p.v !== 0)) drawLine(ctx, this.pB, this.opts.colors.budget, this.opts.widths.budget);
        drawLine(ctx, this.pA, this.opts.colors.actual, this.opts.widths.actual);

        if (hovIdx !== undefined && hovIdx < this.pA.length) {
            const shape = SHAPES[Math.max(0, Math.min(this.opts.markerShape, 3))];
            const sz    = Math.max(3, this.opts.markerSize);
            [
                { pts: this.pA, color: this.opts.colors.actual },
                { pts: this.pP, color: this.opts.colors.py     },
                { pts: this.pB, color: this.opts.colors.budget  }
            ].forEach(({ pts: p, color }) => {
                if (hovIdx < p.length && p[hovIdx].v !== 0) {
                    drawShape(ctx, p[hovIdx].x, p[hovIdx].y, shape, sz, color);
                }
            });
        }
    }

    private nearestIdx(mx: number): number {
        if (!this.pA.length) return -1;
        let best = 0, bd = Infinity;
        this.pA.forEach((p, i) => {
            const d = Math.abs(p.x - mx);
            if (d < bd) { bd = d; best = i; }
        });
        return bd < 50 ? best : -1;
    }

    private el(tag: string): HTMLElement {
        return document.createElement(tag);
    }

    private buildTooltip(idx: number) {
        while (this.tooltipEl.firstChild) {
            this.tooltipEl.removeChild(this.tooltipEl.firstChild);
        }

        // Header — period label
        const hd = this.el("div");
        hd.textContent = this.pA[idx].l;
        hd.style.cssText = "font-size:11px;color:#555;font-weight:600;margin-bottom:5px;padding-bottom:4px;border-bottom:0.5px solid #eee;";
        this.tooltipEl.appendChild(hd);

        // Sparkline values
        const lines: { v: number; color: string; label: string }[] = [
            { v: this.pA[idx].v, color: this.opts.colors.actual, label: this.opts.actualLabel },
            { v: this.pP[idx].v, color: this.opts.colors.py,     label: this.opts.pyLabel     },
            { v: this.pB[idx].v, color: this.opts.colors.budget,  label: this.opts.budgetLabel }
        ];

        lines.forEach(({ v, color, label }) => {
            if (v === 0) return;
            const row = this.el("div");
            row.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:3px;";

            const left = this.el("div");
            left.style.cssText = "display:flex;align-items:center;gap:5px;";

            const dot = this.el("span");
            dot.style.cssText = `width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0;`;

            const lbl = this.el("span");
            lbl.style.cssText = "font-size:11px;color:#555;";
            lbl.textContent   = label;

            const val = this.el("span");
            val.style.cssText = "font-size:11px;color:#111;font-weight:500;";
            val.textContent   = formatValue(v, this.measureType, this.decimalPlaces);

            left.appendChild(dot);
            left.appendChild(lbl);
            row.appendChild(left);
            row.appendChild(val);
            this.tooltipEl.appendChild(row);
        });

        // Delta rows
        const d = this.opts.delta;
        const PY_DELTA_LABELS     = ["vs PY", "vs Prior Year", "vs Last Year", "vs Previous Year", "YoY"];
        const BUDGET_DELTA_LABELS = ["vs Budget", "vs Target", "vs Plan", "vs Forecast", "vs Goal"];

        if (d.showDelta) {
            const hasPY     = this.pP[idx]?.v !== 0;
            const hasBudget = this.pB[idx]?.v !== 0;

            if (hasPY || hasBudget) {
                const deltaSep = this.el("div");
                deltaSep.style.cssText = "border-top:0.5px solid #eee;margin:5px 0 4px;";
                this.tooltipEl.appendChild(deltaSep);
            }

            if (hasPY) {
                const pyVal    = this.pP[idx].v;
                const actVal   = this.pA[idx].v;
                const deltaPct = pyVal !== 0 ? ((actVal - pyVal) / Math.abs(pyVal)) * 100 : 0;
                const deltaAbs = actVal - pyVal;
                const isPos    = deltaPct >= 0;
                const color    = isPos ? d.positiveDeltaColor : d.negativeDeltaColor;
                const sign     = isPos ? "+" : "";
                const label    = PY_DELTA_LABELS[Math.max(0, Math.min(Math.round(Number(d.pyDeltaLabel) || 0), PY_DELTA_LABELS.length-1))];

                const row = this.el("div");
                row.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:3px;";

                const lbl = this.el("span");
                lbl.style.cssText = `font-size:11px;color:#555;`;
                lbl.textContent   = label;

                const val = this.el("span");
                val.style.cssText = `font-size:11px;font-weight:500;color:${color};`;
                let valText = "";
                if (d.showDeltaPct) valText += sign + deltaPct.toFixed(1) + "%";
                if (d.showDeltaPct && d.showDeltaAbs) valText += " / ";
                if (d.showDeltaAbs) {
                    const absAbs = Math.abs(deltaAbs);
                    const fmtAbs = absAbs >= 1e6 ? (deltaAbs/1e6).toFixed(1)+"M"
                                 : absAbs >= 1e3 ? (deltaAbs/1e3).toFixed(1)+"K"
                                 : deltaAbs.toFixed(1);
                    valText += (isPos ? "+" : "") + fmtAbs;
                }
                val.textContent = valText;

                row.appendChild(lbl);
                row.appendChild(val);
                this.tooltipEl.appendChild(row);
            }

            if (hasBudget) {
                const budVal   = this.pB[idx].v;
                const actVal   = this.pA[idx].v;
                const deltaPct = budVal !== 0 ? ((actVal - budVal) / Math.abs(budVal)) * 100 : 0;
                const deltaAbs = actVal - budVal;
                const isPos    = deltaPct >= 0;
                const color    = isPos ? d.positiveDeltaColor : d.negativeDeltaColor;
                const sign     = isPos ? "+" : "";
                const label    = BUDGET_DELTA_LABELS[Math.max(0, Math.min(Math.round(Number(d.budgetDeltaLabel) || 0), BUDGET_DELTA_LABELS.length-1))];

                const row = this.el("div");
                row.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:3px;";

                const lbl = this.el("span");
                lbl.style.cssText = `font-size:11px;color:#555;`;
                lbl.textContent   = label;

                const val = this.el("span");
                val.style.cssText = `font-size:11px;font-weight:500;color:${color};`;
                let valText = "";
                if (d.showDeltaPct) valText += sign + deltaPct.toFixed(1) + "%";
                if (d.showDeltaPct && d.showDeltaAbs) valText += " / ";
                if (d.showDeltaAbs) {
                    const absAbs = Math.abs(deltaAbs);
                    const fmtAbs = absAbs >= 1e6 ? (deltaAbs/1e6).toFixed(1)+"M"
                                 : absAbs >= 1e3 ? (deltaAbs/1e3).toFixed(1)+"K"
                                 : deltaAbs.toFixed(1);
                    valText += (isPos ? "+" : "") + fmtAbs;
                }
                val.textContent = valText;

                row.appendChild(lbl);
                row.appendChild(val);
                this.tooltipEl.appendChild(row);
            }
        }

        // Extra tooltip fields
        const extraFields = this.opts.tooltipFields[idx] || [];
        if (extraFields.length > 0) {
            const sep = this.el("div");
            sep.style.cssText = "border-top:0.5px solid #eee;margin:5px 0 4px;";
            this.tooltipEl.appendChild(sep);

            extraFields.forEach(field => {
                if (field.value === 0 && !field.label) return;
                const row = this.el("div");
                row.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:3px;";

                const lbl = this.el("span");
                lbl.style.cssText = "font-size:11px;color:#555;";
                lbl.textContent   = field.label;

                const val = this.el("span");
                val.style.cssText = "font-size:11px;color:#111;font-weight:500;";
                // Format extra field as number with auto units
                if (field.displayValue !== undefined && field.displayValue !== "") {
                    val.textContent = field.displayValue;
                } else {
                    const abs = Math.abs(field.value);
                    if (abs >= 1e6)      val.textContent = (field.value / 1e6).toFixed(1) + "M";
                    else if (abs >= 1e3) val.textContent = (field.value / 1e3).toFixed(1) + "K";
                    else                 val.textContent = field.value.toLocaleString("en-US", { maximumFractionDigits: 1 });
                }

                row.appendChild(lbl);
                row.appendChild(val);
                this.tooltipEl.appendChild(row);
            });
        }
    }

    public bindEvents() {
        this.canvas.addEventListener("mousemove", (e: MouseEvent) => {
            const rect = this.canvas.getBoundingClientRect();
            const idx  = this.nearestIdx(e.clientX - rect.left);

            if (idx === -1) {
                this.tooltipEl.style.display = "none";
                this.draw(); return;
            }

            this.draw(idx);

            if (this.opts.showTooltip) {
                this.buildTooltip(idx);
                const sr = this.canvas.getBoundingClientRect();
                this.tooltipEl.style.display = "block";
                this.tooltipEl.style.left = Math.min(e.clientX - sr.left + 12, sr.width - 160) + "px";
                this.tooltipEl.style.top  = "4px";
            }
        });

        this.canvas.addEventListener("mouseleave", () => {
            this.tooltipEl.style.display = "none";
            this.draw();
        });
    }
}
