// dynamicElements (config) and content (feed) are injected by the Preview component
dynamicElements = [];
content = {};

if (!window.studio) {
  (function (window) {
    Enabler = {
      _isInitialized: false,
      _isPageLoaded: false,
      _isVisible: false,
      _listeners: {},
      _loadedScripts: {},

      isInitialized: function () {
        return this._isInitialized;
      },

      isPageLoaded: function () {
        return this._isPageLoaded;
      },

      addEventListener: function (event, callback) {
        if (!this._listeners[event]) {
          this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
      },

      _dispatchEvent: function (event) {
        console.log("Dispatching event:", event);
        if (this._listeners[event]) {
          this._listeners[event].forEach(function (callback) {
            console.log("Calling callback for event:", event);
            callback();
          });
        }
      },

      loadScript: function (url, callback) {
        if (this._loadedScripts[url]) {
          if (callback) callback();
          return;
        }

        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.onload = function () {
          this._loadedScripts[url] = true;
          if (callback) callback();
        }.bind(this);
        document.head.appendChild(script);
      },

      isVisible: function () {
        return this._isVisible;
      },

      exitOverride: function (type, url, shouldOpenInNewTab) {
        console.log("Exit override called with URL:", url);
        if (type !== "DynamicExit") {
          console.error(
            `Invalid argument for Enabler.exitOverride. Expected 'ExitOveride', got: ${type}`
          );
          return;
        }
        if (shouldOpenInNewTab) {
          window.open(url, "_blank");
        } else {
          window.location.href = url;
        }
      },

      // Helper methods to simulate Enabler behavior
      _init: function () {
        this._isInitialized = true;
        this._dispatchEvent("enablerInitialized");

        // Simulate page load after a short delay
        setTimeout(
          function () {
            this._isPageLoaded = true;
            this._dispatchEvent("pageLoaded");
          }.bind(this),
          0
        );

        // Simulate visibility after another short delay
        setTimeout(
          function () {
            this._isVisible = true;
            this._dispatchEvent("visible");
          }.bind(this),
          0
        );
      },
    };

    // Auto-initialize the mock Enabler
    setTimeout(function () {
      Enabler._init();
    }, 0);

    // Expose the mock Enabler to the global scope
    window.Enabler = Enabler;
    // Expose dynamicContent for local development to the global scope
  })(window);
}

/**
 * Called on the window load event.
 */
function init() {
  console.log("----- Init -----");
  if (Enabler.isInitialized()) {
    console.log("Enabler initialized");
    if (Enabler.isPageLoaded()) {
      console.log("Enabler page loaded");
      buildAd();
    } else {
      if (!window.studio) {
        console.log("Waiting for pageLoaded event");
        Enabler.addEventListener("pageLoaded", buildAd);
      } else {
        Enabler.addEventListener(
          studio.events.StudioEvent.PAGE_LOADED,
          buildAd
        );
      }
    }
  } else {
    if (!window.studio) {
      console.log(
        "Enabler not initialized. Waiting for enablerInitialized event"
      );
      Enabler.addEventListener("enablerInitialized", init);
    } else {
      console.log("Enabler not initialized. Waiting for INIT event");
      Enabler.addEventListener(studio.events.StudioEvent.INIT, init);
    }
  }
}

async function buildAd() {
  const templateString = await getTemplate();
  const parsedTemplate = parseHTMLTemplate(templateString);
  injectContent(parsedTemplate);

  if (Enabler.isVisible()) {
    displayAd();
  } else {
    if (!window.studio) {
      console.log("Adding event listener for visible event");
      Enabler.addEventListener("visible", displayAd);
    } else {
      Enabler.addEventListener(studio.events.StudioEvent.VISIBLE, displayAd);
    }
  }
}

async function getTemplate() {
  if (!window.studio) {
    return getLocalTemplate();
  } else {
    return getProductionTemplate();
  }
}

async function getLocalTemplate() {
  try {
    const response = await fetch(`http://localhost:3000/file/template.html`);
    if (!response.ok) {
      throw new Error(`HTTP error. status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Could not fetch the template:", error);
    throw error;
  }
}

async function getProductionTemplate() {
  return Promise.resolve(dynamicContent.data[0].data_url);
}

function getExitUrl() {
  if (!window.studio) {
    return "https://www.adylic.com";
  } else {
    return dynamicContent.TemplateData[0].exit_url;
  }
}

/**
 * Parses an HTML template string and extracts its head content, styles, HTML elements, and script.
 *
 * @param {string} templateString - The HTML template string to be parsed.
 * @returns {Object} An object containing the following properties:
 *   - {string} headContent - The inner HTML of the <head> element, excluding <style> tags.
 *   - {string} styles - The dynamic styles with CSS variables replaced.
 *   - {string} htmlElements - The HTML elements from the <body> content with template variables replaced.
 *   - {string} script - The first <script> tag found in the <body> content.
 */
function parseHTMLTemplate(templateString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(templateString, "text/html");

  let headTags = doc.head.innerHTML;

  // Get styles from <style> tag in the <head> and replace dynamic CSS variables
  // with the values from the content object injected by the Preview component.
  const styles = Array.from(doc.head.getElementsByTagName("style"))
    .map((style) => style.outerHTML)
    .join("\n");
  const headCss = replaceCSSVariables(styles);
  console.log("Styles:", styles);

  // Remove <style> tags from the <head>
  headTags = doc.head.innerHTML.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    ""
  );

  const bodyContent = doc.body.innerHTML;

  // Get the <script> from the template's <body> content. It usually contains animations
  const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  const scripts = bodyContent.match(scriptRegex) || [];

  // Remove <script> tags from the <body>
  let bodyHTML = bodyContent.replace(scriptRegex, "").trim();

  // Replace template variables in the template HTML
  const copyClassMap = createCopyClassMapFromDynamicElements();
  bodyHTML = replaceTemplateVariable(bodyHTML, copyClassMap);

  return {
    headTags,
    headCss,
    bodyHTML,
    // There is only one script in the template
    script: scripts[0],
  };
}

function injectContent(parsedContent) {
  // Add head content to the document head
  document.head.insertAdjacentHTML("beforeend", parsedContent.headTags);

  // Add HTML elements to the document body
  const dynamicAdvertContainer = document.querySelector(
    ".dynamicAdvertContainer"
  );
  if (dynamicAdvertContainer) {
    const withInjectedDynamicElements = injectDynamicCopy(
      parsedContent.bodyHTML
    );
    dynamicAdvertContainer.innerHTML = withInjectedDynamicElements;
    dynamicAdvertContainer.addEventListener("click", exitClickHandler);
  } else {
    console.error(
      "Target container .dynamicAdvertContainer not found in the document"
    );
  }

  // Add styles to the document head
  const style = document.createElement("style");
  style.textContent = parsedContent.headCss;
  document.head.appendChild(style);

  const script = document.createElement("script");
  script.textContent = parsedContent.script
    .replace(/<\/?script[^>]*>/gi, "")
    .trim();
  document.body.appendChild(script);
}

function injectDynamicCopy(htmlElements) {
  const copyClassMap = createCopyClassMapFromDynamicElements();
  const injectedHtml = replaceTemplateVariable(htmlElements, copyClassMap);
  return injectedHtml;
}

function exitClickHandler(event) {
  event.preventDefault();
  const exitUrl = getExitUrl();
  Enabler.exitOverride("DynamicExit", exitUrl, true);
}

function displayAd() {
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

// ------------- Inject dynamic content into HTML -------------

// It takes dynamicElements and creates a map of targetClass to text value
// For example, dynamic element:
// {
//   targetClass: "headline",
//   controls: [
//     {
//       ...
//       property: "text",
//       targetVar: "destination",
//       value: "Fly to ${destination}!",
//     },
// Result: { headline: "Fly to ${destination}!" }
function createCopyClassMapFromDynamicElements() {
  return dynamicElements.reduce((acc, dynamicElement) => {
    if (dynamicElement.controls?.length) {
      dynamicElement.controls.forEach((control) => {
        if (control.property === "copy") {
          acc[dynamicElement.targetClass] = control.value;
        }
      });
    }
    return acc;
  }, {});
}

function replaceTemplateVariable(htmlString, copyClassMap) {
  // If there are no dynamic elements, return the original HTML string
  if (Object.keys(copyClassMap).length === 0) {
    return htmlString;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  for (const [className, templateString] of Object.entries(copyClassMap)) {
    const element = doc.querySelector(`.${className}`);
    if (element) {
      const targetVar = templateString.match(/\${(.*?)}/)[1];
      const innerHTML = templateString.replace(
        `\${${targetVar}}`,
        content[targetVar]
      );
      element.innerHTML = innerHTML;
    }
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}

// ------------- Inject dynamic content into CSS -------------

function replaceCSSVariables(cssString) {
  let updatedCssString = cssString;

  // Create an object with targetClass as key and controls (CSS only) as value
  const controlsObj = dynamicElements.reduce((acc, dynamicElement) => {
    if (dynamicElement.controls?.length) {
      const cssControls = dynamicElement.controls.filter(
        (control) => control.property !== "copy"
      );
      acc[dynamicElement.targetClass] = cssControls;
    }
    return acc;
  }, {});

  // If there are dynamic CSS controls, replace the CSS properties
  if (Object.keys(controlsObj).length) {
    updatedCssString = Object.entries(controlsObj).reduce(
      (acc, [className, controls]) => {
        if (controls.length) {
          acc = replaceCSSproperty(acc, className, controls);
        }
        return acc;
      },
      updatedCssString
    );
    return updatedCssString;
  } else {
    return cssString;
  }
}

function replaceCSSproperty(cssString, className, controls) {
  return controls.reduce((css, { property, value }) => {
    const regex = new RegExp(
      `(\\.${className}\\s*{[^}]*?)(${property}\\s*:\\s*)([^;]+)(;[^}]*})`,
      "g"
    );
    const newValue = value.replace(
      /\${(\w+)}/,
      (_, varName) => content[varName]
    );
    return css.replace(regex, `$1$2${newValue}$4`);
  }, cssString);
}
// ------------- INIT -------------------------------------------------
window.addEventListener("load", init);
init();
