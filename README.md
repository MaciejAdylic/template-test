# Proof of Concept for new shell logic

## Goals

The goals of this PoC are:

1. To prove if the ad template as a string is a feasible option.
2. If so, eliminate the dynamicBuilder.
3. To enable previewing ad inside of the shell both, in the browser and in the React application.
4. To prove that the ad template as a string will let creative developers edit templates using code editor. They will edit HTML, CSS, and JavaScript rather then Orca JSON templates.
5. To prove that injecting dynamicContent from the content matrix or feed is possible.

## Previewing Ad Template in the browser

1. Change the folder to `src/template`.
2. Run the server: `node server.js`. The server is necessary, so that the shell can fetch the template string.
3. Open shell-index.html in the browser to preview the template with default values.

## Previewing Ad Template in React application

1. Change the folder to `src/template`.
2. Run the erver: `node server.js`.
3. Open new terminal window and run react application: `npm run dev`. Click on the link in terminal to open the application in the browser or paste the link http://127.0.0.1:5173/ into the browser address bar.
4. When the application opens you use up and down arrow keys to change the row from the content matrix.

---
