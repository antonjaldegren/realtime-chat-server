const db = require("../data/db.js");

async function add(data) {
	const result = await db("messages").insert(data);
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
