// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import dayjs = require("dayjs");
import * as vscode from "vscode";
import { TodoItem, TodoListProvider } from "./todoTreeView";
import { ConfigurationMap } from "./types";

let utcTimeItem: vscode.StatusBarItem;
let localeTimeItem: vscode.StatusBarItem;
let configurationMap: ConfigurationMap;
// const todos: { [k: string]: TodoItem } = {};

// This method is called when your extension is deactivated
export function deactivate() {
    vscode.window.showInformationMessage(`TimeSpace is now deactivated.`);
}

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    const subscriptions = context.subscriptions;
    configurationMap = getConfigurationMap();

    const todoListProvider = new TodoListProvider();
    vscode.window.createTreeView("timespace-todo", {
        treeDataProvider: todoListProvider,
    });

    utcTimeItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        20
    );
    localeTimeItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        20
    );

    // command for click event register
    const utcTimeCopyCommand = "timeSpace.copyUTC";
    const localeTimeCopyCommand = "timeSpace.copyLocale";

    // event handlers
    subscriptions.push(
        vscode.commands.registerCommand(utcTimeCopyCommand, () => {
            vscode.env.clipboard.writeText(
                getCopyString("utc", configurationMap.copyFormatUTC)
            );
            vscode.window.showInformationMessage(`UTC time copied!`);
        })
    );

    subscriptions.push(
        vscode.commands.registerCommand(localeTimeCopyCommand, () => {
            vscode.env.clipboard.writeText(
                getCopyString("locale", configurationMap.copyFormatLocale)
            );
            vscode.window.showInformationMessage(`Locale time copied!`);
        })
    );

    utcTimeItem.command = utcTimeCopyCommand;
    localeTimeItem.command = localeTimeCopyCommand;

    subscriptions.push(utcTimeItem);
    subscriptions.push(localeTimeItem);

    // when update settings.json
    vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("timeSpace")) {
            configurationMap = getConfigurationMap();
        }
    });

    // update status bar item per second
    setInterval(() => {
        updateStatusBarItem(configurationMap, todoListProvider);
    }, 1000);

    vscode.window.showInformationMessage(`TimeSpace is now activated!`);
}

function updateStatusBarItem(
    configurationMap: ConfigurationMap,
    todoListProvider: TodoListProvider
): void {
    const userTimeZoneOffsetHour = new Date().getTimezoneOffset() / 60;

    utcTimeItem.text = `$(clock) U ${dayjs()
        .subtract(-userTimeZoneOffsetHour, "hours")
        .format(configurationMap.formatUTC)}`;
    localeTimeItem.text = `$(clock) L ${dayjs().format(
        configurationMap.formatLocale
    )}`;

    // show status bar time
    utcTimeItem.show();
    localeTimeItem.show();

    // todo alarm
    let todos = Object.values(todoListProvider.getTodos());
    todos = todos.filter((todo: TodoItem) => {
        return !todo.isAlarmed && dayjs().isSame(todo.alarmDate, "minute");
    });

    if (todos.length <= 0) return;

    vscode.window.showInformationMessage(`TimeSpace Todo Alarm`, {
        modal: true,
        detail: todos.map((todo: TodoItem) => todo.label).join("\n"),
    });
    todos.forEach((todo: TodoItem) => {
        todo.setIsAlarmed();
    });
}

function getConfigurationMap() {
    const defaultTimeFormat = "YYYY-MM-DD HH:mm:ss";
    const formatMap = {
        formatUTC: vscode.workspace
            .getConfiguration()
            .get("timeSpace.formatUTC", defaultTimeFormat),
        formatLocale: vscode.workspace
            .getConfiguration()
            .get("timeSpace.formatLocale", defaultTimeFormat),
        copyFormatUTC: vscode.workspace
            .getConfiguration()
            .get("timeSpace.copyFormatUTC", defaultTimeFormat),
        copyFormatLocale: vscode.workspace
            .getConfiguration()
            .get("timeSpace.copyFormatLocale", defaultTimeFormat),
    };

    return formatMap;
}

function getCopyString(mode: "utc" | "locale", format: string): string {
    const userTimeZoneOffsetHour = new Date().getTimezoneOffset() / 60;

    if (mode === "utc") {
        switch (format) {
            case "unix-ms":
                return dayjs()
                    .subtract(-userTimeZoneOffsetHour, "hours")
                    .valueOf()
                    .toString();

            case "unix-s":
                return dayjs()
                    .subtract(-userTimeZoneOffsetHour, "hours")
                    .unix()
                    .toString();

            default:
                return dayjs()
                    .subtract(-userTimeZoneOffsetHour, "hours")
                    .format(format);
        }
    } else {
        switch (format) {
            case "unix-ms":
                return dayjs().valueOf().toString();

            case "unix-s":
                return dayjs().unix().toString();

            default:
                return dayjs().format(configurationMap.copyFormatUTC);
        }
    }
}
