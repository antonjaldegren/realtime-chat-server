const db = require("../data/db.js");

async function add(data) {
	const id = await db("rooms").insert(data);
}

async function getAll() {
	const result = await db("rooms").select();
	return result;
}

async function remove(id) {
	const result = await db("rooms").where("id", id).del();
	return result;
}

module.exports = {
	add,
	getAll,
	remove,
};
