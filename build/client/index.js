"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
const net = require("net");
const Url = require("url");
const HttpsProxyAgent = require("https-proxy-agent");
function main(opt) {
    const p = new Promise(resolve => {
        const localServer = net.createServer(socket => {
            const tmpBuffer = [];
            const query = {
                destHost: opt.destHost,
                destPort: opt.destPort
            };
            let agent;
            if (opt.agent) {
                const proxyUrl = Url.parse(opt.agent);
                agent = new HttpsProxyAgent(proxyUrl);
            }
            const ws = io(opt.wsProxyHost, {
                path: "/ws",
                query,
                agent
            });
            // 收到使用者的连接
            socket.on("data", data => {
                console.log("proxy client data", [data.length, ws.connected]);
                if (ws.connected) {
                    ws.emit("req", data);
                }
                else {
                    tmpBuffer.push(data);
                }
            });
            ws.on("res", data => {
                console.log("res", data.length);
                socket.write(data);
            });
            ws.on("connect", () => {
                console.log("proxy clinet connect to proxy server", tmpBuffer.length);
                let tmp;
                while ((tmp = tmpBuffer.pop())) {
                    ws.emit("req", tmp);
                }
            });
            ws.on("disconnect", () => {
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
