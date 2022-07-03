const userSettings = [
  {
    user_id: 1,
    has_2fa: true,
  },
];

exports.up = async (sql) => {
  await sql`
		INSERT INTO userSettings ${sql(userSettings, 'user_id', 'has_2fa')}
	`;
};

exports.down = async (sql) => {
  for (const settings of userSettings) {
    await sql`
			DELETE FROM
				userSettings
			WHERE
				user_id = ${settings.user_id} AND
				has_2fa = ${settings.has_2fa}
		`;
  }
};
