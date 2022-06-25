import Link from 'next/link';
import { oxfordRealEstateData, setFilteredListing } from '../util/database';

export default function Home() {
  return (
    <>
      <h1>Final project</h1>
      <Link
        href="http://localhost:3000/Map"
        onClick={() => setFilteredListing(oxfordRealEstateData)}
      >
        search
      </Link>
      <p>filters</p>
    </>
  );
}
