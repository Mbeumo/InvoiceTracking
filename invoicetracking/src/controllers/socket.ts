export type SocketEvent = {
    type: string;
    payload: any;
};

type Listener = (event: SocketEvent) => void;

export class RealtimeSocket {
    private ws: WebSocket | null = null;
    private listeners: Set<Listener> = new Set();
    private url: string;
    private tokenProvider: () => string | null;
    private reconnectDelayMs = 2000;
    private shouldRun = false;

    constructor(url: string, tokenProvider: () => string | null) {
        this.url = url;
        this.tokenProvider = tokenProvider;
    }

    start() {
        this.shouldRun = true;
        this.connect();
    }

    stop() {
        this.shouldRun = false;
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    on(listener: Listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private connect() {
        const token = this.tokenProvider();
        const wsUrl = this.buildUrlWithToken(token);
        this.ws = new WebSocket(wsUrl);

        this.ws.onmessage = (msg) => {
            try {
                const data = JSON.parse(msg.data);
                this.listeners.forEach(l => l(data));
            } catch {}
        };
        this.ws.onclose = () => {
            this.ws = null;
            if (this.shouldRun) setTimeout(() => this.connect(), this.reconnectDelayMs);
        };
        this.ws.onerror = () => {
            try { this.ws?.close(); } catch {}
        };
    }

    private buildUrlWithToken(token: string | null) {
        // default dev URL, can be overridden via env
        const base = (import.meta as any).env?.VITE_WS_BASE_URL || 'ws://localhost:9999/ws';
        const url = new URL(base);
        if (token) url.searchParams.set('token', token);
        return url.toString();
    }
    
    // Send event to WebSocket server
    send(event: SocketEvent) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(event));
        }
    }
}


