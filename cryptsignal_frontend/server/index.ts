import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path"; // <-- Add this import

// If 'log' is a generic logger from your './vite' helper, you might need to move it
// to a separate utility file to avoid pulling in Vite dependencies.
// For now, let's assume it can be imported or replaced.
const log = console.log;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Your logging middleware...
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});


(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    // It's often better to log the error rather than re-throwing it here
    console.error(err);
  });

  // Conditionally import and set up Vite for development ONLY
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    // In production, serve the static files from the 'dist' folder
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const clientDistPath = path.join(__dirname, '..', 'dist');
    
    app.use(express.static(clientDistPath));
    
    // Fallback to index.html for client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(clientDistPath, 'index.html'));
    });
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();