import * as io from "socket.io-client";
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
  const p = new Promise(resolve => {
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
