// import { TodoImportance, TodoItem } from "./types";
import * as vscode from "vscode";
import { TodoImportance } from "./types";

class TodoItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly importance: TodoImportance,
        public readonly alarmDate: number,
        public readonly tooltip?: string
    ) {
        super(label);
        if (!tooltip) {
            this.tooltip = `
            Importance : ${this.importance}\n
            Alarm Date : ${this.alarmDate}`;
        }
    }

    getTooltip(): string {
        return this.tooltip
            ? this.tooltip
            : `
            Importance : ${this.importance}\n
            Alarm Date : ${this.alarmDate}`;
    }
}

export class TodoListProvider implements vscode.TreeDataProvider<TodoItem> {
    constructor() {
        vscode.commands.registerCommand("timespace.todo.refresh", () =>
            this.refresh()
        );
        vscode.commands.registerCommand("timespace.todo.add", () => this.add());
        vscode.commands.registerCommand("timespace.todo.remove", () =>
            this.remove()
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

    add() {}

    remove() {}

    getTreeItem(element: TodoItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TodoItem): TodoItem[] {
        return Object.values(this.todos);
    }
}
