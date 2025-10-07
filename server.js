// =====================================================
// ESP32 Voice Chat Cloud Relay Server (for Render.com)
// Author: ChatGPT (2025)
// =====================================================

import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";

const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------
// 创建 HTTP + WebSocket 服务器
// ---------------------------------------------
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let clients = new Set();

// ---------------------------------------------
// 处理 WebSocket 连接
// ---------------------------------------------
wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`✅ 新客户端连接: ${ip}`);
  clients.add(ws);

  ws.on("message", (data, isBinary) => {
    // 将接收到的音频帧广播给其他客户端
    for (const client of clients) {
      if (client !== ws && client.readyState === 1) {
        client.send(data, { binary: isBinary });
      }
    }
  });

  ws.on("close", () => {
    console.log(`❌ 客户端断开: ${ip}`);
    clients.delete(ws);
  });

  ws.on("error", (err) => {
    console.error("⚠️ WebSocket 错误:", err.message);
    clients.delete(ws);
  });
});

// ---------------------------------------------
// HTTP 路由（可选：健康检查）
// ---------------------------------------------
app.get("/", (req, res) => {
  res.send(`
    <h2>🌍 ESP32 Voice Chat Relay Server</h2>
    <p>Status: Running ✅</p>
    <p>WebSocket: wss://${req.headers.host}</p>
  `);
});

// ---------------------------------------------
// 启动服务
// ---------------------------------------------
server.listen(PORT, () => {
  console.log(`🌍 语音中转服务器已启动: http://localhost:${PORT}`);
});
