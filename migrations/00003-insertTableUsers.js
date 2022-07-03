const users = [
  {
    username: 'Sascha',
    password_hash:
      '$2a$12$KwEYOL1jppbvvMXwY7IBDuzc3DUhYvEOkJj/SV3LMhHQOpzH.q3Wq',
    twofa_secret:
      'OSgJM5KvS2fDWvabRPInavuGsJ26cD5qPoK5XD7Nk8m/fP4BHmTkRelVKhqvZG8iZx9rt+eg7ZgR3InVqkJBAg==',
    twofa_unix_t0: 1656709356,
  },
];

exports.up = async (sql) => {
  await sql`
    INSERT INTO users ${sql(
      users,
      'username',
      'password_hash',
      'twofa_secret',
      'twofa_unix_t0',
    )}
  `;
};

exports.down = async (sql) => {
  for (const user of users) {
    await sql`
      DELETE FROM
        users
      WHERE
        username = ${user.username} AND
				password_hash = ${user.password_hash}
    `;
  }
};
