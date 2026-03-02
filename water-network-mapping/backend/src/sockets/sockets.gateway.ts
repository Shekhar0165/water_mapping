import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class SocketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Example: Listen for a 'joinRoom' event from the React Frontend (Admins)
  @SubscribeMessage('joinAdminRoom')
  handleJoinAdminRoom(client: Socket) {
    client.join('admin-notifications');
    return 'Joined admin room';
  }

  // Method to be called by other internal NestJS services (e.g., ComplaintsService)
  // to instantly notify all connected admins of a new leak without refreshing the page.
  notifyAdminsOfNewComplaint(complaintData: any) {
    this.server.to('admin-notifications').emit('newComplaint', complaintData);
  }
}
