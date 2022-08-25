import { ConnectedSocket, MessageBody, OnMessage, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";
import gamesManager from "./gamesManager"
import { MatchOptions, Player, Scoreboard } from "../../types"

@SocketController()
export class GameController {

  private endGame(gameRoom: string, io: Server) {
     
    let { winners, losers } = gamesManager.calculateWinnersIn(gameRoom)
    winners.forEach(winner => io.to(winner).emit("you won"))
    losers.forEach(loser => io.to(loser).emit("you won"))

    gamesManager.cleanUpGameIn(gameRoom)
    io.in(gameRoom).emit("game_end", { winners })
  }

  private getSocketGameRoom(socket: Socket): string {
    const socketRooms = (Array.from(socket.rooms.values()) as string[]).filter(
      (r) => r !== socket.id
    );
    const gameRoom = socketRooms && socketRooms[0];

    return gameRoom;
  }

  @OnMessage("start_game")
  public async startGame(@SocketIO() io: Server, @ConnectedSocket() socket: Socket, @MessageBody() message: MatchOptions) {
    const gameRoom = this.getSocketGameRoom(socket)

    if (gamesManager.games[gameRoom].isPlaying) { return }

    // initializaiton
    let {prompt, scoreboard} = gamesManager.startUpGameIn(gameRoom)
    io.in(gameRoom).emit("updated_score", { scoreboard })
    io.in(gameRoom).emit("new_prompt", { prompt })
    io.in(gameRoom).emit("game_has_started");

    // timer stuff
    var timeLeft = message.gameDuration;
    io.in(gameRoom).emit("time_left", { timeLeft: timeLeft })
    timeLeft -- 
    let countdownId = setInterval(() => {
      io.in(gameRoom).emit("time_left", { timeLeft: timeLeft })
      timeLeft -- 
      if (timeLeft < 0) {
        this.endGame(gameRoom, io)
        clearInterval(countdownId)
      }
    }, 1000)

  }

  @OnMessage("answer_submission")
  public async evaluateAnswer(@SocketIO() io: Server, @ConnectedSocket() socket: Socket, @MessageBody() message: any) {
    
    const gameRoom = this.getSocketGameRoom(socket)
    if (!gamesManager.games[gameRoom].isPlaying) { return }

    // evaluate answer
    const answerWasCorrect = gamesManager.gradeAnswer(message.answer, gameRoom)
    if (answerWasCorrect) {
      gamesManager.incrementScore(socket, 1)
    } else {
      gamesManager.incrementScore(socket, -1)
    }
    io.in(gameRoom).emit("updated_score", {scoreboard: gamesManager.games[gameRoom].scoreboard})

    // generate new prompt
    let prompt = gamesManager.generateRandomPrompt(gameRoom)
    io.in(gameRoom).emit("new_prompt", { prompt })
  }

  @OnMessage("mouse_move")
  public async updatePlayerPosition(@SocketIO() io: Server, @ConnectedSocket() socket: Socket, @MessageBody() message: any) {
    const gameRoom = this.getSocketGameRoom(socket)
    const position = message.position

    gamesManager.updatePlayerPosition(socket, position[0], position[1])
    
    var map = {...gamesManager.games[gameRoom].players} // TODO: only transmit x, y, id. since profileUrl and name rarely change.
    
    io.in(gameRoom).emit("updated_player_positions", { players_map: map })
  }

  @OnMessage("needs_complete_player_map")
  public async sendCompletePlayerMap(@SocketIO() io: Server, @ConnectedSocket() socket: Socket) {
    const gameRoom = this.getSocketGameRoom(socket)

    var map = gamesManager.games[gameRoom].players
    
    io.in(gameRoom).emit("complete_player_map", { players_map: map })
  }

}
