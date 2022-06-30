import Link from 'next/link';
import {
  ChangeEvent,
  Dispatch,
  RefObject,
  SetStateAction,
  useRef,
  useState,
} from 'react';

export default function Home() {
  const [searchInput, setSearchInput] = useState<string>('');
  const [bedroomSetting, setBedroomSetting] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  // const [autocompleteResult, setAutocompleteResult] = useState<string[]>([]);

  console.log(process.env.PGHOST);

  const bedroomsRef = useRef<HTMLSelectElement>(null);
  const maxPriceRef = useRef<HTMLSelectElement>(null);

  // const deferredInput: string = useDeferredValue(searchInput);

  // const autocomplete = useMemo(() => {
  //  const options = {
  //  method: 'GET',
  //  url: 'https://zoopla.p.rapidapi.com/auto-complete',
  //  params: {search_term: deferredInput},
  //  headers: {
  //  'X-RapidAPI-Key': 'f43f860297mshbe94faf5bb3d17dp1061e2jsn23b0da03b68e',
  //  'X-RapidAPI-Host': 'zoopla.p.rapidapi.com'
  //  }
  //  };

  //  let data: AutocompleteObject | null = null;

  //  axios.request(options).then(function (response) {
  //  data = response.data;
  //  }).catch(function (error) {
  //  console.error(error);
  // });

  // return data;
  // }, [deferredInput])

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSettingsStateChange = (
    ref: RefObject<any>,
    state: Dispatch<SetStateAction<any>>,
  ) => {
    state(ref.current.value);
  };

  return (
    <>
      <h1>Final project</h1>
      <input onChange={handleSearchInputChange} placeholder="city/town" />
      <Link
        href={{
          pathname: 'http://localhost:3000/map',
          query: {
            search: searchInput,
          },
        }}
      >
        search
      </Link>
      <div>
        <h2>rent</h2>
        <select
          ref={bedroomsRef}
          onChange={() => {
            handleSettingsStateChange(bedroomsRef, setBedroomSetting);
          }}
          placeholder="bedrooms"
        >
          <option value={0}>any</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5+</option>
        </select>
        {/* make this a slider with bootstrap later */}
        <select
          ref={maxPriceRef}
          onChange={() => {
            handleSettingsStateChange(maxPriceRef, setMaxPrice);
          }}
        >
          <option value={500}>500€</option>
          <option value={600}>600</option>
          <option value={700}>700€</option>
          <option value={800}>800€</option>
          <option value={900}>900€</option>
          <option value={1000}>1000€+</option>
        </select>
      </div>
      <div>
        <h2>buy</h2>
      </div>
    </>
  );
}
