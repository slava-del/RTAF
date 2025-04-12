import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ——— Request logging middleware ———
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  // patch res.json to capture payload
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    capturedJsonResponse = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    if (!path.startsWith("/api")) return;

    const duration = Date.now() - start;
    let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    if (capturedJsonResponse) {
      line += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    }
    // truncate long lines
    if (line.length > 80) {
      line = line.slice(0, 79) + "…";
    }
    log(line);
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // ——— Centralized error handler ———
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // send JSON error
    res.status(status).json({ message });

    // log the full error server‐side
    console.error(err);

    // do NOT rethrow; let Express clean up
    // next() would be optional here, but we stop the chain
  });

  // ——— Dev vs Prod static / Vite setup ———
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ——— Start listening ———
  const port = 5000;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
//fdsfdas