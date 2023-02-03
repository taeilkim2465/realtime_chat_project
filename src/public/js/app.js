const socket = io();

const welcome = document.getElementById("welcome");
const nick_form = document.querySelector("#nick");
const room_form = document.querySelector("#room");
const chat = document.getElementById("chat");

chat.hidden = true;

let roomName;

function addMessage(message) {
    const ul = chat.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function showChattingWindow() {
    welcome.hidden = true;
    chat.hidden = false;
    const h3 = chat.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const chat_form = chat.querySelector("form");
    chat_form.addEventListener("submit", handleMessageSubmit);
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = nick_form.querySelector("input");
    socket.emit("nickname", input.value);
    const h3 = welcome.querySelector("h3");
    h3.innerText = `Saved Nickname: ${input.value}`;
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = room_form.querySelector("input");
    // emit 함수를 이용하면 이벤트의 이름을 설정할 수 있다. 첫 번째 인자: 이름, 두 번째 인자: 데이터(문자열일 필요 없음), 마지막 인자: 콜백함수
    socket.emit("enter_room", input.value, showChattingWindow);
    roomName = input.value;
    input.value = "";
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = chat.querySelector("input");
    const message = input.value;
    socket.emit("new_message", message, roomName, () => {
        addMessage(`You: ${message}`);
    });
    input.value = "";
}

socket.on("welcome!", (nickname) => {
    addMessage(`${nickname} joined!`);
});

socket.on("bye", (nickname) => {
    addMessage(`${nickname} left!`);
});

socket.on("message", (message) => {
    addMessage(message);
})

nick_form.addEventListener("submit", handleNicknameSubmit);
room_form.addEventListener("submit", handleRoomSubmit);