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
      'X-RapidAPI-Key': 'a74f961ba7msh62ea9a4969454c6p1dd9a4jsncd6b433b6c2e',
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
