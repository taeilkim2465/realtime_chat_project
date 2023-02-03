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

function publicRooms() {
    // const rooms = wsServer.sockets.adapter.rooms;
    // const sids = wsServer.sockets.adapter.sids;

    // 구조체 할당
    const {
        sockets: {
            adapter: {sids, rooms},
        },
    } = wsServer;

    const publicRooms = [];
    rooms.forEach((value, key) => {
        if(sids.get(key) === undefined) {
            // publicRooms.push([key, value.length])
            publicRooms.push([key, value.size]);
        }
    })
    return publicRooms;
}

function countRoom(roomName) {
    // 채팅룸을 찾은 경우에만 size를 출력할 수 있도록 ? 연산자 사용
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anonymous";
    wsServer.sockets.emit("room_change", publicRooms());
    socket.onAny((event) => {
        // console.log(wsServer.sockets.adapter);
        // console.log(`Socket Event:${event}`);
    });
    socket.on("nickname", (nickname) => {socket["nickname"] = nickname});
    socket.on("enter_room", (roomName, done) => {
        done();
        socket.join(roomName);
        socket.emit("room_member_info", countRoom(roomName));
        socket.to(roomName).emit("welcome!", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => {
            socket.to(room).emit("bye", socket.nickname, countRoom(room)-1);
        });
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    })
    socket.on("new_message", (message, room, done) => {
        socket.to(room).emit("message", `${socket.nickname}: ${message}`);
        done();
    });
});

const handleListen = () => {console.log("Listening on http://localhost:3000")};
httpServer.listen(3000, handleListen);