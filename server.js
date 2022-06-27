const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const messagesModel = require("./models/messages.model");
const roomsModel = require("./models/rooms.model");

async function getAllMessages() {
	const result = await messagesModel.getAll();
	// console.log("getAllMessages: ", result);
}

async function getMessagesByRoomId() {
	const result = await messagesModel.getByRoomId("Någons room");
	// console.log("getMessagesByRoomId: ", result);
}

getAllMessages();
getMessagesByRoomId();

let messages = [];
let rooms = [];

const io = new Server({
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

function getSockets() {
	return Object.fromEntries(io.sockets.sockets);
}

function getFilteredSockets() {
	const sockets = getSockets();
	return Object.keys(sockets).map((key) => ({
		id: sockets[key].id,
		username: sockets[key].username,
	}));
}

function getUsernameById(id) {
	return getSockets[id].username;
}

function getRoomsAndSockets() {
	// Alla rooms och vilka som är med
	return Object.fromEntries(io.of("/").adapter.rooms);
}

function getSocketsAndRooms() {
	// Alla sockets och vilka rum de är med i
	return Object.fromEntries(io.of("/").adapter.sids);
}

io.use((socket, next) => {
	console.log(`Socket with ID ${socket.id} has connected`);
	next();
});

io.on("connection", (socket) => {
	socket.on("ready", async () => {
		const dbRooms = await roomsModel.getAll();

		socket.emit("initial_data", {
			users: getFilteredSockets(),
			rooms: dbRooms,
		});
	});

	socket.on("message", (data) => {
		console.log(`${socket.id} has sent ${data}`);

		const message = {
			id: uuidv4(),
			author: { id: socket.id, username: socket.username },
			message: data.message,
			to: data.to,
			created_at: "2022-06-21 14:00",
		};

		messages.push(message);
		io.to(data.to).emit("message", message);
	});

	socket.on("direct_message", (data) => {
		socket.to(data.to).emit("message", data.message);
	});

	socket.on("create_room", async (room) => {
		const newRoom = await roomsModel.add(room);
	});

	socket.on("join_room", (room) => {
		const joinedRooms = Array.from(socket.rooms);
		const roomToLeave = joinedRooms[1];

		socket.leave(roomToLeave);
		socket.join(room);
		console.log(
			`User with ID: ${socket.id} has joined room with ID: ${room}`
		);

		socket.emit(
			"existing_messages",
			messages.filter((message) => message.to === room)
		);

		if (rooms.findIndex((r) => r.id === room) !== -1) return;
		rooms.push({ id: room });
		io.emit("new_room", rooms);
	});

	socket.on("is_writing", (data) => {
		socket.broadcast.to(data.to).emit("is_writing", {
			isWriting: data.isWriting,
			user: { id: socket.id, username: socket.username },
		});
	});

	socket.on("set_username", (data) => {
		socket.username = data;
		io.emit("updated_users", getFilteredSockets());
	});

	socket.on("disconnect", (reason) => {
		io.emit("updated_users", getFilteredSockets());
		console.log(
			`Socket with ID ${socket.id} has disconnected. Reason: ${reason}`
		);
	});
});

io.listen(4000);
