import { useSocketServer } from "socket-controllers";
import { Server } from "socket.io";
import gamesManager from "./api/controllers/gamesManager";
import {sessionMiddleware} from "./app"

export default (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // wrap will take in any express middleware and make it compatible with socket.io
  const wrap = (expressMiddleware) => {
    return (socket, next) => expressMiddleware(socket.request, {}, next)
  }

  io.use(wrap(sessionMiddleware))

  // ideally, i would have used the @OnMessage("disconnnecting"), but it isn't supported.
  io.on("connection", (socket) => {
    console.log((socket.request as any).session)
    alert("connected")
    socket.on("disconnecting", (reason) => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          // delete player from room
          delete gamesManager.games[room].players[socket.id]
          // if room is now empty, delete it.
          if ((gamesManager).games[room].players == {}) {
            delete (gamesManager).games[room]
          }
        }
      }
    });
  }); 

  useSocketServer(io, { controllers: [__dirname + "/api/controllers/*.ts"] });

  return io;
};