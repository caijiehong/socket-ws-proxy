"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IO = require("socket.io");
const Url = require("url");
const Qs = require("querystring");
const net = require("net");
function main(port) {
    const p = new Promise(resolve => {
        const io = IO();
        io.on("connection", client => {
            const url = Url.parse(client.request.url);
            const qs = Qs.parse(url.query);
            const socket = net.connect({
                host: qs.destHost,
                port: parseInt(qs.destPort, 10)
            }, () => {
                console.log("proxy server connect to tcp server");
                socket.on("data", data => {
                    client.emit("res", data);
                });
            });
            client.on("req", data => {
                socket.write(data);
            });
        });
        io.listen(port);
        resolve();
    });
    return p;
}
module.exports = main;
