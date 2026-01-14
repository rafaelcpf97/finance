exports.up = function (knex) {
  return knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('type').notNullable(); // 'TRANSFER_RECEIVED', etc.
    table.text('message').notNullable();
    table.boolean('read').notNullable().defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('notifications');
};
