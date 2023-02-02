const socket = io();

const start = document.getElementById("start");
const nick = document.getElementById("nick");
const nick_form = nick.querySelector("form");
const welcome = document.getElementById("welcome");
const room_form = welcome.querySelector("form");
const chat = document.getElementById("chat");
const chat_form  = chat.querySelector("form");


chat.hidden = true;

let roomName;
let nickName;

function showChattingWindow() {
    start.hidden = true;
    chat.hidden = false;
    const h3 = chat.querySelector("h3");
    h3.innerText = `Room ${roomName}`;

}

function addChat(message) {
    const ul = chat.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = room_form.querySelector("input");
    // emit 함수를 이용하면 이벤트의 이름을 설정할 수 있다. 첫 번째 인자: 이름, 두 번째 인자: 데이터(문자열일 필요 없음), 마지막 인자: 콜백함수
    socket.emit("enter_room", input.value, showChattingWindow);
    roomName = input.value;
    input.value = "";
}

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nick_form.querySelector("input");
    socket.emit("save_nick", input.value)
    nickName = input.value;
    const h3 = nick.querySelector("h3");
    h3.innerText = `Saved Nickname: ${input.value}`;
}

function handleNewMessage(event) {
    event.preventDefault();
    const input = chat_form.querySelector("input");
    socket.emit("new_message", roomName, nickName, input.value);
    const ul = chat.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = nickName+": "+input.value;
    ul.appendChild(li);
    input.value = "";
}

function welcomeMessage(message) {
    const ul = chat.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

socket.on("welcome!", (nickName) => {
    welcomeMessage(`${nickName} joined!`);
});

socket.on("message", (nickName, message) => {
    addChat(`${nickName}: ${message}`);
})

room_form.addEventListener("submit", handleRoomSubmit);
nick_form.addEventListener("submit", handleNickSubmit);
chat_form.addEventListener("submit", handleNewMessage);
