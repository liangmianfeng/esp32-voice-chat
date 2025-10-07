/**
 * ESP32 双向语音 WebSocket 中转服务器
 * ----------------------------------------
 * 功能：
 *   - 接收每个 ESP32 客户端的音频数据流
 *   - 实现点对点转发（A<->B）
 *   - 可用于 Render 免费部署
 */

import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// 存储已连接客户端
const clients = new Map();

wss.on("connection", (ws, req) => {
  const id = Math.random().toString(36).substring(2, 8);
  clients.set(id, ws);
  console.log(`✅ 客户端 ${id} 已连接，当前在线 ${clients.size}`);

  ws.on("message", (msg) => {
    // 默认将消息转发给其它客户端（简单广播）
    for (const [cid, client] of clients) {
      if (cid !== id && client.readyState === ws.OPEN) {
        client.send(msg);
      }
    }
  });

  ws.on("close", () => {
    clients.delete(id);
    console.log(`❌ 客户端 ${id} 已断开连接`);
  });
});

// 首页简单说明
app.get("/", (_, res) => {
  res.send(`<h3>ESP32 双向语音中转服务器已启动 ✅</h3>
            <p>WebSocket 地址：<code>wss://${req?.headers?.host || "your-server"}</code></p>`);
});

server.listen(PORT, () => {
  console.log(`🌍 Server running on http://localhost:${PORT}`);
});
