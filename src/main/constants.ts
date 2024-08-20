import path from "path";
import fs from "fs";
import { app } from "electron";

export const isDev = process.env.NODE_ENV === "development";
export const userDataPath = app.getPath("userData");
export const dbPath = path.join(userDataPath, "divarch.db");
export const dbUrl = "file:" + dbPath;
export const configPath = path.join(userDataPath, "config.json");

export async function readConfigFile() {
  try {
    await fs.promises.access(configPath, fs.constants.F_OK);
    const configData = await fs.promises.readFile(configPath, "utf8");
    return JSON.parse(configData);
  } catch (error) {
    console.error("Failed to read config file:", error);
    throw error; // Re-throw the error after logging it
  }
}