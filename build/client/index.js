"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
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
            const ws = io(url, {
                agent
            });
            // 收到使用者的连接
            socket.on("data", data => {
                console.log("proxy client data", [data.length]);
                ws.emit("req", data);
            });
            ws.on("res", data => {
                socket.write(data);
            });
            ws.on("error", err => {
                console.error("proxy client ws error");
                console.error(err);
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
