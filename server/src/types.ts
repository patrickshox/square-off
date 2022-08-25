type Side = "white" | "black"

interface MatchOptions {
    gameDuration: number,
    perspective: Side
}

interface Scoreboard {
    [id: string]: ScoreInfo
}

interface ScoreInfo {
    name?: string
    photoUrl?: string
    score?: number
    id?: string
}

interface PlayerMap {
    [id: string]: Player
}

interface GamesMap {
    [id: string]: GameState
}

interface GameState {
    isPlaying?: boolean
    prompt?: [number, number],
    players: PlayerMap,
    scoreboard: Scoreboard
}

interface Player {
    id: string
    x: number
    y: number
    name?: string,
    photoUrl?: string
}

export type {Side, MatchOptions, GameState, Player, Scoreboard, GamesMap, PlayerMap, ScoreInfo }