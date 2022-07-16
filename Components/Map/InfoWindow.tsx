import { useRouter } from 'next/router';
import { MapProps, MarkerObject } from '../../pages/map';
import { setParameters } from '../../util/methods/pages/utils/searchParameters/setParameters';

type InfoWindowProps = {
  mapProps: MapProps;
  listing_id: string;
  listings: ListingObject;
  keyCheck: string;
  propertyData: ListingObject | null;
  mapObject: MarkerObject;
};

export default function InfoWindow(props: InfoWindowProps) {
  const infoWindowStyle = {
    bottom: 150,
    left: '-45px',
    width: 220,
    backgroundColor: 'white',
    boxShadow: '0 2px 7px 1px rgba(0, 0, 0, 0.3)',
    padding: 10,
    fontSize: 14,
    zIndex: 100,
  };

  const router = useRouter();

  const property = props.listings.listing.find((listing) => {
    return listing.listing_id === props.listing_id;
  });

  if (props.listing_id !== props.keyCheck) {
    return null;
  }

  if (property) {
    return (
      <div style={infoWindowStyle}>
        <div style={{ fontSize: 16 }}>{property.title}</div>
        <div style={{ fontSize: 14 }}>
          <span style={{ color: 'lightgrey' }}>{property.street_name}</span>
        </div>
        <div style={{ fontSize: 14, color: 'grey' }}>{property.status}</div>
        <button
          onClick={async () => {
            sessionStorage.setItem(
              'listingData',
              JSON.stringify(props.propertyData),
            );
            console.log(
              props.mapProps.loggedIn,
              props.mapProps.userId,
              props.propertyData,
              props.mapProps.buySearchParams,
              props.mapProps.rentSearchParams,
            );
            if (
              props.mapProps.loggedIn &&
              props.mapProps.userId &&
              props.propertyData
            ) {
              const listing = props.propertyData.listing.find((property) => {
                return props.mapObject.listing_id === property.listing_id;
              });

              if (listing && listing.listing_status === 'rent') {
                console.log('rent');

                await setParameters(
                  props.mapProps.userId,
                  props.mapProps.rentSearchParams,
                  listing.rental_prices.per_month,
                  listing.num_bedrooms,
                  true,
                );
              }
              if (listing && listing.listing_status === 'sale') {
                await setParameters(
                  props.mapProps.userId,
                  props.mapProps.buySearchParams,
                  parseInt(listing.price),
                  listing.num_bedrooms,
                  false,
                );
              }
            }
            await router.push({
              pathname: `http://localhost:3000/details/${props.mapObject.listing_id}`,
            });
          }}
        >
          {props.mapObject.cost}
        </button>
      </div>
    );
  }

  return (
    <div style={infoWindowStyle}>
      <p>Property not found</p>
    </div>
  );
}
