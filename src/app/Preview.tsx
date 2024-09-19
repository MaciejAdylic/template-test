import { useEffect, useRef } from "react";
import { Config } from "./types";
import { PreviewFrame } from "./Components";
import { cleanShellHTML } from "./transformers";

interface PreviewProps {
  shellHTML: string;
  shellCSS: string;
  shellJS: string;
  template: string;
  config: Config;
  selectedRow: Record<string, string>;
}

export const Preview = ({
  shellHTML,
  shellCSS,
  shellJS,
  template,
  config,
  selectedRow,
}: PreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        const { cleanedHtml, scriptLinks } = cleanShellHTML(shellHTML);

        iframeDoc.open();
        iframeDoc.write(cleanedHtml);
        iframeDoc.close();

        // Add CSS to head
        const style = iframeDoc.createElement("style");
        style.textContent = shellCSS;
        iframeDoc.head.appendChild(style);

        // Add external scripts to head
        scriptLinks.forEach((src) => {
          const script = iframeDoc.createElement("script");
          script.src = src;
          iframeDoc.head.appendChild(script);
        });

        // Add shell logic to body as inline script
        const script = iframeDoc.createElement("script");
        const shellJSWithDCConfig = shellJS.replace(
          "dynamicElements = []",
          `dynamicElements = ${JSON.stringify(config.dynamicElements)}`
        );
        const shellJSWithContent = shellJSWithDCConfig.replace(
          "content = {}",
          `content = ${JSON.stringify(selectedRow)}`
        );

        script.textContent = shellJSWithContent;
        iframeDoc.body.appendChild(script);
      }
    }
  }, [shellHTML, shellCSS, shellJS, template, config, selectedRow]);

  return <PreviewFrame ref={iframeRef} title="preview" />;
};
