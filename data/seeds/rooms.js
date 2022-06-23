/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
	const table = "rooms";

	await knex(table).del();
	await knex(table).insert([
		{ id: 1, colName: "rowValue1" },
		{ id: 2, colName: "rowValue2" },
		{ id: 3, colName: "rowValue3" },
	]);
};
