import * as WebSocket from "ws";
import * as net from "net";
import * as Url from "url";
import * as querystring from "querystring";
import * as HttpsProxyAgent from "https-proxy-agent";

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
  const p = new Promise<WebSocket>(resolve => {
    const localServer = net.createServer(socket => {
      console.log("proxy client connection");

      const tmpBuffer: Buffer[] = [];

      const query = {
        destHost: opt.destHost,
        destPort: opt.destPort
      };
      const url = `${opt.wsProxyHost}?${querystring.stringify(query)}`;

      let agent: HttpsProxyAgent;
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
        } else {
          ws.send(data);
        }
      });
      socket.on("close", () => {
        ws.close();
      });

      ws.on("open", () => {
        console.log("proxy client open");

        let data: Buffer;
        while ((data = tmpBuffer.pop())) {
          ws.send(data);
        }
      });
      ws.on("message", data => {
        socket.write(data as Buffer);
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
