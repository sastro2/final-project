exports.up = async (sql) => {
  await sql`
  CREATE TABLE csrfSalts (
		id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
		salt varchar(90) UNIQUE NOT NULL
	);
	`;
};

exports.down = async (sql) => {
  await sql`
    DROP TABLE csrfSalts
  `;
};
