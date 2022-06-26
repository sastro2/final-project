import GoogleMapReact from 'google-map-react';
import { useEffect, useRef, useState } from 'react';
import { oxfordRealEstateData } from '../util/database';

type PkgBounds = {
  nwLng: number;
  seLat: number;
  seLng: number;
  nwLat: number;
};

type ClusterObject = {
  outcode: string;
  propertyAmount: number;
  averageCost: number;
  coordinates: { lat: number; lng: number };
  listing_ids: string[];
};

type MarkerObject = {
  cost: number;
  coordinates: { lat: number; lng: number };
  listing_id: string;
};

const Marker = ({ children }: any) => children;

let markerBounds: any;

export default function Map() {
  const mapRef = useRef<any>();
  const [mapZoom, setMapZoom] = useState(7);
  const [mapBounds, setMapBounds] = useState<PkgBounds>();
  const [mapHasLoaded, setMapHasLoaded] = useState<boolean>(false);
  const [objectsToDisplay, setObjectsToDisplay] = useState<
    MarkerObject[] | ClusterObject[] | null
  >(null);

  /* const router = useRouter();

  change data recieved by router to value and identifier recieved by autocomplete once fetching from autocomplete

  useEffect(() => {
    const options = {
      method: 'GET',
      url: 'https://zoopla.p.rapidapi.com/properties/list',
      params: {
        area: router.query.search,
        identifier: 'oxford',
        category: 'residential',
        order_by: 'age',
        ordering: 'descending',
        page_number: '1',
        page_size: '40',
      },
      headers: {
        'X-RapidAPI-Key': 'f43f860297mshbe94faf5bb3d17dp1061e2jsn23b0da03b68e',
        'X-RapidAPI-Host': 'zoopla.p.rapidapi.com',
      },
    };

    let data: ListingObject | null = null;

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        data = response.data;
      })
      .catch(function (error) {
        console.error(error);
      });
  }, [router.query]); */

  const townCoordinates = {
    lat: oxfordRealEstateData.latitude,
    lng: oxfordRealEstateData.longitude,
  };

  const extendBounds = (markers: MarkerObject[] | ListingObject) => {
    if (Array.isArray(markers)) {
      markers.forEach((marker) => {
        markerBounds.extend({
          lat: marker.coordinates.lat,
          lng: marker.coordinates.lng,
        });
      });
    } else {
      markers.listing.forEach((listing) => {
        markerBounds.extend({
          lat: listing.latitude,
          lng: listing.longitude,
        });
      });
    }
  };

  const checkIfMarkerObjects = (
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

  const convertClusterToMarkers = (cluster: ClusterObject) => {
    const markers: MarkerObject[] = [];

    cluster.listing_ids.forEach((id) => {
      const currentListing: Listing[] = oxfordRealEstateData.listing.filter(
        (listing) => {
          return id === listing.listing_id;
        },
      );

      const tmpMarker: MarkerObject = {
        cost: currentListing[0].rental_prices.per_month,
        coordinates: {
          lat: currentListing[0].latitude,
          lng: currentListing[0].longitude,
        },
        listing_id: currentListing[0].listing_id,
      };

      markers.push(tmpMarker);
    });

    return markers;
  };

  const changeObjectsToDisplay = (markers: MarkerObject[]) => {
    setObjectsToDisplay(markers);
  };

  const initializeClusters = () => {
    let clusters = new Set<ClusterObject>();

    oxfordRealEstateData.listing.forEach((listing) => {
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
                listing.rental_prices.per_month) /
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
          averageCost: listing.rental_prices.per_month,
          coordinates: { lat: listing.latitude, lng: listing.longitude },
          listing_ids: [listing.listing_id],
        });
      }
    });

    setObjectsToDisplay([...clusters]);
  };

  useEffect(() => {
    if (checkIfMarkerObjects(objectsToDisplay)) {
      extendBounds(objectsToDisplay as MarkerObject[]);
      mapRef.current.fitBounds(markerBounds);
    }
  }, [objectsToDisplay]);

  useEffect(() => {
    initializeClusters();
  }, []);

  return (
    <div style={{ height: '90vh', width: 'auto' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: 'AIzaSyBTg924Z_lgqKWI3ZulRU6YgRUEDdmeclQ' }}
        defaultCenter={{
          lat: townCoordinates.lat,
          lng: townCoordinates.lng,
        }}
        defaultZoom={17}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map }) => {
          mapRef.current = map;
        }}
        onChange={({ zoom, bounds }) => {
          setMapZoom(zoom);
          setMapBounds({
            nwLng: bounds.nw.lng,
            seLat: bounds.se.lat,
            seLng: bounds.se.lng,
            nwLat: bounds.nw.lat,
          });
        }}
        onTilesLoaded={() => {
          if (!mapHasLoaded) {
            markerBounds = mapRef.current.getBounds();
            extendBounds(oxfordRealEstateData);
            mapRef.current.fitBounds(markerBounds);
            setMapHasLoaded(true);
          }
        }}
      >
        {objectsToDisplay?.map((mapObject) => {
          if ('listing_id' in mapObject) {
            return (
              <Marker
                key={mapObject.listing_id}
                lat={mapObject.coordinates.lat}
                lng={mapObject.coordinates.lng}
              >
                <button
                  onClick={() => {
                    window.location.href = `http://localhost:3000/details/${mapObject.listing_id}`;
                  }}
                >
                  {mapObject.cost}
                </button>
              </Marker>
            );
          }

          return (
            <Marker
              key={mapObject.outcode}
              lat={mapObject.coordinates.lat}
              lng={mapObject.coordinates.lng}
            >
              <button
                onClick={() => {
                  changeObjectsToDisplay(convertClusterToMarkers(mapObject));
                  mapRef.current.setCenter(mapObject.coordinates);
                  mapRef.current.setZoom(17);
                  markerBounds = mapRef.current.getBounds();
                }}
              >
                {mapObject.averageCost}
              </button>
            </Marker>
          );
        })}
      </GoogleMapReact>
    </div>
  );
}
