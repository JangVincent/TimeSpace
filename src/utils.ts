export function getFilePathByPlatform(): string {
  switch (process.platform) {
    case "win32": {
      return "";
    }

    case "darwin": {
      return `${process.env.HOME}/Library/Application\ Support/Code/User/timeSpaceTodo.json`;
    }

    case "linux": {
      return `${process.env.HOME}/.config/Code/User/timeSpaceTodo.json`;
    }

    default: {
      return "";
    }
  }
}
