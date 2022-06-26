import { GetServerSidePropsContext } from 'next';
import { oxfordRealEstateData } from '../../util/database';

type ListingProps = {
  listing: Listing;
};

export default function Listing(props: ListingProps) {
  return <h1>{props.listing.displayable_address}</h1>;
}

export function getServerSideProps(context: GetServerSidePropsContext) {
  const listingId = context.query.listingId;

  const listing = oxfordRealEstateData.listing.find((object) => {
    return listingId === object.listing_id;
  });

  return {
    props: {
      listing: listing,
    },
  };
}
