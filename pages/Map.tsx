import GoogleMapReact from 'google-map-react';
import { useEffect, useRef, useState } from 'react';
import { oxfordRealEstateData } from '../util/database';

// use this instead of oxfordRealEstateData once fetching from api
// import { filteredListing } from '../util/database';

type PkgBounds = {
  nwLng: number;
  seLat: number;
  seLng: number;
  nwLat: number;
};

type MarkerObject = {
  outcode: string;
  propertyAmount: number;
  averageCost: number;
  coordinates: { lat: number; lng: number };
  listing_ids: string[];
};

const Marker = ({ children }: any) => children;

let markerBounds: any;

export default function Map() {
  const mapRef = useRef<any>();
  const [mapZoom, setMapZoom] = useState(7);
  const [mapBounds, setMapBounds] = useState<PkgBounds>();
  const [mapHasLoaded, setMapHasLoaded] = useState<boolean>(false);
  const [objectsToDisplay, setObjectsToDisplay] = useState<MarkerObject[]>();

  const townCoordinates = {
    lat: oxfordRealEstateData.latitude,
    lng: oxfordRealEstateData.longitude,
  };

  const extendBounds = () => {
    oxfordRealEstateData.listing.forEach((listing) => {
      markerBounds.extend({ lat: listing.latitude, lng: listing.longitude });
    });
  };

  const initializeClusters = () => {
    let clusters = new Set<MarkerObject>();

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
        defaultZoom={20}
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
          markerBounds = mapRef.current.getBounds();
          extendBounds();
          if (!mapHasLoaded) {
            mapRef.current.fitBounds(markerBounds);
          }
          setMapHasLoaded(true);
        }}
      >
        {objectsToDisplay?.map((cluster) => {
          return (
            <Marker
              key={cluster.outcode}
              lat={cluster.coordinates.lat}
              lng={cluster.coordinates.lng}
            >
              <button
                onClick={() => {
                  mapRef.current.setZoom(10);
                }}
              >
                {cluster.averageCost}
              </button>
            </Marker>
          );
        })}
      </GoogleMapReact>
    </div>
  );
}
