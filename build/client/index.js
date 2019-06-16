"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const net = require("net");
const Url = require("url");
const querystring = require("querystring");
const HttpsProxyAgent = require("https-proxy-agent");
function main(opt) {
    const p = new Promise(resolve => {
        const localServer = net.createServer(socket => {
            console.log("proxy client connection");
            const tmpBuffer = [];
            const query = {
                destHost: opt.destHost,
                destPort: opt.destPort
            };
            const url = `${opt.wsProxyHost}?${querystring.stringify(query)}`;
            let agent;
            if (opt.agent) {
                const proxyUrl = Url.parse(opt.agent);
                agent = new HttpsProxyAgent(proxyUrl);
            }
            const ws = new WebSocket(url, {
                agent
            });
            // 收到使用者的连接
            socket.on("data", data => {
                console.log("proxy client data", [
                    data.toString("utf8"),
                    ws.readyState,
                    WebSocket.OPEN
                ]);
                if (ws.readyState !== WebSocket.OPEN) {
                    tmpBuffer.push(data);
                }
                else {
                    ws.send(data);
                }
            });
            socket.on("close", () => {
                ws.close();
            });
            ws.on("open", () => {
                console.log("proxy client open");
                let data;
                while ((data = tmpBuffer.pop())) {
                    ws.send(data);
                }
            });
            ws.on("message", data => {
                socket.write(data);
            });
            ws.on("close", () => {
                socket.destroy();
            });
        });
        localServer.listen(opt.localPort, () => {
            console.log("proxy client listenting", opt.localPort);
            resolve();
        });
    });
    return p;
}
module.exports = main;
