import dayjs = require("dayjs");
import * as vscode from "vscode";
import { TodoImportanceList, defaultTimeFormat } from "../constants";
export class TodoItem extends vscode.TreeItem {
  constructor(
    public label: string,
    public importance: string,
    public alarmDate: number,
    public tooltip?: string
  ) {
    super(label);
    if (tooltip) return;
    this.makeTooltip();
  }

  isAlarmed: boolean = false;

  makeTooltip() {
    const alarmDateDisplayFormat = vscode.workspace
      .getConfiguration()
      .get("timeSpace.alarmDateDisplayFormat", defaultTimeFormat);

    this.tooltip = `Importance : ${this.importance}\nAlarm Date : ${dayjs(
      this.alarmDate
    ).format(alarmDateDisplayFormat)}`;
  }

  setIsAlarmed() {
    this.isAlarmed = true;
  }

  getLabel(): string {
    return this.label;
  }
}
