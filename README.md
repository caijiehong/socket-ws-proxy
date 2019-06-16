# socket-to-ws-proxy

proxy a tcp connect throught websocket

## 解决什么问题

- 背景:
  1. 有一个远程 tcp 服务: tcp-server, 本地有一台服务器运行着一个 tcp-client
  2. tcp-client 无法直连所有的远程端口, 对外访问必须通过一个 http-proxy
  3. 但是这个 http-proxy 不提供 socket-proxy 能力
- 解决思路:

```
    tcp-client => ws-proxy-client => http-proxy => ws-proxy-server => tcp-server
```

## 使用方法

1. 找到一台可以访问 tcp-server 的服务器, 运行 ws-proxy-server

```JavaScript
const { Server } = require('socket-to-ws-proxy')
const port = 8801
Server(port)
```

2. 在本地服务器运行 ws-proxy-client

```JavaScript
const { Client } = require('socket-to-ws-proxy')
const opt = {
    localPort: 8802,
    wsProxyHost: "ws://your.remote.wsproxt:8801",
    destHost: "your tcp-server host",
    destPort: 8803 // your tcp-server port
    agent: "http://your.http.proxy"
}
Client(opt)
```
