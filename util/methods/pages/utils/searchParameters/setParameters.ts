export const setParameters = async (
  userId: number,
  params: string | null,
  amount: number,
  beds: number,
  toRent: boolean,
) => {
  const parsedParams: SearchParameters[] = params ? JSON.parse(params) : [];

  let newObject: SearchParameters;

  if (toRent) {
    newObject = {
      averageRent: amount,
      averageRooms: beds,
    };
  } else {
    newObject = {
      averageSalePrice: amount,
      averageRooms: beds,
    };
  }

  const newParams: SearchParameters[] = parsedParams;

  if (parsedParams.length >= 100) {
    newParams.slice(1);
    newParams.push(newObject);
  } else {
    newParams.push(newObject);
  }

  const newParamsString = JSON.stringify(newParams);

  await fetch('https://home-scout.herokuapp.com/api/userData/setParameters', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: userId,
      params: newParamsString,
      toRent: toRent,
    }),
  });
};
