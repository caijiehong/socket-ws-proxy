import * as io from "socket.io-client";
import * as net from "net";
import * as Url from "url";
import * as HttpProxyAgent from "http-proxy-agent";
import * as Debug from "debug";

const debug = Debug("socket-ws-client");

interface IOption {
  /**
   * 本地监听端口
   */
  localPort: number;
  /**
   * 转发服务地址, 形如 ws://xxx.com:123
   */
  wsProxyHost: string;
  /**
   * 目标 ip
   */
  destHost: string;
  /**
   * 目标端口
   */
  destPort: number;
  /**
   * 代理地址
   */
  agent?: string;
}

function main(opt: IOption) {
  function tryConnectServer() {
    debug("connect to proxy server", "trying");
    const p = new Promise<SocketIOClient.Socket>(resolve => {
      const query = {
        destHost: opt.destHost,
        destPort: opt.destPort
      };

      let agent: HttpProxyAgent;
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
      const tmpBuffer: Buffer[] = [];

      let wsClient: SocketIOClient.Socket;

      tryConnectServer().then(ws => {
        wsClient = ws;

        let tmp: Buffer;
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
        } else {
          tmpBuffer.push(data);
        }
      });
    });
    localServer.listen(opt.localPort, async () => {
      debug("proxy client listening", opt.localPort);
      const ws = await tryConnectServer();
      ws.close();
      resolve();
    });
  });
  return p;
}

module.exports = main;
