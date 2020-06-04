import Knex from "knex";

export async function up(knex: Knex) {
  return knex.schema.createTable("point_to_items", (table) => {
    table.increments("id").primary();

    table.integer("point_id").notNullable().references("id").inTable("points");

    table.integer("item_id").notNullable().references("id").inTable("items"); // item_id will be an id of an item coming from the items table;
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable("point_to_items");
}
