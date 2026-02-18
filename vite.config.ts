import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { resolve } from "path";
import type { Plugin } from "vite";

const LOCAL_DB_PATH = resolve(__dirname, "local_db.json");

function localDbDevPlugin(): Plugin {
  const clients: import("http").ServerResponse[] = [];

  return {
    name: "vite:local-db",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();

        // GET/POST JSON endpoint
        if (req.url === "/__local_db") {
          if (req.method === "GET") {
            try {
              const data = fs.existsSync(LOCAL_DB_PATH)
                ? fs.readFileSync(LOCAL_DB_PATH, "utf-8")
                : JSON.stringify({ users: [], profiles: [], matches: [], conversations: [], messages: [] });
              res.setHeader("Content-Type", "application/json");
              res.end(data);
              return;
            } catch (e) {
              res.statusCode = 500;
              res.end(String(e));
              return;
            }
          }

          if (req.method === "POST") {
            try {
              let body = "";
              req.on("data", (chunk) => (body += chunk));
              req.on("end", () => {
                try {
                  fs.writeFileSync(LOCAL_DB_PATH, body, "utf-8");
                } catch (e) {
                  /* ignore */
                }
                // broadcast to SSE clients
                for (const c of clients) {
                  try {
                    c.write(`data: ${body.replace(/\n/g, "\\n")}\n\n`);
                  } catch (_) {
                    // ignore
                  }
                }
                res.end("ok");
              });
              return;
            } catch (e) {
              res.statusCode = 500;
              res.end(String(e));
              return;
            }
          }
        }

        // SSE endpoint for live updates
        if (req.url === "/__local_db/events") {
          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          });
          res.write("\n");
          clients.push(res);
          req.on("close", () => {
            const idx = clients.indexOf(res);
            if (idx !== -1) clients.splice(idx, 1);
          });

          try {
            const data = fs.existsSync(LOCAL_DB_PATH)
              ? fs.readFileSync(LOCAL_DB_PATH, "utf-8")
              : JSON.stringify({ users: [], profiles: [], matches: [], conversations: [], messages: [] });
            res.write(`data: ${data.replace(/\n/g, "\\n")}\n\n`);
          } catch (e) {
            // ignore
          }
          return;
        }

        return next();
      });

      // watch the file and notify connected clients
      try {
        fs.watchFile(LOCAL_DB_PATH, { interval: 500 }, () => {
          try {
            const data = fs.existsSync(LOCAL_DB_PATH)
              ? fs.readFileSync(LOCAL_DB_PATH, "utf-8")
              : JSON.stringify({ users: [], profiles: [], matches: [], conversations: [], messages: [] });
            for (const c of clients) {
              try {
                c.write(`data: ${data.replace(/\n/g, "\\n")}\n\n`);
              } catch (_) {
                // ignore
              }
            }
          } catch (_e) {
            // ignore
          }
        });
      } catch (_e) {
        // ignore
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" ? localDbDevPlugin() : null].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
