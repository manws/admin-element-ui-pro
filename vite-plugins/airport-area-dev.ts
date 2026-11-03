import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const ROUTE = "/__dev/airport-area";

/** 开发环境：接收地图圈定的飞行区坐标，写入 docs/airport-area-traced.json */
export function airportAreaDevPlugin(): Plugin {
  const file = path.resolve(process.cwd(), "docs/airport-area-traced.json");

  return {
    name: "airport-area-dev",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (url !== ROUTE) {
          next();
          return;
        }
        if (req.method === "GET") {
          if (!fs.existsSync(file)) {
            res.statusCode = 404;
            res.end("not found");
            return;
          }
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(fs.readFileSync(file, "utf8"));
          return;
        }
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("method not allowed");
          return;
        }
        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
            if (!Array.isArray(body) || body.length < 3) {
              res.statusCode = 400;
              res.end("need at least 3 points");
              return;
            }
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, `${JSON.stringify(body, null, 2)}\n`, "utf8");
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ ok: true, count: body.length }));
          } catch {
            res.statusCode = 400;
            res.end("invalid json");
          }
        });
      });
    },
  };
}
