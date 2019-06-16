"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const Url = require("url");
const Qs = require("querystring");
const net = require("net");
function main(port) {
    const p = new Promise(resolve => {
        const wss = new WebSocket.Server({ port }, () => {
            console.log("proxy sever listenting", port);
            resolve(wss);
        });
        wss.on("connection", function connection(ws, req) {
            console.log("proxy server connection", req.url);
            const url = Url.parse(req.url);
            const qs = Qs.parse(url.query);
            const tmpBuffer = [];
            const socket = net.connect({
                host: qs.destHost,
                port: parseInt(qs.destPort, 10)
            }, () => {
                console.log("proxy server connect to tcp server");
                let tmp;
                while ((tmp = tmpBuffer.pop())) {
                    socket.write(tmp);
                }
                socket.on("data", data => {
                    ws.send(data);
                });
            });
            ws.on("message", function incoming(message) {
                console.log("proxy server recevice", [message, socket.connecting]);
                if (!socket.connecting) {
                    socket.write(message);
                }
                else {
                    tmpBuffer.push(message);
                }
            });
        });
        return wss;
    });
    return p;
}
module.exports = main;
