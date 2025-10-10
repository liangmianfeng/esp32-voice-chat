// server.js
/**
 * ESP32 Voice Chat Relay Server
 * -----------------------------------------
 * ✅ HTTPS + WSS 双向语音转发
 * ✅ 静态网页托管 (public)
 * ✅ 多客户端支持
 * ✅ WebSocket 错误处理
 */

import fs from "fs";
import https from "https";
import express from "express";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// === 静态网页托管 ===
app.use(express.static(path.join(__dirname, "public")));

// === HTTPS Server 配置 ===
const server = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname, "cert/key.pem")),   // 私钥
    cert: fs.readFileSync(path.join(__dirname, "cert/cert.pem")), // 证书
  },
  app
);

// === WebSocket Server ===
const wss = new WebSocketServer({ server });
let clients = [];

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`🔗 新客户端连接: ${ip}`);
  clients.push(ws);

  ws.on("message", (data) => {
    // 转发二进制音频数据给其他客户端
    if (data instanceof Buffer || data instanceof ArrayBuffer) {
      for (const client of clients) {
        if (client !== ws && client.readyState === client.OPEN) {
          try {
            client.send(data);
          } catch (err) {
            console.log(`⚠️ 转发错误: ${err}`);
          }
        }
      }
    } else {
      console.log(`📩 Text: ${data.toString()}`);
    }
  });

  ws.on("close", () => {
    console.log(`❌ 客户端断开: ${ip}`);
    clients = clients.filter((c) => c !== ws);
  });

  ws.on("error", (err) => {
    console.log(`⚠️ WS Error (${ip}): ${err}`);
    clients = clients.filter((c) => c !== ws);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🌍 ESP32 Voice Chat Relay Server`);
  console.log(`Status: Running ✅`);
  console.log(`WebSocket: wss://<your-domain-or-ip>:${PORT}`);
});
