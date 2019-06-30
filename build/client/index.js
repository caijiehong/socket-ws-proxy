"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
const net = require("net");
const Url = require("url");
const HttpProxyAgent = require("http-proxy-agent");
const Debug = require("debug");
const debug = Debug("socket-ws-client");
function main(opt) {
    function tryConnectServer() {
        debug("connect to proxy server", "trying");
        const p = new Promise(resolve => {
            const query = {
                destHost: opt.destHost,
                destPort: opt.destPort
            };
            let agent;
            if (opt.agent) {
                const proxyUrl = Url.parse(opt.agent);
                agent = new HttpProxyAgent(proxyUrl);
            }
            const ws = io(opt.wsProxyHost, {
                path: "/ws",
                query,
                agent
            });
            ws.on("connect", () => {
                debug("connect to proxy server", "success");
                resolve(ws);
            });
            ws.on("event", event => {
                debug("recevice event", event);
            });
        });
        return p;
    }
    const p = new Promise(resolve => {
        const localServer = net.createServer(socket => {
            const tmpBuffer = [];
            let wsClient;
            tryConnectServer().then(ws => {
                wsClient = ws;
                let tmp;
                while ((tmp = tmpBuffer.pop())) {
                    wsClient.emit("req", tmp);
                }
                wsClient.on("res", data => {
                    debug("receive res from proxy server", data.length);
                    socket.write(data);
                });
                wsClient.on("disconnect", () => {
                    debug("disconnect from proxy server");
                    socket.destroy();
                });
            });
            // 收到使用者的连接
            socket.on("data", data => {
                debug("receive from tcp client", [
                    data.length,
                    wsClient && wsClient.connected
                ]);
                if (wsClient && wsClient.connected) {
                    wsClient.emit("req", data);
                }
                else {
                    tmpBuffer.push(data);
                }
            });
        });
        localServer.listen(opt.localPort, () => __awaiter(this, void 0, void 0, function* () {
            debug("proxy client listening", opt.localPort);
            const ws = yield tryConnectServer();
            ws.close();
            resolve();
        }));
    });
    return p;
}
module.exports = main;
