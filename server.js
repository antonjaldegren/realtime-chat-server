const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

let messages = [];
let users = [];
let rooms = [];

const io = new Server({
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

function getAllUsers() {
	const sockets = [];
	io.sockets.sockets.forEach((socket) =>
		sockets.push({
			id: socket.id,
			username: socket.username,
		})
	);
	return sockets;
}

io.use((socket, next) => {
	console.log(`Socket with ID ${socket.id} has connected`);
	next();
});

io.on("connection", (socket) => {
	socket.on("ready", () => {
		socket.emit("initial_data", { users: getAllUsers(), rooms: rooms });
	});

	socket.on("message", (data) => {
		console.log(`${socket.id} has sent ${data}`);
		const message = {
			id: uuidv4(),
			author: socket.id,
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

	socket.on("join_room", (data) => {
		socket.join(data);
		console.log(
			`User with ID: ${socket.id} has joined room with ID: ${data}`
		);

		socket.emit(
			"existing_messages",
			messages.filter((message) => message.to === data)
		);

		if (rooms.findIndex((room) => room.id === data) !== -1) return;
		rooms.push({ id: data });
		io.emit("new_room", rooms);
	});

	socket.on("set_username", (data) => {
		socket.username = data;
		io.emit("new_user", getAllUsers());
	});

	socket.on("disconnect", (reason) => {
		users = users.filter((user) => user.id !== socket.id);
		// console.log(io.of("/").sockets);
		io.emit("new_user", users);
		console.log(
			`Socket with ID ${socket.id} has disconnected. Reason: ${reason}`
		);
	});
});

io.listen(4000);
