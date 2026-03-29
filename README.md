# Smart KPI Card — Power BI Custom Visual

A compact, intelligent KPI card visual for Power BI with **auto-scaling sparklines**, **PY & Budget variance badges**, **hover tooltips with deltas**, and full formatting control.

---

## Preview

> KPI value with trend arrow, variance badges, and auto-scaling sparklines that switch between Monthly and Weekly views based on your slicer selection.

---

## Features

- **Auto-Scale Sparklines** — automatically switches between Monthly and Weekly granularity based on how many months are selected in your slicer
  - More than 2 months selected → Monthly trend
  - 1–2 months selected → Weekly trend
- **Three Sparklines** — Actual, PY (Prior Year), and Budget lines with individual color and width controls
- **Variance Badges** — PY and Budget badges with customizable positive/negative colors and threshold
- **Hover Tooltips** — shows period label, all three values, delta vs PY and Budget, plus up to 3 extra custom fields
- **Delta Rows** — show variance as %, absolute value, or both — with customizable labels and colors
- **Fill Under Line** — optional gradient fill under the Actual line
- **Marker Shapes** — Circle, Diamond, Square, or Triangle on hover
- **Font Control** — choose from 10 fonts for title and KPI value
- **Full Format Pane** — card background, border, badge colors, sparkline colors, tooltip options — all customizable
- **Sort Support** — right-click sort ascending/descending
- **Validation Messages** — helpful messages when fields are missing

---

## Data Roles

| Field | Role | Description |
|---|---|---|
| **Month Field** | Required | Higher-level grouping (e.g. `calendar_month_name_abbr`) |
| **Week Field** | Optional | Lower-level grouping (e.g. `week_of_month`) |
| **Actual Value** | Required | Your main KPI measure |
| **PY Value** | Optional | Prior year measure for comparison |
| **Budget Value** | Optional | Budget/target measure for comparison |
| **Tooltip Field 1–3** | Optional | Extra fields shown in hover tooltip |

---

## Installation

1. Download the latest `.pbiviz` file from [Releases](../../releases)
2. Open **Power BI Desktop**
3. In the Visualizations pane click **… → Import a visual from a file**
4. Select the downloaded `.pbiviz` file
5. Click **Import** and confirm

---

## Quick Start

1. Add the **Smart KPI Card** visual to your report canvas
2. Drag your **month column** into the **Month Field** slot
3. Drag your **week column** into the **Week Field** slot
4. Drag your **actual measure** into **Actual Value**
5. Optionally add **PY Value** and **Budget Value**
6. Add a **month slicer** to your report page

The sparkline will automatically switch between Monthly and Weekly views based on your slicer selection!

---

## Auto-Scale Logic

```
Slicer has > 2 months selected  →  Monthly sparkline (one point per month)
Slicer has ≤ 2 months selected  →  Weekly sparkline  (one point per week)
```

You can adjust the threshold in the **Sparklines** format pane section:
- **Monthly Threshold** — number of months above which the visual switches to monthly view (default: 2)

---

## Format Pane Options

### Card
| Option | Description |
|---|---|
| Background Color | Card background |
| Border Color | Card border color |
| Border Width | Border thickness in px |
| Corner Radius | Rounded corner radius |

### Title
| Option | Description |
|---|---|
| Font | 0=Default, 1=Arial, 2=Calibri, 3=Century Gothic, 4=Georgia, 5=Segoe UI, 6=Tahoma, 7=Times New Roman, 8=Trebuchet, 9=Verdana |
| Font Size | Title font size |
| Color | Title color |
| Bold / Italic | Text style |

### KPI Value
| Option | Description |
|---|---|
| Font | Same 0–9 font options |
| Font Size | Value font size |
| Color | Value color |
| Bold / Italic | Text style |
| Show Trend Arrow | Show ▲▼ next to value |
| Arrow Color | Trend arrow color |
| Display Units | Auto, K, M, B, T |
| Decimal Places | Number of decimal places |

### Variance Badges
| Option | Description |
|---|---|
| Show PY Badge | Toggle PY variance badge |
| Show Budget Badge | Toggle Budget variance badge |
| Font Size | Badge text size |
| Badge Radius | Badge corner radius |
| Positive Background/Text | Colors for positive variance |
| Negative Background/Text | Colors for negative variance |
| Threshold % | Cutoff for positive vs negative (default: 0) |

### Tooltip Labels
| Option | Description |
|---|---|
| Actual Label | 0=Actual, 1=Value, 2=Current, 3=This Year, 4=Actual Value, 5=KPI |
| PY Label | 0=PY, 1=Prior Year, 2=Last Year, 3=Previous Year, 4=Benchmark |
| Budget Label | 0=Budget, 1=Target, 2=Plan, 3=Forecast, 4=Goal |
| Tooltip 1–3 Label | 0=Use field name, 1=Date, 2=Period, 3=Week, 4=Earliest Date, 5=Latest Date |

### Delta (Variance)
| Option | Description |
|---|---|
| Show Delta | Toggle delta rows in tooltip |
| Show as % | Show percentage change |
| Show as Absolute | Show absolute difference |
| PY Delta Label | 0=vs PY, 1=vs Prior Year, 2=vs Last Year, 3=vs Previous Year, 4=YoY |
| Budget Delta Label | 0=vs Budget, 1=vs Target, 2=vs Plan, 3=vs Forecast, 4=vs Goal |
| Positive/Negative Color | Delta value colors |

### Sparklines
| Option | Description |
|---|---|
| Strip Height | Height of sparkline area in px |
| Actual/PY/Budget Color | Line colors |
| Actual/PY/Budget Width | Line widths in px |
| Fill Under Actual | Gradient fill under Actual line |
| Auto-Scale Granularity | Enable/disable auto-scaling |
| Monthly Threshold | Months above which monthly view activates |
| Show Hover Tooltip | Toggle tooltip on hover |
| Marker Shape | 0=Circle, 1=Diamond, 2=Square, 3=Triangle |
| Marker Size | Hover marker size in px |

---

## Measure Type Detection

The visual automatically detects whether your measure is a **percentage** or a **number**:

| Format String | Detected As | Aggregation | Display |
|---|---|---|---|
| Contains `%`, values 0–1 | Decimal % | Average | Multiplied × 100 |
| Contains `%`, values > 1 | Whole % | Average | As-is |
| No `%` | Number | Sum | With K/M/B/T suffix |

---

## Building from Source

### Prerequisites
- Node.js v18+
- Power BI Visual Tools: `npm install -g powerbi-visuals-tools`

### Setup
```bash
git clone https://github.com/YOURUSERNAME/smart-kpi-card.git
cd smart-kpi-card
npm install
```

### Development
```bash
pbiviz start
```

### Package
```bash
pbiviz package
```

The packaged `.pbiviz` file will be in the `dist/` folder.

### Version Bump
Before releasing, bump the version in `pbiviz.json`:
```json
"version": "1.0.0.0"  →  "version": "1.0.1.0"
```

---

## Project Structure

```
src/
├── visual.ts       — Main visual class, card layout, data binding
├── settings.ts     — Format pane settings definitions
├── dataMapper.ts   — Data parsing, granularity detection, aggregation
├── sparkline.ts    — Sparkline renderer, tooltip, markers, delta
└── formatter.ts    — Value formatting, measure type detection
```

---

## Roadmap

- [ ] Cross-filtering support
- [ ] Conditional formatting on KPI value
- [ ] Reference line on sparkline
- [ ] Animation on load
- [ ] AppSource submission

---

## Contributing

Pull requests are welcome! Please open an issue first to discuss what you would like to change.

---

## License

MIT © Smart KPI Card
