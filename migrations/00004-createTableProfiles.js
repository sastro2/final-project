exports.up = async (sql) => {
  await sql`
  CREATE TABLE profiles (
		id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
		profile_type varchar(20) NOT NULL,
		role_id integer REFERENCES roles (id) ON DELETE CASCADE NOT NULL,
		user_ids varchar(10000) NOT NULL
	);
	`;
};

exports.down = async (sql) => {
  await sql`
    DROP TABLE profiles
  `;
};
