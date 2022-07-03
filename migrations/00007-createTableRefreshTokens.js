exports.up = async (sql) => {
  await sql`
  CREATE TABLE refreshTokens (
		id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
		token varchar(90) UNIQUE NOT NULL,
		was_used boolean NOT NULL,
		expiry_timestamp timestamp NOT NULL DEFAULT NOW() + INTERVAL '2 months',
		user_id integer REFERENCES users (id) ON DELETE CASCADE
	);
	`;
};

exports.down = async (sql) => {
  await sql`
    DROP TABLE refreshTokens
  `;
};
