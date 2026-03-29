"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard  = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

class CardSettings extends FormattingSettingsCard {
    backgroundColor = new formattingSettings.ColorPicker({ name: "backgroundColor", displayName: "Background Color",   value: { value: "#ffffff" } });
    borderColor     = new formattingSettings.ColorPicker({ name: "borderColor",     displayName: "Border Color",       value: { value: "#d3d1c7" } });
    borderWidth     = new formattingSettings.NumUpDown({   name: "borderWidth",     displayName: "Border Width (px)",  value: 1 });
    borderRadius    = new formattingSettings.NumUpDown({   name: "borderRadius",    displayName: "Corner Radius (px)", value: 12 });
    name: string = "cardSettings";
    displayName: string = "Card";
    slices: Array<FormattingSettingsSlice> = [this.backgroundColor, this.borderColor, this.borderWidth, this.borderRadius];
}

class TitleSettings extends FormattingSettingsCard {
    fontFamily = new formattingSettings.NumUpDown({ name: "fontFamily", displayName: "Font (0=Default 1=Arial 2=Calibri 3=Century Gothic 4=Georgia 5=Segoe UI 6=Tahoma 7=Times New Roman 8=Trebuchet 9=Verdana)", value: 0 });
    fontSize   = new formattingSettings.NumUpDown({    name: "fontSize", displayName: "Font Size", value: 13 });
    color      = new formattingSettings.ColorPicker({  name: "color",    displayName: "Color",     value: { value: "#888780" } });
    bold       = new formattingSettings.ToggleSwitch({ name: "bold",     displayName: "Bold",      value: false });
    italic     = new formattingSettings.ToggleSwitch({ name: "italic",   displayName: "Italic",    value: false });
    name: string = "titleSettings";
    displayName: string = "Title";
    slices: Array<FormattingSettingsSlice> = [this.fontFamily, this.fontSize, this.color, this.bold, this.italic];
}

class ValueSettings extends FormattingSettingsCard {
    fontFamily     = new formattingSettings.NumUpDown({ name: "fontFamily", displayName: "Font (0=Default 1=Arial 2=Calibri 3=Century Gothic 4=Georgia 5=Segoe UI 6=Tahoma 7=Times New Roman 8=Trebuchet 9=Verdana)", value: 0 });
    fontSize       = new formattingSettings.NumUpDown({    name: "fontSize",       displayName: "Font Size",      value: 36 });
    color          = new formattingSettings.ColorPicker({  name: "color",          displayName: "Color",           value: { value: "#2C2C2A" } });
    bold           = new formattingSettings.ToggleSwitch({ name: "bold",           displayName: "Bold",            value: true });
    italic         = new formattingSettings.ToggleSwitch({ name: "italic",         displayName: "Italic",          value: false });
    showTrendArrow = new formattingSettings.ToggleSwitch({ name: "showTrendArrow", displayName: "Show Trend Arrow", value: true });
    arrowColor     = new formattingSettings.ColorPicker({  name: "arrowColor",     displayName: "Arrow Color",     value: { value: "#A32D2D" } });
    displayUnits   = new formattingSettings.AutoDropdown({ name: "displayUnits",   displayName: "Display Units",   value: 0 });
    decimalPlaces  = new formattingSettings.NumUpDown({    name: "decimalPlaces",  displayName: "Decimal Places",  value: 1 });
    name: string = "valueSettings";
    displayName: string = "KPI Value";
    slices: Array<FormattingSettingsSlice> = [
        this.fontFamily, this.fontSize, this.color, this.bold, this.italic,
        this.showTrendArrow, this.arrowColor, this.displayUnits, this.decimalPlaces
    ];
}

class BadgeSettings extends FormattingSettingsCard {
    showPY             = new formattingSettings.ToggleSwitch({ name: "showPY",             displayName: "Show PY Badge",       value: true });
    showBudget         = new formattingSettings.ToggleSwitch({ name: "showBudget",         displayName: "Show Budget Badge",   value: true });
    fontSize           = new formattingSettings.NumUpDown({   name: "fontSize",            displayName: "Font Size",           value: 12 });
    borderRadius       = new formattingSettings.NumUpDown({   name: "borderRadius",        displayName: "Badge Radius (px)",   value: 6 });
    positiveBackground = new formattingSettings.ColorPicker({ name: "positiveBackground", displayName: "Positive Background", value: { value: "#EAF3DE" } });
    positiveColor      = new formattingSettings.ColorPicker({ name: "positiveColor",       displayName: "Positive Text",       value: { value: "#3B6D11" } });
    negativeBackground = new formattingSettings.ColorPicker({ name: "negativeBackground", displayName: "Negative Background", value: { value: "#FCEBEB" } });
    negativeColor      = new formattingSettings.ColorPicker({ name: "negativeColor",       displayName: "Negative Text",       value: { value: "#A32D2D" } });
    threshold          = new formattingSettings.NumUpDown({   name: "threshold",           displayName: "Threshold %",         value: 0 });
    name: string = "badgeSettings";
    displayName: string = "Variance Badges";
    slices: Array<FormattingSettingsSlice> = [
        this.showPY, this.showBudget, this.fontSize, this.borderRadius,
        this.positiveBackground, this.positiveColor,
        this.negativeBackground, this.negativeColor,
        this.threshold
    ];
}

class LabelSettings extends FormattingSettingsCard {
    actualLabelIdx = new formattingSettings.NumUpDown({ name: "actualLabelIdx", displayName: "Actual Label (0=Actual 1=Value 2=Current 3=This Year 4=Actual Value 5=KPI)", value: 0 });
    pyLabelIdx     = new formattingSettings.NumUpDown({ name: "pyLabelIdx",     displayName: "PY Label (0=PY 1=Prior Year 2=Last Year 3=Previous Year 4=Benchmark)",       value: 0 });
    budgetLabelIdx = new formattingSettings.NumUpDown({ name: "budgetLabelIdx", displayName: "Budget Label (0=Budget 1=Target 2=Plan 3=Forecast 4=Goal)",                  value: 0 });
    // Tooltip field custom labels — use NumUpDown as char codes trick won't work
    // Instead we use preset label options for tooltip fields too
    tooltip1LabelIdx = new formattingSettings.NumUpDown({ name: "tooltip1LabelIdx", displayName: "Tooltip 1 Label (0=Use field name 1=Date 2=Period 3=Week 4=Start Date 5=End Date)", value: 0 });
    tooltip2LabelIdx = new formattingSettings.NumUpDown({ name: "tooltip2LabelIdx", displayName: "Tooltip 2 Label (0=Use field name 1=Date 2=Period 3=Week 4=Start Date 5=End Date)", value: 0 });
    tooltip3LabelIdx = new formattingSettings.NumUpDown({ name: "tooltip3LabelIdx", displayName: "Tooltip 3 Label (0=Use field name 1=Date 2=Period 3=Week 4=Start Date 5=End Date)", value: 0 });
    name: string = "labelSettings";
    displayName: string = "Tooltip Labels";
    slices: Array<FormattingSettingsSlice> = [
        this.actualLabelIdx, this.pyLabelIdx, this.budgetLabelIdx,
        this.tooltip1LabelIdx, this.tooltip2LabelIdx, this.tooltip3LabelIdx
    ];
}

class SparklineSettings extends FormattingSettingsCard {
    stripHeight    = new formattingSettings.NumUpDown({   name: "stripHeight",    displayName: "Strip Height (px)",           value: 64 });
    actualColor    = new formattingSettings.ColorPicker({ name: "actualColor",    displayName: "Actual Line Color",           value: { value: "#185FA5" } });
    actualWidth    = new formattingSettings.NumUpDown({   name: "actualWidth",    displayName: "Actual Line Width (px)",      value: 2 });
    pyColor        = new formattingSettings.ColorPicker({ name: "pyColor",        displayName: "PY Line Color",               value: { value: "#639922" } });
    pyWidth        = new formattingSettings.NumUpDown({   name: "pyWidth",        displayName: "PY Line Width (px)",          value: 1 });
    budgetColor    = new formattingSettings.ColorPicker({ name: "budgetColor",    displayName: "Budget Line Color",           value: { value: "#D85A30" } });
    budgetWidth    = new formattingSettings.NumUpDown({   name: "budgetWidth",    displayName: "Budget Line Width (px)",      value: 1 });
    fillUnder      = new formattingSettings.ToggleSwitch({ name: "fillUnder",     displayName: "Fill Under Actual Line",      value: false });
    autoScale      = new formattingSettings.ToggleSwitch({ name: "autoScale",     displayName: "Auto-Scale Granularity",      value: true });
    monthThreshold = new formattingSettings.NumUpDown({   name: "monthThreshold", displayName: "Monthly Threshold (months)",  value: 2 });
    showTooltip    = new formattingSettings.ToggleSwitch({ name: "showTooltip",   displayName: "Show Hover Tooltip",          value: true });
    markerShape    = new formattingSettings.NumUpDown({   name: "markerShape",    displayName: "Marker Shape (0=Circle 1=Diamond 2=Square 3=Triangle)", value: 0 });
    markerSize     = new formattingSettings.NumUpDown({   name: "markerSize",     displayName: "Marker Size (px)",            value: 5 });
    name: string = "sparklineSettings";
    displayName: string = "Sparklines";
    slices: Array<FormattingSettingsSlice> = [
        this.stripHeight,
        this.actualColor, this.actualWidth,
        this.pyColor,     this.pyWidth,
        this.budgetColor, this.budgetWidth,
        this.fillUnder,
        this.autoScale,   this.monthThreshold,
        this.showTooltip, this.markerShape, this.markerSize
    ];
}


class DeltaSettings extends FormattingSettingsCard {
    showDelta      = new formattingSettings.ToggleSwitch({ name: "showDelta",      displayName: "Show Delta in Tooltip",        value: true });
    showDeltaPct   = new formattingSettings.ToggleSwitch({ name: "showDeltaPct",   displayName: "Show Delta as %",              value: true });
    showDeltaAbs   = new formattingSettings.ToggleSwitch({ name: "showDeltaAbs",   displayName: "Show Delta as Absolute Value", value: false });
    pyDeltaLabelIdx    = new formattingSettings.NumUpDown({ name: "pyDeltaLabelIdx",     displayName: "PY Delta Label (0=vs PY 1=vs Prior Year 2=vs Last Year 3=vs Previous Year 4=YoY)", value: 0 });
    budgetDeltaLabelIdx = new formattingSettings.NumUpDown({ name: "budgetDeltaLabelIdx", displayName: "Budget Delta Label (0=vs Budget 1=vs Target 2=vs Plan 3=vs Forecast 4=vs Goal)",  value: 0 });
    positiveDeltaColor = new formattingSettings.ColorPicker({ name: "positiveDeltaColor", displayName: "Positive Delta Color", value: { value: "#3B6D11" } });
    negativeDeltaColor = new formattingSettings.ColorPicker({ name: "negativeDeltaColor", displayName: "Negative Delta Color", value: { value: "#A32D2D" } });
    name: string = "deltaSettings";
    displayName: string = "Delta (Variance)";
    slices: Array<FormattingSettingsSlice> = [
        this.showDelta, this.showDeltaPct, this.showDeltaAbs,
        this.pyDeltaLabelIdx, this.budgetDeltaLabelIdx,
        this.positiveDeltaColor, this.negativeDeltaColor
    ];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    cardSettings      = new CardSettings();
    titleSettings     = new TitleSettings();
    valueSettings     = new ValueSettings();
    badgeSettings     = new BadgeSettings();
    labelSettings     = new LabelSettings();
    sparklineSettings = new SparklineSettings();
    deltaSettings     = new DeltaSettings();

    cards = [
        this.cardSettings,
        this.titleSettings,
        this.valueSettings,
        this.badgeSettings,
        this.labelSettings,
        this.sparklineSettings,
        this.deltaSettings
    ];
}
