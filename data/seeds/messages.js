/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
	const table = "messages";

	await knex(table).del();
	await knex(table).insert([
		{
			message: "Hej på dig!",
			author_id: "123abc",
			author_username: "antonjaldegren",
			room_id: "Antons room",
		},
		{
			message: "Hej på dig med!",
			author_id: "456def",
			author_username: "NågonAnnansson",
			room_id: "Antons room",
		},
		{
			message: "Hejsan hoppsan!",
			author_id: "123abc",
			author_username: "antonjaldegren",
			room_id: "Någons room",
		},
		{
			message: "Hejsan hoppsan på dig med!",
			author_id: "456def",
			author_username: "NågonAnnansson",
			room_id: "Någons room",
		},
	]);
};
