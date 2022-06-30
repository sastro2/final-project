const roles = [
  {
    role_name: 'administrator',
  },
  {
    role_name: 'user',
  },
];

exports.up = async (sql) => {
  await sql`
    INSERT INTO roles ${sql(roles, 'role_name')}
  `;
};

exports.down = async (sql) => {
  for (const role of roles) {
    await sql`
      DELETE FROM
        roles
      WHERE
        role_name = ${role.role_name}
    `;
  }
};
