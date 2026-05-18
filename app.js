const { createServer } = require("http");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "127.0.0.1";
const port = Number(process.env.PORT || 3000);
const listenTarget = typeof PhusionPassenger !== "undefined" ? "passenger" : port;

if (typeof PhusionPassenger !== "undefined") {
  PhusionPassenger.configure({ autoInstall: false });
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(listenTarget, hostname, () => {
    console.log(`Next.js ready via ${listenTarget}`);
  });
}).catch((error) => {
  console.error("Failed to start Next.js app");
  console.error(error);
  process.exit(1);
});
