exports.up = function (knex) {
  return knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('type').notNullable(); // 'DEPOSIT', 'TRANSFER_OUT', 'TRANSFER_IN'
    table.decimal('amount', 15, 2).notNullable();
    table.uuid('wallet_from_id').nullable().references('id').inTable('wallets').onDelete('SET NULL');
    table.uuid('wallet_to_id').notNullable().references('id').inTable('wallets').onDelete('CASCADE');
    table.string('status').notNullable().defaultTo('COMPLETED'); // 'COMPLETED', 'FAILED'
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('transactions');
};
