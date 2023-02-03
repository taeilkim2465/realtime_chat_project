import http from "http";
import SocketIO from "socket.io";
import express from 'express';

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
// 스크립트 사용시 경로 설정
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });
// const sockets = [];

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

// //on 메서드는 콜백함수에게 socket을 매개변수로 넘겨줌
// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "Ananymous";
//     console.log("Connected to Browser!");
//     socket.on("close", () => console.log("Disconnected from Browser!"));
//     socket.on("message", (message_json) => {
//         const message = JSON.parse(message_json);
//         console.log(message.type, message.payload);
//         switch(message.type) {
//             case "new_message":
//                 sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${message.payload}`));
//                 break;

//             case "nickname":
//                 socket["nickname"] = message.payload;
//                 break;
//         }
//     })
// })

wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anonymous";
    socket.on("nickname", (nickname) => {socket["nickname"] = nickname});
    socket.on("enter_room", (roomName, done) => {
        done();
        socket.join(roomName);
        socket.to(roomName).emit("welcome!", socket.nickname);
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => {
            socket.to(room).emit("bye", socket.nickname)
        });
    });
    socket.on("new_message", (message, room, done) => {
        socket.to(room).emit("message", `${socket.nickname}: ${message}`);
        done();
    });
});

const handleListen = () => {console.log("Listening on http://localhost:3000")};
httpServer.listen(3000, handleListen);