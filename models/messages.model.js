const db = require("../data/db.js");

const messageKeys = [
	"id",
	"message",
	"author_id",
	"author_username",
	"room_id",
	"created_at",
];

async function add(data) {
	const result = await db("messages").returning(messageKeys).insert(data);
	return result;
}

async function getAll() {
	const result = await db("messages").select();
	return result;
}

async function getById(id) {
	const result = await db("messages").first().where({ id });
	return result;
}

async function getByRoomId(room_id) {
	const result = await db("messages").select().where({ room_id });
	return result;
}

module.exports = {
	add,
	getAll,
	getById,
	getByRoomId,
};
