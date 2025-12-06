import { io, Socket } from 'socket.io-client';
import { WS_URL, getAuthToken } from './api/config';

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token required for WebSocket connection');
    }

    this.socket = io(WS_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers();
    return this.socket;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Room events
  joinRoom(roomId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-room', { roomId });
    }
  }

  leaveRoom(roomId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-room', { roomId });
    }
  }

  sendRoomMessage(roomId: string, content: string): void {
    if (this.socket?.connected) {
      this.socket.emit('send-message', { roomId, content });
    }
  }

  // Chat events
  joinChat(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-chat', { chatId });
    }
  }

  sendDirectMessage(chatId: string, content: string): void {
    if (this.socket?.connected) {
      this.socket.emit('send-dm', { chatId, content });
    }
  }

  // Typing indicators
  startTyping(roomId: string, isRoom: boolean = true): void {
    if (this.socket?.connected) {
      const event = isRoom ? 'typing-start-room' : 'typing-start-chat';
      this.socket.emit(event, { roomId });
    }
  }

  stopTyping(roomId: string, isRoom: boolean = true): void {
    if (this.socket?.connected) {
      const event = isRoom ? 'typing-stop-room' : 'typing-stop-chat';
      this.socket.emit(event, { roomId });
    }
  }

  // Event listeners
  onRoomMessage(callback: (data: any) => void): void {
    this.socket?.on('new-message', callback);
  }

  onDirectMessage(callback: (data: any) => void): void {
    this.socket?.on('new-dm', callback);
  }

  onTyping(callback: (data: any) => void): void {
    this.socket?.on('user-typing', callback);
  }

  onStopTyping(callback: (data: any) => void): void {
    this.socket?.on('user-stop-typing', callback);
  }

  onNotification(callback: (data: any) => void): void {
    this.socket?.on('notification', callback);
  }

  // Remove event listeners
  offRoomMessage(callback?: (data: any) => void): void {
    this.socket?.off('new-message', callback);
  }

  offDirectMessage(callback?: (data: any) => void): void {
    this.socket?.off('new-dm', callback);
  }

  offTyping(callback?: (data: any) => void): void {
    this.socket?.off('user-typing', callback);
  }

  offStopTyping(callback?: (data: any) => void): void {
    this.socket?.off('user-stop-typing', callback);
  }

  offNotification(callback?: (data: any) => void): void {
    this.socket?.off('notification', callback);
  }
}

// Export singleton instance
export const socketClient = new SocketClient();
export default socketClient;
