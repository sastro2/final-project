import camelcaseKeys from 'camelcase-keys';
import { config } from 'dotenv-safe';
import postgres from 'postgres';

config();

// for heroku const sql = postgres({ ssl: { rejectUnauthorized: false } });
const sql = postgres({ ssl: { rejectUnauthorized: false } });

export let filteredListings: ListingObject | null;

export const setFilteredListing = (listing: ListingObject | null) => {
  filteredListings = listing;
};

export async function createUser(
  username: string,
  passwordHash: string,
  twoFaSecret: string,
) {
  const [user] = await sql<[User]>`
    INSERT INTO users
      (username, password_hash, twofa_secret)
    VALUES
      (${username}, ${passwordHash}, ${twoFaSecret})
    RETURNING
      id,
      username
      twofa_secret
  `;
  return camelcaseKeys(user);
}

export async function getUserByUsername(username: string) {
  const [user] = await sql<[{ id: number } | undefined]>`
    SELECT
      id
    FROM
      users
    WHERE
      username = ${username}
  `;
  return user && camelcaseKeys(user);
}

export async function updateUserInformationById(
  id: number,
  firstName: string,
  lastName: string,
  email: string,
) {
  let setFirstName = null;
  let setLastName = null;
  let setEmail = null;

  if (firstName) {
    setFirstName = firstName;
  }

  if (lastName) {
    setLastName = lastName;
  }

  if (email) {
    setEmail = email;
  }

  await sql`
    UPDATE
      users
    SET
      first_name = ${setFirstName},
      last_name = ${setLastName},
      email = ${setEmail}
    WHERE
      id = ${id}
  `;
}

export async function getUserWithPasswordHashByUsername(username: string) {
  const [user] = await sql<[UserWithPasswordHash | undefined]>`
    SELECT
      *
    FROM
      users
    WHERE
      username = ${username};
  `;

  return user && camelcaseKeys(user);
}

export async function getUserWith2FaSecretById(userId: number) {
  const [user] = await sql<[User]>`
    SELECT
      id,
      username,
      twofa_secret,
      twofa_unix_t0,
      first_name,
      last_name,
      email
    FROM
      users
    WHERE
      id = ${userId}
  `;

  return camelcaseKeys(user);
}

export async function get2faDataByUserId(userId: number) {
  const [data] = await sql<[TwoFaData | undefined]>`
    SELECT
      twofa_secret,
      twofa_unix_t0
    FROM
      users
    WHERE
      id = ${userId}
   `;

  return data && camelcaseKeys(data);
}

export async function createProfileForUser(
  profileType: string,
  roleId: number,
  userIds: string,
) {
  const [profile] = await sql<[Profile]>`
    INSERT INTO profiles
      (profile_type, role_id, user_ids)
    VALUES
      (${profileType}, ${roleId}, ${userIds})
    RETURNING
      id,
      profile_type,
      role_id,
      user_ids
  `;

  return camelcaseKeys(profile);
}

export async function createSettingsForUser(userId: number) {
  const [settings] = await sql<[Settings]>`
    INSERT INTO userSettings
      (user_id, has_2fa)
    VALUES
      (${userId}, false)
    RETURNING
      user_id,
      has_2fa,
      twofa_timeout_until
  `;
  return camelcaseKeys(settings);
}

export async function getSettingsForUserById(id: number) {
  const [settings] = await sql<[Settings]>`
    SELECT
      *
    FROM
      userSettings
    WHERE
      user_id =${id}
  `;

  return camelcaseKeys(settings);
}

export async function getSearchParamsForUserById(id: number, toRent: boolean) {
  if (!toRent) {
    const [params] = await sql<[{ rentSearchParameters: string } | undefined]>`
    SELECT
      buy_search_parameters
    FROM
      users
    WHERE
      id = ${id}
  `;

    return params && camelcaseKeys(params);
  }

  const [params] = await sql<[{ buySearchParameters: string } | undefined]>`
    SELECT
      rent_search_parameters
    FROM
      users
    WHERE
      id = ${id}
  `;

  return params && camelcaseKeys(params);
}

export async function setSearchParamsForUserById(
  id: number,
  searchParams: string,
  toRent: boolean,
) {
  if (!toRent) {
    await sql`
      UPDATE
        users
      SET
        buy_search_parameters = ${searchParams}
      WHERE
        id = ${id}
    `;
  }

  await sql`
      UPDATE
        users
      SET
        rent_search_parameters = ${searchParams}
      WHERE
        id = ${id}
    `;
}

export async function createAccessToken(token: string, userId: number) {
  const [accessToken] = await sql<[AccessToken]>`
    INSERT INTO accessTokens
      (token, user_id)
    VALUES
      (${token}, ${userId})
    RETURNING
      id,
      token
  `;

  await deleteExpiredAccessTokens();

  return camelcaseKeys(accessToken);
}

export async function createRefreshToken(token: string, userId: number) {
  const [refreshToken] = await sql<[AccessToken]>`
    INSERT INTO refreshTokens
      (token, was_used, user_id)
    VALUES
      (${token}, false, ${userId})
    RETURNING
      id,
      token
  `;

  await deleteExpiredAccessTokens();

  return camelcaseKeys(refreshToken);
}

export async function getUserIdByAccessToken(token: string) {
  await deleteExpiredAccessTokens();

  const [id] = await sql<[{ userId: number } | undefined]>`
    SELECT
      user_id
    FROM
      accessTokens
    WHERE
      token = ${token}
  `;

  return id && camelcaseKeys(id);
}

export async function getRefreshToken(token: string) {
  const [rT] = await sql<[RefreshToken | undefined]>`
    SELECT
      id,
      token,
      was_used,
      user_id
    FROM
      refreshTokens
    WHERE
      token = ${token}
  `;

  return rT && camelcaseKeys(rT);
}

export async function setRefreshTokenToUsed(token: string) {
  await sql`
    UPDATE refreshTokens
    SET
      was_used = true
    WHERE
      token = ${token}
  `;
}

export async function getUserIdByRefreshToken(token: string) {
  const [id] = await sql<[{ userId: number } | undefined]>`
    SELECT
      user_id
    FROM
      refreshTokens
    WHERE
      token = ${token}
  `;

  return id && camelcaseKeys(id);
}

export async function killAllRefreshTokensForUserById(id: number) {
  await sql`
    DELETE FROM
      refreshTokens
    WHERE
      user_id = ${id}
  `;
}

export async function deleteExpiredAccessTokens() {
  const sessions = await sql<AccessToken[]>`
    DELETE FROM
      accessTokens
    WHERE
      expiry_timestamp < NOW()
    RETURNING *
  `;

  return sessions.map((session) => camelcaseKeys(session));
}

export async function createCsrfSalt(salt: string) {
  const [csrfSalt] = await sql<[CsrfSalt]>`
    INSERT INTO csrfSalts
      (salt)
    VALUES
      (${salt})
    RETURNING
      id,
      salt
  `;

  return camelcaseKeys(csrfSalt);
}

export async function getCsrfSalt(id: number) {
  const [csrfSalt] = await sql<[CsrfSalt]>`
    SELECT
      id,
    	salt
    FROM
      csrfSalts
    WHERE
      id = ${id}
  `;

  return camelcaseKeys(csrfSalt);
}

export async function getIs2faEnabledById(id: number) {
  const [isEnabled] = await sql<[TwoFaEnabled]>`
    SELECT
      user_id,
      has_2fa,
      twofa_timeout_until
    FROM
      userSettings
    WHERE
      user_id = ${id}
  `;

  return camelcaseKeys(isEnabled);
}

export async function set2FaTimeoutForUserById(id: number, unixTime: number) {
  await sql`
    UPDATE
      userSettings
    SET
      twofa_timeout_until = ${unixTime}
    WHERE
      user_id = ${id}
  `;
}

export async function toggle2FaSettingForUser(id: number, set2FaTo: boolean) {
  await sql`
    UPDATE
      userSettings
    SET
      has_2fa = ${set2FaTo}
    WHERE
      user_id = ${id}
  `;
}

export async function set2FaUnixT0ForUser(id: number, unixTime: number) {
  await sql`
    UPDATE
      users
    SET
      twofa_unix_t0 = ${unixTime}
    WHERE
      id = ${id}
  `;
}
