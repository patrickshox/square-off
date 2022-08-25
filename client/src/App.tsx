import "./App.css";
import { JoinRoom } from "./components/JoinRoom";
import { Game } from "./components/Game"
import { Login } from "./components/Login"
import socketService from "./services/SocketService";
import GameContext, { GameContextProps } from "./gameContext";
import { User } from "./types"
import { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios"

function App() {
  const [isInRoom, setInRoom] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false)
  const [prompt, setPrompt] = useState<[number, number] | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const connectSocket = async () => {
    const socket = await socketService
      .connect("https://api.square-off.live")
      .catch((err) => {
        console.log("Error: ", err);
      });
  };

  useEffect(() => {
    connectSocket();
    axios.get("https://api.square-off.live/getuser", {withCredentials: true}).then((res) => {
      if (res.data) {
        let user: User = {firstName: res.data.displayName, photoUrl: res.data.photos[0].value, id: Math.floor(Math.random() * 200).toString()}
        setUser(user)
      }
    }).catch((err) => console.log(err))
  }, []);

  const gameContextValue: GameContextProps = {
    isInRoom,
    setInRoom,
    isPlaying,
    setIsPlaying,
    prompt,
    setPrompt,
    user,
    setUser
  };

  return (
    <GameContext.Provider value={gameContextValue as GameContextProps}>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element = {user ? (isInRoom ? <Game /> : <JoinRoom />) : <Login />} />
            <Route path="/login/" element = {<Login />} />
            <Route path="/play/" element ={isInRoom ? <Game /> : <JoinRoom />}/>
          </Routes>
        </Router>
      </div>
    </GameContext.Provider>
  );
}


export default App;
