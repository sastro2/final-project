exports.up = async (sql) => {
  await sql`
		CREATE TABLE userSettings (
			user_id integer REFERENCES users (id) ON DELETE CASCADE UNIQUE,
			has_2fa boolean NOT NULL,
			twofa_timeout_until integer
		)
	`;
};

exports.down = async (sql) => {
  await sql`
		DROP TABLE userSettings
	`;
};
