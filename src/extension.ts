// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import dayjs = require("dayjs");
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

let utcTimeItem: vscode.StatusBarItem;
let localeTimeItem: vscode.StatusBarItem;
export function activate(context: vscode.ExtensionContext) {
    const subscriptions = context.subscriptions;
    vscode.window.showInformationMessage(`TimeSpace is now activated!`);

    utcTimeItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        20
    );
    localeTimeItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        20
    );

    subscriptions.push(utcTimeItem);
    subscriptions.push(localeTimeItem);

    // update status bar item per second
    setInterval(() => updateStatusBarItem(), 1000);
}

function updateStatusBarItem(): void {
    const userTimeZoneOffsetHour = new Date().getTimezoneOffset() / 60;

    utcTimeItem.text = `$(clock) U ${dayjs()
        .subtract(-userTimeZoneOffsetHour, "hours")
        .format("YYYY-MM-DD HH:mm:ss")}`;
    localeTimeItem.text = `$(clock) L ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`;

    utcTimeItem.show();
    localeTimeItem.show();
}

// This method is called when your extension is deactivated
export function deactivate() {
    vscode.window.showInformationMessage(`TimeSpace is now deactivated.`);
}
