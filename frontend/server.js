import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.join(__dirname, "static");

const listenHost = process.env.LISTEN_HOST || "0.0.0.0";
const listenPort = Number(process.env.LISTEN_PORT || 8080);

app.use(
  "/api/kleidung",
  createProxyMiddleware({
    target: "http://kleidung-service:1234",
    changeOrigin: true,
    pathRewrite: { "^/api/kleidung": "" },
    logLevel: "warn",
  }),
);

app.use(
  "/api/wasch",
  createProxyMiddleware({
    target: "http://wasch-service:4321",
    changeOrigin: true,
    pathRewrite: { "^/api/wasch": "" },
    logLevel: "warn",
  }),
);

app.use(express.static(staticDir));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({
      errorCode: "NOT_FOUND",
      message: "API route not found",
    });
    return;
  }

  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(listenPort, listenHost, () => {
  // eslint-disable-next-line no-console
  console.log(`frontend listening on http://${listenHost}:${listenPort}`);
});
