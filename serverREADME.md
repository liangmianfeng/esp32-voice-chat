\# ☁️ ESP32 Voice Chat Relay Server



这是一个极简的 WebSocket 音频中转服务器，供 ESP32 设备实现 \*\*双向实时语音通信\*\*。



---



\## 🚀 一、部署方式（Render 免费云）



1\. 登录 \[Render.com](https://render.com)

2\. 创建新 Web Service → 选择你的 GitHub 仓库

3\. Root Directory 选择 `server/`

4\. Build Command: npm install

5\. Start Command: npm start

6\. 部署完成后 Render 会提供一个公开地址，例如：

&nbsp;  https://esp32-voice-chat.onrender.com

7\. ESP32 固件中 WebSocket 地址填入：

&nbsp;   const char\* ws\_server = "wss://esp32-voice-chat.onrender.com";

