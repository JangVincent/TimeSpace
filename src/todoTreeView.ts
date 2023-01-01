// import { TodoImportance, TodoItem } from "./types";
import dayjs = require("dayjs");
import * as vscode from "vscode";
import { TodoImportanceList } from "./types";

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
    }

    private todos: { [k: string]: TodoItem } = {};

    private _onDidChangeTreeData: vscode.EventEmitter<
        TodoItem | undefined | null | void
    > = new vscode.EventEmitter<TodoItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<
        TodoItem | undefined | null | void
    > = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
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

        this.refresh();
    }

    async remove() {
        if (Object.keys(this.todos).length === 0) {
            vscode.window.showInformationMessage("No Todo to remove");
            return;
        }

        const label = await vscode.window.showInputBox({
            placeHolder: "Todo item title",
            validateInput(value) {
                if (!value || value.length === 0) {
                    return "Please enter a label";
                }

                return null;
            },
        });

        if (label) {
            delete this.todos[label];
            this.refresh();
            vscode.window.showInformationMessage(`Removed Todo : ${label}`);
        }
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
}
