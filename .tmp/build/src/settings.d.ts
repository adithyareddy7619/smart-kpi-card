import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
declare class CardSettings extends FormattingSettingsCard {
    backgroundColor: formattingSettings.ColorPicker;
    borderColor: formattingSettings.ColorPicker;
    borderWidth: formattingSettings.NumUpDown;
    borderRadius: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class TitleSettings extends FormattingSettingsCard {
    fontFamily: formattingSettings.NumUpDown;
    fontSize: formattingSettings.NumUpDown;
    color: formattingSettings.ColorPicker;
    bold: formattingSettings.ToggleSwitch;
    italic: formattingSettings.ToggleSwitch;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class ValueSettings extends FormattingSettingsCard {
    fontFamily: formattingSettings.NumUpDown;
    fontSize: formattingSettings.NumUpDown;
    color: formattingSettings.ColorPicker;
    bold: formattingSettings.ToggleSwitch;
    italic: formattingSettings.ToggleSwitch;
    showTrendArrow: formattingSettings.ToggleSwitch;
    arrowColor: formattingSettings.ColorPicker;
    displayUnits: formattingSettings.AutoDropdown;
    decimalPlaces: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class BadgeSettings extends FormattingSettingsCard {
    showPY: formattingSettings.ToggleSwitch;
    showBudget: formattingSettings.ToggleSwitch;
    fontSize: formattingSettings.NumUpDown;
    borderRadius: formattingSettings.NumUpDown;
    positiveBackground: formattingSettings.ColorPicker;
    positiveColor: formattingSettings.ColorPicker;
    negativeBackground: formattingSettings.ColorPicker;
    negativeColor: formattingSettings.ColorPicker;
    threshold: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class LabelSettings extends FormattingSettingsCard {
    actualLabelIdx: formattingSettings.NumUpDown;
    pyLabelIdx: formattingSettings.NumUpDown;
    budgetLabelIdx: formattingSettings.NumUpDown;
    tooltip1LabelIdx: formattingSettings.NumUpDown;
    tooltip2LabelIdx: formattingSettings.NumUpDown;
    tooltip3LabelIdx: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class SparklineSettings extends FormattingSettingsCard {
    stripHeight: formattingSettings.NumUpDown;
    actualColor: formattingSettings.ColorPicker;
    actualWidth: formattingSettings.NumUpDown;
    pyColor: formattingSettings.ColorPicker;
    pyWidth: formattingSettings.NumUpDown;
    budgetColor: formattingSettings.ColorPicker;
    budgetWidth: formattingSettings.NumUpDown;
    fillUnder: formattingSettings.ToggleSwitch;
    autoScale: formattingSettings.ToggleSwitch;
    monthThreshold: formattingSettings.NumUpDown;
    showTooltip: formattingSettings.ToggleSwitch;
    markerShape: formattingSettings.NumUpDown;
    markerSize: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class DeltaSettings extends FormattingSettingsCard {
    showDelta: formattingSettings.ToggleSwitch;
    showDeltaPct: formattingSettings.ToggleSwitch;
    showDeltaAbs: formattingSettings.ToggleSwitch;
    pyDeltaLabelIdx: formattingSettings.NumUpDown;
    budgetDeltaLabelIdx: formattingSettings.NumUpDown;
    positiveDeltaColor: formattingSettings.ColorPicker;
    negativeDeltaColor: formattingSettings.ColorPicker;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
export declare class VisualFormattingSettingsModel extends FormattingSettingsModel {
    cardSettings: CardSettings;
    titleSettings: TitleSettings;
    valueSettings: ValueSettings;
    badgeSettings: BadgeSettings;
    labelSettings: LabelSettings;
    sparklineSettings: SparklineSettings;
    deltaSettings: DeltaSettings;
    cards: (CardSettings | TitleSettings | ValueSettings | BadgeSettings | LabelSettings | SparklineSettings | DeltaSettings)[];
}
export {};
