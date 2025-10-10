// server.js
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 静态网页托管
app.use(express.static(path.join(__dirname, "public")));

// HTTP Server
const server = http.createServer(app);

// WebSocket 服务
const wss = new WebSocketServer({ server });

let clients = [];

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`🔗 新客户端连接: ${ip}`);
  clients.push(ws);

  ws.on("message", (data) => {
    // 二进制音频数据转发
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
      console.log("📩 Text:", data.toString());
    }
  });

  ws.on("close", () => {
    console.log(`❌ 客户端断开: ${ip}`);
    clients = clients.filter((c) => c !== ws);
  });

  ws.on("error", (err) => {
    console.log(`⚠️ WS 错误 (${ip}): ${err}`);
    clients = clients.filter((c) => c !== ws);
  });
});

// Render 会自动分配端口
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌍 ESP32 Voice Chat Relay Server`);
  console.log(`状态：运行 ✅`);
  console.log(`WebSocket: wss://esp32-voice-chat.onrender.com/`);
});
