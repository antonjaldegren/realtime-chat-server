/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
	await knex.schema.createTable("messages", (table) => {
		table.increments("id").primary();
		table.string("message").notNullable();
		table.string("author_id").notNullable();
		table.string("author_username").notNullable();
		table
			.string("room_id")
			.notNullable()
			.references("id")
			.inTable("rooms")
			.onDelete("CASCADE");
		table.timestamps(true, true);
	});

	await knex.schema.createTable("rooms", (table) => {
		table.string("id").notNullable().primary();
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema.dropTable("messages");
};
