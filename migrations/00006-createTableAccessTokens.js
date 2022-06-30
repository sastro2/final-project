exports.up = async (sql) => {
  await sql`
  CREATE TABLE accessTokens (
		id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
		token varchar(90) UNIQUE NOT NULL,
    expiry_timestamp timestamp NOT NULL DEFAULT NOW() + INTERVAL '30 seconds',
		user_id integer REFERENCES users (id) ON DELETE CASCADE
	);
	`;
};

exports.down = async (sql) => {
  await sql`
    DROP TABLE accessTokens
  `;
};
