const db = require("../data/db.js");

async function add(name) {
	const result = await db("rooms").insert({ name });
	return result;
}

async function getAll() {
	const result = await db("rooms").select();
	return result;
}

async function getByName(name) {
	const result = await db("rooms").select().where({ name });
	return result;
}

async function remove(id) {
	const result = await db("rooms").where("id", id).del();
	return result;
}

module.exports = {
	add,
	getAll,
	getByName,
	remove,
};
