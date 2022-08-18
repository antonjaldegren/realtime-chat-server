/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
	await knex.schema.createTable("rooms", (table) => {
		table.increments("id");
		table.string("name").notNullable();
	});

	await knex.schema.createTable("messages", (table) => {
		table.increments("id");
		table.string("message").notNullable();
		table.string("author_id").notNullable();
		table.string("author_username").notNullable();
		table.integer("room_id").notNullable();
		table.bigint("created_at");

		table.foreign("room_id").references("rooms.id").onDelete("CASCADE");
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
	await knex.schema.dropTable("messages");

	await knex.schema.dropTable("rooms");
};
