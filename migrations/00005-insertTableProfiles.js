const profiles = [
  {
    profile_type: 'administrator',
    role_id: 1,
    user_ids: '1',
  },
];

exports.up = async (sql) => {
  await sql`
    INSERT INTO profiles ${sql(profiles, 'profile_type', 'role_id', 'user_ids')}
  `;
};

exports.down = async (sql) => {
  for (const profile of profiles) {
    await sql`
      DELETE FROM
        profiles
      WHERE
        profile_type = ${profile.profile_type} AND
				role_id = ${profile.role_id} AND
				user_ids = ${profile.user_ids}
    `;
  }
};
