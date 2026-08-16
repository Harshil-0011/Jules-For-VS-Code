import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export class EventStreamServer {
  private wss: WebSocketServer;
  private clients = new Set<WebSocket>();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/events' });

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);

      ws.send(JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() }));

      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });
  }

  public broadcast(event: { type: string; payload: any }): void {
    const data = JSON.stringify({ ...event, timestamp: new Date().toISOString() });
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }
}
