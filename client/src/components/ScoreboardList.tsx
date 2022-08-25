import { useEffect, useState, forwardRef } from "react"
import gameService from "../services/GameService";
import socketService from "../services/SocketService";
import { Scoreboard, ScoreInfo } from "../types";
import FlipMove from "react-flip-move";

export function ScoreboardList() {

    var [scoreboard, setScoreboard] = useState<Scoreboard>({})

    const handleScoreUpdate =()=> {
        gameService.onScoreUpdate(socketService.socket!, (scoreboard) => {
            setScoreboard(scoreboard)
        })
    }

    const handleGameEnd =()=> {
        gameService.onGameEnd(socketService.socket!, () => {
            setScoreboard({})
        })
    }

    useEffect( () => {
        handleScoreUpdate()
        handleGameEnd()
    }, [])

    return (
        <div id="scoreboard">
            <ol>
                <FlipMove>
                {
                    Object.values(scoreboard).sort((a, b) => b.score - a.score).map(info => {
                        return(
                            <PlayerListItem score={info.score || 0} name={info.name} photoUrl = {info.photoUrl} key = {info.id} />
                        )
                    })
                }
                </FlipMove>
            </ol>
        </div>
    )
}

function PlayerListItem(props: ScoreInfo) {

    return (
        <li className="player-list-item">
            <div className="pli-container">
                <div className="pli-left">
                    <img src={props.photoUrl} />
                    <div className="pli-stack">  
                        <div className = "pli-name">{props.name}</div>
                        <div className = "pli-history">✅ ❌ ✅ ✅ ❌ ❌ ✅ ❌</div>
                    </div>
                </div>
                <div className="pli-right score">{props.score}</div>
            </div>
        </li>
    )
}