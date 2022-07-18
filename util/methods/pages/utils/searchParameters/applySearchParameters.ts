const calculateRoomsWeight = (
  averageRooms: number,
  listing: Listing,
): number => {
  let difference = averageRooms - +listing.num_bedrooms;

  console.log(difference, averageRooms, +listing.num_bedrooms);

  switch (true) {
    case (difference <= 0 && difference > -1) ||
      (difference >= 0 && difference < 1): {
      difference = 1;
      break;
    }
    case difference <= -1: {
      difference *= -1;
      break;
    }
  }

  const weight = 1 / difference;

  console.log(
    averageRooms,
    listing.num_bedrooms,
    typeof listing.num_bedrooms,
    weight,
  );

  return weight;
};

const calculatePriceWeight = (
  averagePrice: number,
  listing: Listing,
): number => {
  let difference = (averagePrice - parseInt(listing.price)) / 100;

  if (difference < 1) {
    difference = 1;
  }

  const priceDelta = Math.sqrt(difference ^ 2);

  const weight = 1 / priceDelta;

  console.log(weight);
  return weight;
};
const calculateRentWeight = (
  averageRent: number,
  listing: Listing,
  toRent: boolean,
): number => {
  let difference = toRent
    ? (averageRent - listing.rental_prices.per_month) / 200
    : (averageRent - +listing.price) / 100000;

  if (difference < 1) {
    difference = 1;
  }

  let rentDelta = Math.sqrt(difference ^ 2);

  if (rentDelta === 0) {
    rentDelta = 2;
  }

  const weight = 1 / rentDelta;

  return weight;
};

const calculateRandomFactor = (listingId: string): number => {
  const listingIdAsStringArray = listingId.split('');
  const digit = parseInt(
    listingIdAsStringArray[listingIdAsStringArray.length - 1],
  );

  console.log(digit);

  return 1 - digit / 100;
};

export const applySearchParameters = (
  data: ListingObject,
  searchParams: string,
  toRent: boolean,
): ListingObject | null => {
  let weightedListing: { listingId: string; weight: number }[] | null = null;

  console.log('hi');

  if (toRent) {
    console.log(searchParams);

    const parsedParams: RentParameters[] | null = JSON.parse(searchParams);
    if (parsedParams) {
      const calculatedTotalParams = parsedParams.reduce(
        (accumulator, currentParam) => {
          console.log(
            accumulator.rent,
            typeof accumulator.rent,
            currentParam.averageRent,
            typeof currentParam.averageRent,
            'acc and current',
          );

          return {
            rent: accumulator.rent + currentParam.averageRent,
            rooms: accumulator.rooms + +currentParam.averageRooms,
          };
        },
        { rent: 0, rooms: 0 },
      );
      const averageParams = {
        averageRent: calculatedTotalParams.rent / parsedParams.length,
        averageRooms: calculatedTotalParams.rooms / parsedParams.length,
      };

      console.log(averageParams);

      weightedListing = data.listing.map((listing) => {
        console.log(
          calculateRoomsWeight(averageParams.averageRooms, listing),
          calculateRentWeight(averageParams.averageRent, listing),
          calculateRandomFactor(listing.listing_id),
        );

        const weight =
          1 *
          calculateRoomsWeight(averageParams.averageRooms, listing) *
          calculateRentWeight(averageParams.averageRent, listing) *
          calculateRandomFactor(listing.listing_id);

        return {
          listingId: listing.listing_id,
          weight: weight,
        };
      });
    }
  } else {
    const parsedParams: SaleParameters[] | null = JSON.parse(searchParams);
    if (parsedParams) {
      const calculatedTotalParams = parsedParams.reduce(
        (accumulator, currentParam) => {
          return {
            salePrice: accumulator.salePrice + currentParam.averageSalePrice,
            rooms: accumulator.rooms + +currentParam.averageRooms,
          };
        },
        { salePrice: 0, rooms: 0 },
      );
      const averageParams = {
        averageSalePrice: calculatedTotalParams.salePrice / parsedParams.length,
        averageRooms: calculatedTotalParams.rooms / parsedParams.length,
      };

      weightedListing = data.listing.map((listing) => {
        const weight =
          1 *
          calculateRoomsWeight(averageParams.averageRooms, listing) *
          calculatePriceWeight(averageParams.averageSalePrice, listing) *
          calculateRandomFactor(listing.listing_id);

        return {
          listingId: listing.listing_id,
          weight: weight,
        };
      });
    }
  }

  console.log(weightedListing);

  const sortArray = (
    a: { listingId: string; weight: number },
    b: { listingId: string; weight: number },
  ) => {
    if (a.weight < b.weight) {
      return -1;
    }
    if (a.weight > b.weight) {
      return 1;
    }
    return 0;
  };

  if (weightedListing) {
    const sortedList = weightedListing.sort(sortArray).reverse();

    const newListing = sortedList.map((item) => {
      return data.listing.find((listing) => {
        return item.listingId === listing.listing_id;
      });
    });

    const isListing = (listing: Listing | undefined): listing is Listing => {
      return !!listing;
    };

    const finalListing = newListing.filter(isListing);

    const newListingObject = data;
    newListingObject.listing = finalListing;

    return newListingObject;
  }

  return null;
};
