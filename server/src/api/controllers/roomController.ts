import { ConnectedSocket, MessageBody, OnMessage, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";
import gamesManager from "./gamesManager";
import { GameState } from "../../types";

@SocketController()
export class RoomController {
  private getSocketGameRoom(socket: Socket): string {
    const socketRooms = (Array.from(socket.rooms.values()) as string[]).filter(
      (r) => r !== socket.id
    );
    const gameRoom: string = socketRooms && socketRooms[0];

    return gameRoom;
  }

  @OnMessage("join_game")
  public async joinGame(@SocketIO() io: Server, @ConnectedSocket() socket: Socket, @MessageBody() message: any) {

    const connectedSockets = io.sockets.adapter.rooms.get(message.roomId);
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (r) => r !== socket.id
    );

    if (socketRooms.length > 0 || (connectedSockets && connectedSockets.size === 3)) {
      socket.emit("room_join_error", {
        error: "Room is full please choose another room to play!",
      });
    } else {
      await socket.join(message.roomId);
      socket.emit("room_joined");

      const gameRoom = this.getSocketGameRoom(socket)

      if (gamesManager.games[gameRoom] === undefined) {
        let defaultGS: GameState =  { isPlaying: false, players: {}, scoreboard: {} }
        gamesManager.games[gameRoom] = defaultGS
      }
      
      gamesManager.games[gameRoom].players[socket.id] = { id: socket.id, x:0, y: 0, name: message.firstName, photoUrl: message.photoUrl }
      io.in(gameRoom).emit("player_has_joined", {players_map: gamesManager.games[gameRoom].players})
    }
  }

}
