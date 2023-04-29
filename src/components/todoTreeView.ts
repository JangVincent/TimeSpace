// import { TodoImportance, TodoItem } from "./types";
import dayjs = require("dayjs");
import * as vscode from "vscode";
import { TodoImportanceList, defaultTimeFormat } from "../constants";
import fs = require("fs");
import { getFilePathByPlatform } from "../utils";
import { TodoItem } from "./todoItem";

const customAlarmDateInputFormat = vscode.workspace
  .getConfiguration()
  .get("timeSpace.alarmDateInputFormat", defaultTimeFormat);

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
    vscode.commands.registerCommand(
      "timespace.todo.item_context_edit",
      (item) => {
        this.itemClickEditHandler(item);
      }
    );

    this.filePath = getFilePathByPlatform();

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

  getTodos() {
    return this.todos;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
    this.saveTodoLocal();
  }

  async add() {
    let label: string =
      (await vscode.window.showInputBox({
        placeHolder: "My Todo",
      })) || `TODO ${Object.keys(this.todos).length + 1}`;

    const existLabels = Object.keys(this.todos);

    if (existLabels.includes(label)) {
      vscode.window.showInformationMessage("Label already exists");
      return;
    }

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

  async edit(item: TodoItem) {
    const wantToEdit = await vscode.window.showQuickPick([
      "Label",
      "Importance",
      "Alarm Date",
    ]);

    switch (wantToEdit) {
      case "Label": {
        const newLabel = await vscode.window.showInputBox({
          prompt: "Enter new label",
          value: item.getLabel(),
        });
        if (!newLabel) {
          vscode.window.showInformationMessage("Label cannot be empty");
          return;
        }

        const existLabels = Object.keys(this.todos);

        if (existLabels.includes(newLabel)) {
          vscode.window.showInformationMessage("Label already exists");
          return;
        }

        item.label = newLabel as string;
        break;
      }
      case "Importance": {
        const newImportance = await vscode.window.showQuickPick(
          TodoImportanceList
        );
        item.importance = newImportance as string;

        item.makeTooltip();
        break;
      }
      case "Alarm Date": {
        const customAlarmDateInputFormat = vscode.workspace
          .getConfiguration()
          .get("timeSpace.alarmDateInputFormat", defaultTimeFormat);

        const newAlarmDate = await vscode.window.showInputBox({
          prompt: "Enter new alarm date",
          value: dayjs(item.alarmDate).format(customAlarmDateInputFormat),
        });

        try {
          item.alarmDate = dayjs(newAlarmDate).valueOf();
          item.makeTooltip();
        } catch (error) {
          vscode.window.showInformationMessage(
            "Invalid date format. Please check your input value."
          );
          return;
        }

        break;
      }
    }

    return item;
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
      vscode.window.showInformationMessage(`Removed Todo : ${targetLabel}`);
    }
  }

  async itemClickRemoveHandler(item: TodoItem) {
    await this.remove(item.label);
  }

  async itemClickEditHandler(item: TodoItem) {
    const prevLabel = item.getLabel();

    const newTodoItem = await this.edit(item);

    if (newTodoItem && newTodoItem.label !== prevLabel) {
      this.todos[newTodoItem.label] = newTodoItem;
      delete this.todos[prevLabel];
    }

    this.refresh();

    console.log(this.todos);
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
