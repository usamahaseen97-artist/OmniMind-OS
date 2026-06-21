import { spawn } from "node:child_process";
import http from "node:http";

import cors from "cors";
import express from "express";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const ALLOWED = ["npm", "node", "python", "python3", "pip", "echo", "ls", "dir", "pwd", "cat", "git"];

function isAllowed(command) {
  const cmd = String(command || "").trim().split(/\s+/)[0]?.toLowerCase();
  return ALLOWED.includes(cmd);
}

function runCommand(command) {
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("close", (code) => resolve({ ok: code === 0, code, stdout, stderr }));
  });
}

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, service: "backend-node" });
});

app.post("/api/v1/terminal/execute", async (req, res) => {
  const command = String(req.body?.command || "").trim();
  if (!command) return res.status(400).json({ error: "command required" });
  if (!isAllowed(command)) {
    return res.status(403).json({ error: "command not allowed in sandbox policy" });
  }
  const result = await runCommand(command);
  res.json(result);
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws/terminal" });

function send(socket, payload) {
  if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(payload));
}

wss.on("connection", (socket) => {
  send(socket, { type: "log", line: "OmniForge terminal connected · sandbox policy active" });

  socket.on("message", async (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      send(socket, { type: "log", line: "invalid payload" });
      return;
    }

    const command = String(msg?.command || msg?.text || "").trim();
    if (!command) {
      send(socket, { type: "log", line: "empty command" });
      return;
    }

    if (command === "clear" || command === "cls") {
      send(socket, { type: "clear" });
      return;
    }

    if (!isAllowed(command)) {
      send(socket, { type: "log", line: `blocked by policy: ${command.split(/\s+/)[0]}` });
      return;
    }

    send(socket, { type: "status", status: "running" });
    send(socket, { type: "log", line: `$ ${command}` });

    const result = await runCommand(command);
    if (result.stdout) {
      for (const line of result.stdout.split(/\r?\n/).filter(Boolean)) {
        send(socket, { type: "log", line });
      }
    }
    if (result.stderr) {
      for (const line of result.stderr.split(/\r?\n/).filter(Boolean)) {
        send(socket, { type: "log", line: `[stderr] ${line}` });
      }
    }
    send(socket, {
      type: "log",
      line: result.ok ? `exit 0` : `exit ${result.code ?? 1}`,
    });
    send(socket, { type: "status", status: "idle" });
  });
});

const port = Number(process.env.NODE_PORT || 8090);
server.listen(port, () => {
  console.log(`backend-node listening on :${port}`);
});
