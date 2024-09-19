import Papa from "papaparse";
import { Config, ContentMatrixData } from "./types";

export const fetchFile = async (filename: string): Promise<string> => {
  const response = await fetch(`http://localhost:3000/file/${filename}`);
  const content = await response.text();

  return content;
};

export const fetchCSV = async (
  filename: string
): Promise<ContentMatrixData> => {
  const response = await fetch(`http://localhost:3000/file/${filename}`);
  const text = await response.text();
  const results = Papa.parse(text, { header: true });
  const headers = results.meta.fields || [];
  const rows = results.data as Record<string, string>[];

  return { headers, rows };
};

export const fetchConfig = async (): Promise<Config> => {
  const response = await fetch(`http://localhost:3000/file/config.json`);
  return response.json();
};
