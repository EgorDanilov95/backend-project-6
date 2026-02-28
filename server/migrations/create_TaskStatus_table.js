// @ts-check

export const up = (knex) => (
  knex.schema.createTable('task_statuses', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  })
);

export const down = (knex) => knex.schema.dropTable('task_statuses');
