// src/App.tsx
import React, { useState, useEffect, useCallback } from "react";
import { TableComponent } from "./app/TableComponent";
import { Preview } from "./app/Preview";
import { fetchCSV, fetchFile, fetchConfig } from "./app/api";
import { Config, ContentMatrixData } from "./app/types";
import {
  AppContainer,
  PreviewContainer,
  TableContainer,
} from "./app/Components";

const App: React.FC = () => {
  const [contentMatrixData, setContentMatrixData] =
    useState<ContentMatrixData>();
  const [shellHTML, setShellHTML] = useState<string>("");
  const [shellCSS, setShellCSS] = useState<string>("");
  const [shellJS, setShellJS] = useState<string>("");
  const [template, setTemplate] = useState<string>("");
  const [config, setConfig] = useState<Config | null>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      console.log("fetching data");
      const cmData = await fetchCSV("content-matrix.csv");
      setContentMatrixData(cmData);

      const [shellHtml, shellCss, shellJs] = await Promise.all([
        fetchFile("shell-index.html"),
        fetchFile("shell-styles.css"),
        fetchFile("shell-logic.js"),
      ]);

      setShellHTML(shellHtml);
      setShellCSS(shellCss);
      setShellJS(shellJs);

      const templateContent = await fetchFile("template.html");
      setTemplate(templateContent);

      const configData = await fetchConfig();
      setConfig(configData);
    };

    fetchData();
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        setSelectedRowIndex((prev) => Math.max(0, prev - 1));
      } else if (event.key === "ArrowDown") {
        setSelectedRowIndex((prev) =>
          Math.min((contentMatrixData?.rows.length || 1) - 1, prev + 1)
        );
      }
    },
    [contentMatrixData]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!contentMatrixData || !config) {
    return <div>Loading...</div>;
  }

  return (
    <AppContainer>
      <PreviewContainer>
        <Preview
          shellHTML={shellHTML}
          shellCSS={shellCSS}
          shellJS={shellJS}
          template={template}
          config={config}
          selectedRow={contentMatrixData.rows[selectedRowIndex]}
        />
      </PreviewContainer>
      <TableContainer>
        <TableComponent
          headers={contentMatrixData.headers}
          rows={contentMatrixData.rows}
          selectedRowIndex={selectedRowIndex}
        />
      </TableContainer>
    </AppContainer>
  );
};

export default App;
