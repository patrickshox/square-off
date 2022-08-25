import { GameState, GamesMap, Scoreboard, PlayerMap, ScoreInfo } from "../../types"
import { Socket } from "socket.io"

class GamesManager {

    games: GamesMap = {}

    private getRandomSquare(): [number, number] {
        return [Math.round(Math.random()*7+1), Math.round(Math.random()*7+1)]
    }

    private getSocketGameRoom(socket: Socket): string {
        const socketRooms = (Array.from(socket.rooms.values()) as string[]).filter(
          (r) => r !== socket.id
        );
        const gameRoom = socketRooms && socketRooms[0];
    
        return gameRoom;
    }

    public calculateWinnersIn =(gameRoom: string): ({winners: string[], losers: string[]}) => {
        let scoreInfos = Object.values(this.games[gameRoom].scoreboard)
        let scores = scoreInfos.map(si => si.score || 0)
        const max = Math.max(...scores);
        const winners = [];
        const losers = []

        scores.forEach((score, index) => {
        let player = scoreInfos[index]
        if (score === max) {
            winners.push(player)
        } else {
            losers.push(player)
        }
        })

        return {winners: [], losers: []}
    }

    public startUpGameIn =(gameRoom: string)=> {
        this.games[gameRoom].isPlaying = true
        let prompt = this.generateRandomPrompt(gameRoom)
        this.clearScoreboardIn(gameRoom)
        let scoreboard = this.games[gameRoom].scoreboard
        return {prompt, scoreboard}
    }

    public cleanUpGameIn =(gameRoom: string)=> {
        this.games[gameRoom].isPlaying = false
        this.games[gameRoom].prompt = null
        this.clearScoreboardIn(gameRoom)
    }

    public clearScoreboardIn =(gameRoom: string)=> {
        let pm: PlayerMap = this.games[gameRoom].players
        let blankSB: Scoreboard = this.initializeScoreboardFromPlayers(pm)
        this.games[gameRoom].scoreboard = blankSB
    }

    public initializeScoreboardFromPlayers =(pm: PlayerMap)=> {
        let sb = {}
        Object.keys(pm).map((socket_id) => {
            let info: ScoreInfo = {
                score: 0,
                id: socket_id,
                photoUrl: pm[socket_id].photoUrl,
                name: pm[socket_id].name
            }
            sb[socket_id] = info
        })
        return sb
    }

    public gradeAnswer =(answer: [number, number], gameRoom: string): boolean=> {
        return answer.toString() == this.games[gameRoom].prompt.toString()
    }

    public incrementScore =(socket: Socket, value: (1 | -1))=> {
        let gameRoomID = this.getSocketGameRoom(socket)
        let scoreboard = this.games[gameRoomID].scoreboard
        scoreboard[socket.id].score = (scoreboard[socket.id].score ?? 0) + value
    }

    public generateRandomPrompt =(gameRoom: string): [number, number]=> {
        let newPrompt = this.getRandomSquare()
        this.games[gameRoom].prompt = newPrompt
        return newPrompt
    }

    public updatePlayerPosition =(socket: Socket, x: number, y: number)=> {
        let gameRoom = this.getSocketGameRoom(socket)
        this.games[gameRoom].players[socket.id].x = Math.min(Math.max(0, x), 100)
        this.games[gameRoom].players[socket.id].y = Math.min(Math.max(0, y), 100)
    }
}

export default new GamesManager()
