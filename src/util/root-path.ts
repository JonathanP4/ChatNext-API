import path from "path";

export const rootPath = path.join(require.main?.filename as string, "..");
