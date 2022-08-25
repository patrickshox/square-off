import "reflect-metadata";
// import { app, sessionMiddleware } from "./app";
const { app, sessionMiddleware } = require("./app")
var debug = require("debug")("socketio-server:server");
import * as http from "http";
import socketServer from "./socket";
import { Socket } from "socket.io";
const passport = require("passport");

var port = normalizePort(process.env.PORT || "9000");
app.set("port", port);

var server = http.createServer(app);

server.listen(process.env.PORT || port);
server.on("error", onError);
server.on("listening", onListening);

var io = require("socket.io")(http);
io.use()
// const io = socketServer(server);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
  
  console.log("Server Running on Port: ", port);
}
