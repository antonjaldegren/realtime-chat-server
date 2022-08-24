const { Server } = require("socket.io");
const fs = require("fs");
const messagesModel = require("./models/messages.model");
const roomsModel = require("./models/rooms.model");

const io = new Server({
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

const log = fs.createWriteStream("messages.log", { flags: "a" });

function getUsers() {
	const sockets = Object.fromEntries(io.sockets.sockets);
	const rooms = Object.fromEntries(io.of("/").adapter.sids);

	return Object.keys(sockets).map((key) => ({
		id: sockets[key].id,
		username: sockets[key].username,
		currentRoom: [...rooms[key]][1] || null,
		isWriting: sockets[key].isWriting,
	}));
}

io.use((socket, next) => {
	socket.on("message", (data) => {
		const logEntry = `{ timestamp: ${Date.now()} | author_id: ${
			socket.id
		} | room_id: ${data.room_id} | message: ${data.message} }\n`;
		log.write(logEntry);
	});
	next();
});

io.on("connection", (socket) => {
	socket.on("message", async (data) => {
		if (data.message.length === 0)
			return socket.emit("error_status", { message: true });

		const message = {
			author_id: socket.id,
			author_username: socket.username,
			message: data.message,
			room_id: data.room_id,
			created_at: Date.now(),
		};

		const [newMessage] = await messagesModel.add(message);
		socket.emit("error_status", { message: false });
		io.to(data.room_id).emit("message", newMessage);
	});

	socket.on("create_room", async (name) => {
		const existingRoom = await roomsModel.getByName(name);
		if (existingRoom.length > 0)
			return socket.emit("error_status", { create_room: true });

		await roomsModel.add(name);
		const allRooms = await roomsModel.getAll();
		socket.emit("error_status", { create_room: false });
		io.emit("updated_rooms", allRooms);
	});

	socket.on("join_room", async (roomId) => {
		const joinedRooms = Array.from(socket.rooms);
		const roomToLeave = joinedRooms[1];

		socket.leave(roomToLeave);
		socket.join(roomId);

		const existingMessages = await messagesModel.getByRoomId(roomId);
		socket.emit("existing_messages", existingMessages);
		io.emit("updated_users", getUsers());
	});

	socket.on("remove_room", async (roomId) => {
		await roomsModel.remove(roomId);
		const allRooms = await roomsModel.getAll();
		io.emit("updated_rooms", allRooms);
	});

	socket.on("is_writing", (data) => {
		socket.isWriting = data.isWriting;
		socket.broadcast.to(data.room_id).emit("updated_users", getUsers());
	});

	socket.on("set_username", async (data) => {
		socket.username = data;
		socket.isWriting = false;
		io.emit("updated_users", getUsers());

		const rooms = await roomsModel.getAll();
		socket.emit("initial_data", {
			users: getUsers(),
			rooms: rooms,
		});
	});

	socket.on("disconnect", () => {
		io.emit("updated_users", getUsers());
	});
});

io.listen(process.env.PORT || 4000);
