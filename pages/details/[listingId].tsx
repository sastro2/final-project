import { GetServerSidePropsContext } from 'next';
import { oxfordRealEstateData } from '../../util/tempData';

type ListingProps = {
  listingId: string;
};

export default function Listing(props: ListingProps) {
  let listingData: ListingObject;

  console.log(sessionStorage.getItem('listingData'));

  if (sessionStorage.getItem('listingData') !== null) {
    listingData = JSON.parse(sessionStorage.getItem('listingData')!);

    console.log(listingData);

    const foundListing = listingData.listing.find((listing) => {
      return props.listingId === listing.listing_id;
    });

    console.log(foundListing);

    return <h1>{foundListing?.displayable_address}</h1>;
  }
}

export function getServerSideProps(context: GetServerSidePropsContext) {
  const listingId = context.query.listingId;

  return {
    props: {
      listingId: listingId,
    },
  };
}
