import { BoardProps, PlayerMap } from "../types"
import { Square } from "./Square"
import socketService from "../services/SocketService";
import gameService from "../services/GameService";
import { useEffect, useState, useContext, useRef, MouseEvent } from "react";
import Rival from "./Rival"
import React from "react";
import gameContext from "../gameContext";


function Board(props: BoardProps) {

    const [players, setPlayers] = useState<PlayerMap>({})
    var { prompt } = useContext(gameContext)

    const boardRef = useRef<HTMLDivElement>(null)

    var nums = [1, 2, 3, 4, 5, 6, 7, 8]
    if (props.perspective == "white") {
      nums = nums.reverse()
    }

    const renderRow =(r: number)=> { 
        var nums = [1, 2, 3, 4, 5, 6, 7, 8]   
        if (props.perspective == "black") {
            nums = nums.reverse()
        }

        return (
          <div className = "row" key = {r} >
            {nums.map(c => <Square row = {r} col = {c} key = {c} onSubmitAnswer = {props.onSubmitAnswer} prompt = {prompt} />)}
          </div>
        )
    }

    const handlePlayerJoins =()=> {
        gameService.onPlayerJoin(socketService.socket!, (players) => {
            setPlayers(players)
        })
    }

    const getPlayersOnInitialJoin =()=> {
        gameService.requestCompletePlayerMap(socketService.socket!, (players) => {
            setPlayers(players)
        })
    }

    const sendMouseMove =(e: MouseEvent)=> {
        var board = boardRef.current
        if (!board) {alert("no board"); return}

        var rect = board.getBoundingClientRect()
        var x = 100 * (e.clientX - rect.left)/rect.width
        var y = 100 * (e.clientY - rect.top)/rect.height

        gameService.sendMouseMove(socketService.socket!, [x, y])
    }

    const handleMouseMove =()=> {
        gameService.onMouseMove(socketService.socket!, (players_map) => {
            setPlayers( prevState => {
                let copy = {...prevState}
                for (const id in copy) {
                    copy[id].x = players_map[id]?.x
                    copy[id].y = players_map[id]?.y
                }
                return copy
            })
        })
    }

    const renderRivals =(players: PlayerMap)=> {
        var list: React.ReactFragment[] = []
        for (var pid in players) {
            if (pid == socketService!.socket!.id) { continue }
            let player = players[pid]
            list.push(
                <Rival {...player} />
            )
        }
        return list
    }

    useEffect( () => {
        handleMouseMove()
        handlePlayerJoins()
        getPlayersOnInitialJoin()
    }, [])

    return (
        <div id = "board" ref={boardRef} onMouseMove={sendMouseMove}>
            {nums.map(r => renderRow(r))}
            {
                renderRivals(players)
            }
        </div>
    ) 
}

  export default Board