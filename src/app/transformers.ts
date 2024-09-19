interface CleanerResult {
  cleanedHtml: string;
  scriptLinks: string[];
}

export function cleanShellHTML(html: string): CleanerResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const links = Array.from(doc.head.getElementsByTagName("link"));
  const headScripts = Array.from(doc.head.getElementsByTagName("script"));
  const bodyScripts = Array.from(doc.body.getElementsByTagName("script"));

  // Remove link tags (CSS stylesheet) from <head>
  links.forEach((link) => link.parentNode?.removeChild(link));

  // Remove script tags from body
  bodyScripts.forEach((script) => script.parentNode?.removeChild(script));

  // Collect external script URLs
  const scriptLinks = headScripts.map((script) => script.src);

  // Remove script tags from head
  headScripts.forEach((script) => script.parentNode?.removeChild(script));

  // Serialize the cleaned HTML
  const cleanedHtml = new XMLSerializer().serializeToString(doc);

  return {
    cleanedHtml,
    scriptLinks,
  };
}
