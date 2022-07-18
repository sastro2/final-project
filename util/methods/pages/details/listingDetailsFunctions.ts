import axios from 'axios';
import { Dispatch, SetStateAction } from 'react';

export const fetchPointsOfInterest = async (
  listingId: string | null,
  stateFunc: Dispatch<SetStateAction<any>>,
  poiSetFunc: Dispatch<SetStateAction<boolean>>,
) => {
  if (!listingId) {
    return;
  }

  const options = {
    method: 'GET',
    url: 'https://zoopla.p.rapidapi.com/properties/get-nearby',
    params: { listing_id: listingId },
    headers: {
      'X-RapidAPI-Key': 'a1dc1a29d9msh550f536bda95b23p1b94f7jsn783982c2ea68',
      'X-RapidAPI-Host': 'zoopla.p.rapidapi.com',
    },
  };

  await axios
    .request(options)
    .then(function (response) {
      stateFunc(response.data.points_of_interest);
    })
    .catch(function (error) {
      console.error(error);
    });

  poiSetFunc(false);
};

export const mappedObjects = (object: any) => {
  const tmpArray = Object.entries(object);

  const returnArray = tmpArray.map((entry: any[]) => {
    return entry[1];
  });

  return returnArray;
};
