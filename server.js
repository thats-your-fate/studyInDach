const { createServer } = require("node:http");
const next = require("next");

const hostname = "0.0.0.0";
const port = Number.parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((request, response) => {
    handle(request, response);
  }).listen(port, hostname, () => {
    console.log(`StudyInDACH ready on http://${hostname}:${port}`);
  });
});
