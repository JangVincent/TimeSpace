// import { TodoImportance, TodoItem } from "./types";
import dayjs = require("dayjs");
import * as vscode from "vscode";
import { TodoImportanceList } from "./types";
import fs = require("fs");
import os = require("os");

const defaultTimeFormat = "YYYY-MM-DD HH:mm:ss";
const customAlarmDateInputFormat = vscode.workspace
    .getConfiguration()
    .get("timeSpace.alarmDateInputFormat", defaultTimeFormat);

const alarmDateDisplayFormat = vscode.workspace
    .getConfiguration()
    .get("timeSpace.alarmDateDisplayFormat", defaultTimeFormat);

export class TodoItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly importance: string,
        public readonly alarmDate: number,
        public readonly tooltip?: string
    ) {
        super(label);
        if (tooltip) return;
        this.tooltip = this.makeTooltip();
    }

    isAlarmed: boolean = false;

    getTooltip(): string {
        return this.tooltip ? this.tooltip : this.makeTooltip();
    }

    makeTooltip(): string {
        return `Importance : ${this.importance}\nAlarm Date : ${dayjs(
            this.alarmDate
        ).format(alarmDateDisplayFormat)}`;
    }

    setIsAlarmed() {
        this.isAlarmed = true;
    }
}

export class TodoListProvider implements vscode.TreeDataProvider<TodoItem> {
    constructor() {
        vscode.commands.registerCommand("timespace.todo.refresh", () =>
            this.refresh()
        );
        vscode.commands.registerCommand(
            "timespace.todo.add",
            async () => await this.add()
        );
        vscode.commands.registerCommand(
            "timespace.todo.remove",
            async () => await this.remove()
        );

        vscode.commands.registerCommand(
            "timespace.todo.item_context_remove",
            (item) => {
                this.itemClickRemoveHandler(item);
            }
        );

        switch (process.platform) {
            case "win32": {
                break;
            }

            case "darwin": {
                this.filePath = `${process.env.HOME}/Library/Application\ Support/Code/User/timeSpaceTodo.json`;

                break;
            }

            case "linux": {
                this.filePath = `${process.env.HOME}/.config/Code/User/timeSpaceTodo.json`;

                break;
            }
        }

        if (fs.existsSync(this.filePath)) {
            // Read the file if it exists
            fs.readFile(this.filePath, "utf8", (err, data) => {
                if (err) {
                    console.log(err);
                }
                const openedTodo = JSON.parse(data);
                for (const key in openedTodo) {
                    this.todos[key] = new TodoItem(
                        openedTodo[key].label,
                        openedTodo[key].importance,
                        openedTodo[key].alarmDate
                    );
                }
            });
        } else {
            // Create the file if it does not exist
            fs.writeFile(this.filePath, JSON.stringify(this.todos), (err) => {
                if (err) {
                    console.log(err);
                }
                console.log("File created successfully.");
            });
        }
    }

    private filePath: string = "";
    private todos: { [k: string]: TodoItem } = {};

    private _onDidChangeTreeData: vscode.EventEmitter<
        TodoItem | undefined | null | void
    > = new vscode.EventEmitter<TodoItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<
        TodoItem | undefined | null | void
    > = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
        this.saveTodoLocal();
    }

    async add() {
        let label: string =
            (await vscode.window.showInputBox({
                placeHolder: "My Todo",
            })) || `TODO ${Object.keys(this.todos).length + 1}`;

        let importance: string =
            (await vscode.window.showQuickPick(TodoImportanceList)) || "Low";

        let alarmDate: string =
            (await vscode.window.showInputBox({
                value: dayjs().format(customAlarmDateInputFormat),
            })) || dayjs().valueOf().toString();

        const alarmDateNumber = dayjs(
            alarmDate,
            customAlarmDateInputFormat
        ).valueOf();

        this.todos[label] = new TodoItem(label, importance, alarmDateNumber);

        fs.writeFile(this.filePath, JSON.stringify(this.todos), (err) => {
            if (err) {
                console.log(err);
            }
        });

        this.refresh();
    }

    async remove(label: string | null = null) {
        if (Object.keys(this.todos).length === 0) {
            vscode.window.showInformationMessage("No Todo to remove");
            return;
        }

        const targetLabel = label
            ? label
            : await vscode.window.showInputBox({
                  placeHolder: "Todo item title",
                  validateInput(value) {
                      if (!value || value.length === 0) {
                          return "Please enter a label";
                      }

                      return null;
                  },
              });

        if (targetLabel) {
            if (!this.todos[targetLabel]) {
                vscode.window.showInformationMessage(
                    `No Todo with title : ${targetLabel}`
                );
                return;
            }

            delete this.todos[targetLabel];

            fs.writeFile(this.filePath, JSON.stringify(this.todos), (err) => {
                if (err) {
                    console.log(err);
                }
            });

            this.refresh();
            vscode.window.showInformationMessage(
                `Removed Todo : ${targetLabel}`
            );
        }
    }

    async itemClickRemoveHandler(item: TodoItem) {
        await this.remove(item.label);
    }

    getTodos() {
        return this.todos;
    }

    getTreeItem(element: TodoItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TodoItem): TodoItem[] {
        return Object.values(this.todos);
    }

    saveTodoLocal() {
        fs.writeFile(this.filePath, JSON.stringify(this.todos), (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
}
