import { NextRouter } from 'next/router';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { ClusterObject, MarkerObject } from '../../../pages/map';

export const extendBounds = (
  markers: MarkerObject[] | ListingObject,
  markerBounds: any,
) => {
  console.log(markers, markerBounds, 'here');
  if (Array.isArray(markers)) {
    markers.forEach((marker) => {
      markerBounds.extend({
        lat: marker.coordinates.lat,
        lng: marker.coordinates.lng,
      });
    });
  } else {
    console.log(markers, markerBounds, 'right here');

    markers.listing.forEach((listing) => {
      markerBounds.extend({
        lat: listing.latitude,
        lng: listing.longitude,
      });
    });

    console.log(markerBounds);
  }
};

export const convertClusterToMarkers = (
  router: NextRouter,
  cluster: ClusterObject,
  propertyData: ListingObject | null,
) => {
  if (propertyData !== null) {
    const markers: MarkerObject[] = [];

    cluster.listing_ids.forEach((id) => {
      const currentListing: Listing[] = propertyData.listing.filter(
        (listing) => {
          return id === listing.listing_id;
        },
      );

      const tmpMarker: MarkerObject = {
        cost:
          router.query.toRent === '0'
            ? currentListing[0].rental_prices.per_month
            : parseInt(currentListing[0].price),
        coordinates: {
          lat: currentListing[0].latitude,
          lng: currentListing[0].longitude,
        },
        listing_id: currentListing[0].listing_id,
      };

      markers.push(tmpMarker);
    });

    return markers;
  }
};

export const checkIfMarkerObjects = (
  objects: MarkerObject[] | ClusterObject[] | null,
) => {
  if (objects === null) {
    return false;
  }

  let result = true;

  for (let i = 0; i < objects.length; i++) {
    if (!('listing_id' in objects[i])) {
      result = false;
      break;
    }
  }

  return result;
};

export const initializeClusters = (
  router: NextRouter,
  propertyData: ListingObject | null,
  stateFunc: Dispatch<SetStateAction<MarkerObject[] | ClusterObject[] | null>>,
) => {
  if (propertyData) {
    let clusters = new Set<ClusterObject>();

    propertyData.listing.forEach((listing) => {
      if (
        [...clusters].filter((obj) => {
          return obj.outcode === listing.outcode;
        }).length > 0
      ) {
        const tmpArray = [...clusters].map((obj) => {
          if (obj.outcode === listing.outcode) {
            const tmpObj = Object.assign({}, obj);

            tmpObj.propertyAmount += 1;
            tmpObj.averageCost =
              (obj.averageCost * obj.propertyAmount +
                (router.query.toRent === '0'
                  ? listing.rental_prices.per_month
                  : parseInt(listing.price))) /
              tmpObj.propertyAmount;
            tmpObj.coordinates = {
              lat:
                (obj.coordinates.lat * obj.propertyAmount + listing.latitude) /
                tmpObj.propertyAmount,
              lng:
                (obj.coordinates.lng * obj.propertyAmount + listing.longitude) /
                tmpObj.propertyAmount,
            };
            tmpObj.listing_ids = [...obj.listing_ids, listing.listing_id];

            return tmpObj;
          }

          return obj;
        });

        const tmpSet = new Set(tmpArray);

        clusters = tmpSet;
      } else {
        clusters.add({
          outcode: listing.outcode,
          propertyAmount: 1,
          averageCost:
            router.query.toRent === '0'
              ? listing.rental_prices.per_month
              : parseInt(listing.price),
          coordinates: { lat: listing.latitude, lng: listing.longitude },
          listing_ids: [listing.listing_id],
        });
      }
    });

    stateFunc([...clusters]);
  }
};

export const changeObjectsToDisplay = (
  markers: MarkerObject[],
  stateFunc: Dispatch<SetStateAction<MarkerObject[] | ClusterObject[] | null>>,
) => {
  stateFunc(markers);
};
