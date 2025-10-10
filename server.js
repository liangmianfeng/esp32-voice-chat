/**
 * ESP32 Voice Chat Relay Server
 * -----------------------------------------
 * ✅ 托管网页 index.html（public目录）
 * ✅ WebSocket 双向语音转发（网页 <-> ESP32）
 * ✅ 支持多客户端同时通信
 */

import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// === 静态网页托管 ===
app.use(express.static(path.join(__dirname, "public")));

// === WebSocket 服务 ===
const wss = new WebSocketServer({ server });

let clients = [];

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`🔗 新客户端连接: ${ip}`);
  clients.push(ws);

  ws.on("message", (data) => {
    // 二进制音频数据转发给其他客户端
    if (data instanceof Buffer || data instanceof ArrayBuffer) {
      for (const client of clients) {
        if (client !== ws && client.readyState === client.OPEN) {
          client.send(data);
        }
      }
    } else {
      console.log("📩 Text:", data.toString());
    }
  });

  ws.on("close", () => {
    console.log(`❌ 客户端断开: ${ip}`);
    clients = clients.filter((c) => c !== ws);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🌍 ESP32 Voice Chat Relay Server`);
  console.log(`Status: Running ✅`);
  console.log(`WebSocket: wss://esp32-voice-chat.onrender.com`);
});
