import { MenuItem } from '@material-ui/core';
import BathtubIcon from '@mui/icons-material/Bathtub';
import BedIcon from '@mui/icons-material/Bed';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import { Button, Grid, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import axios from 'axios';
import Cookies from 'cookies';
import { config } from 'dotenv-safe';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Header from '../Components/Layout/Header';
import PropertyImageCarousel, {
  CarouselImage,
} from '../Components/Property/Carousel';
import AutocompleteInputBox from '../Components/util/AutocompleteInput';
import LoadingScreen from '../Components/util/LoadingScreen';
import { RefreshAccessResponseBody } from '../pages/api/auth/refreshAccess';
import { generateCsrfToken } from '../util/auth';
import {
  getSearchParamsForUserById,
  getUserIdByAccessToken,
  getUserIdByRefreshToken,
  getUserWith2FaSecretById,
} from '../util/database';
import { applySearchParameters } from '../util/methods/pages/utils/searchParameters/applySearchParameters';
import { setParameters } from '../util/methods/pages/utils/searchParameters/setParameters';

type PropertyListProps = {
  loggedIn: boolean;
  reusedRefreshToken?: boolean;
  userId?: number;
  user?: User;
  rentSearchParams: string | null;
  buySearchParams: string | null;
  rapidApiKey: string | undefined;
};

export default function PropertyList(props: PropertyListProps) {
  const [objectsToDisplay, setObjectsToDisplay] = useState<Listing[]>();
  const [searchInput, setSearchInput] = useState<string>('');
  const [bedroomSetting, setBedroomSetting] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [propertyData, setPropertyData] = useState<ListingObject | null>();
  const [autocompleteResult, setAutocompleteResult] = useState<
    AutocompleteSuggestion[]
  >([]);
  const [searchArea, setSearchArea] = useState<AutocompleteSuggestion | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const router = useRouter();

  const fetchData = useCallback(
    async (
      identifier: string | string[] | undefined,
      area: string | string[] | undefined,
      beds: string | string[] | undefined,
      price: string | string[] | undefined,
    ) => {
      if (!props.rapidApiKey) {
        return;
      }

      setLoading(true);

      const toRent = router.query.toRent === '0' ? 'rent' : 'sale';

      let options;
      if (beds !== '0') {
        if (price !== '0') {
          options = {
            method: 'GET',
            url: 'https://zoopla.p.rapidapi.com/properties/list',
            params: {
              area: area,
              identifier: identifier,
              category: 'residential',
              listing_status: toRent,
              maximum_beds: beds,
              minimum_beds: beds,
              maximum_price: price,
              order_by: 'age',
              ordering: 'descending',
              page_number: currentPage.toString(),
              page_size: '15',
            },
            headers: {
              'X-RapidAPI-Key': props.rapidApiKey,
              'X-RapidAPI-Host': 'zoopla.p.rapidapi.com',
            },
          };
        } else {
          options = {
            method: 'GET',
            url: 'https://zoopla.p.rapidapi.com/properties/list',
            params: {
              area: area,
              identifier: identifier,
              category: 'residential',
              listing_status: toRent,
              maximum_beds: beds,
              minimum_beds: beds,
              order_by: 'age',
              ordering: 'descending',
              page_number: currentPage.toString(),
              page_size: '15',
            },
            headers: {
              'X-RapidAPI-Key': props.rapidApiKey,
              'X-RapidAPI-Host': 'zoopla.p.rapidapi.com',
            },
          };
        }
      } else {
        console.log('here', area, identifier);

        options = {
          method: 'GET',
          url: 'https://zoopla.p.rapidapi.com/properties/list',
          params: {
            area: area,
            identifier: identifier,
            category: 'residential',
            listing_status: toRent,
            order_by: 'age',
            ordering: 'descending',
            page_number: currentPage.toString(),
            page_size: '15',
          },
          headers: {
            'X-RapidAPI-Key': props.rapidApiKey,
            'X-RapidAPI-Host': 'zoopla.p.rapidapi.com',
          },
        };
      }

      let data: ListingObject | null = null;

      await axios
        .request(options)
        .then(function (response) {
          console.log(response.data, props.loggedIn);
          if (
            props.loggedIn &&
            (props.rentSearchParams || props.buySearchParams)
          ) {
            const searchParams = props.rentSearchParams
              ? props.rentSearchParams
              : props.buySearchParams
              ? props.buySearchParams
              : null;

            console.log(searchParams);

            if (searchParams) {
              const transformedData = applySearchParameters(
                response.data,
                searchParams,
                true,
              );
              if (transformedData) {
                data = transformedData;
              } else {
                data = response.data;
              }
            } else {
              data = response.data;
            }
          } else {
            data = response.data;
          }
        })
        .catch(function (error) {
          console.error(error);
        });

      console.log(data);

      setPropertyData(data);
      setLoading(false);
    },
    [
      props.loggedIn,
      props.buySearchParams,
      props.rentSearchParams,
      currentPage,
      router.query.toRent,
      props.rapidApiKey
    ],
  );

  useEffect(() => {
    console.log('useEffect');

    fetchData(
      router.query.identifier,
      router.query.value,
      router.query.beds,
      router.query.price,
    ).catch(console.error);
  }, [
    fetchData,
    router.query.identifier,
    router.query.value,
    router.query.beds,
    router.query.price,
    currentPage,
  ]);

  useEffect(() => {
    if (propertyData?.listing) {
      setObjectsToDisplay(propertyData.listing);
    }
  }, [propertyData?.listing]);

  const deferredInput: string = useDeferredValue(searchInput);

  const autocomplete = useMemo(() => {
    if(!props.rapidApiKey){
      return;
    }

    const options = {
      method: 'GET',
      url: 'https://zoopla.p.rapidapi.com/auto-complete',
      params: { search_term: deferredInput },
      headers: {
        'X-RapidAPI-Key': props.rapidApiKey,
        'X-RapidAPI-Host': 'zoopla.p.rapidapi.com',
      },
    };

    let data: AutocompleteObject | undefined;

    axios
      .request(options)
      .then(function (response) {
        data = response.data as AutocompleteObject;

        if (response.data) {
          setAutocompleteResult(data.suggestions);
        }
        return data;
      })
      .catch(function (error) {
        console.error(error);
        return null;
      });
  }, [deferredInput, props.rapidApiKey]);

  console.log(autocomplete);

  if (props.reusedRefreshToken) {
    return <h1>Token reuse detected please relog</h1>;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (objectsToDisplay) {
    console.log(autocompleteResult);

    return (
      <>
        <Header loggedIn={props.loggedIn} user={props.user} />
        <div style={{ display: 'flex' }}>
          <div
            style={{
              top: '2%',
              padding: '2%',
            }}
          >
            <Grid
              container
              rowSpacing="5%"
              position="sticky"
              top="2%"
              width="250px"
            >
              <Grid item xs={12}>
                <AutocompleteInputBox
                  id="Property"
                  options={autocompleteResult}
                  setOptions={setAutocompleteResult}
                  value={searchArea}
                  setValue={setSearchArea}
                  setInputValue={setSearchInput}
                  placeholder={router.query.value as string}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl>
                  <InputLabel id="bedrooms-setting-select-label">
                    Beds
                  </InputLabel>
                  <Select
                    labelId="bedrooms-setting-select-label"
                    label="Beds"
                    placeholder="Beds"
                    value={bedroomSetting}
                    onChange={(event) => {
                      setBedroomSetting(+event.target.value);
                    }}
                  >
                    <MenuItem value={0}>any</MenuItem>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                    <MenuItem value={4}>4</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={6}>6</MenuItem>
                    <MenuItem value={7}>7</MenuItem>
                    <MenuItem value={8}>8</MenuItem>
                    <MenuItem value={9}>9</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                  </Select>
                </FormControl>
                {router.query.toRent === '1' ? (
                  <FormControl>
                    <InputLabel id="price-setting-select-label">
                      Price
                    </InputLabel>
                    <Select
                      labelId="price-setting-select-label"
                      label="Price"
                      placeholder="Price"
                      value={maxPrice}
                      onChange={(event) => {
                        setMaxPrice(+event.target.value);
                      }}
                      style={{ width: '150px' }}
                    >
                      <MenuItem value={0}>any</MenuItem>
                      <MenuItem value={10000}>10.000£</MenuItem>
                      <MenuItem value={20000}>20.000£</MenuItem>
                      <MenuItem value={30000}>30.000£</MenuItem>
                      <MenuItem value={40000}>40.000£</MenuItem>
                      <MenuItem value={50000}>50.000£</MenuItem>
                      <MenuItem value={60000}>60.000£</MenuItem>
                      <MenuItem value={70000}>70.000£</MenuItem>
                      <MenuItem value={80000}>80.000£</MenuItem>
                      <MenuItem value={90000}>90.000£</MenuItem>
                      <MenuItem value={100000}>100.000£</MenuItem>
                      <MenuItem value={110000}>110.000£</MenuItem>
                      <MenuItem value={120000}>120.000£</MenuItem>
                      <MenuItem value={130000}>130.000£</MenuItem>
                      <MenuItem value={140000}>140.000£</MenuItem>
                      <MenuItem value={150000}>150.000£</MenuItem>
                      <MenuItem value={160000}>160.000£</MenuItem>
                      <MenuItem value={170000}>170.000£</MenuItem>
                      <MenuItem value={180000}>180.000£</MenuItem>
                      <MenuItem value={190000}>190.000£</MenuItem>
                      <MenuItem value={200000}>200.000£</MenuItem>
                      <MenuItem value={210000}>210.000£</MenuItem>
                      <MenuItem value={220000}>220.000£</MenuItem>
                      <MenuItem value={230000}>230.000£</MenuItem>
                      <MenuItem value={240000}>240.000£</MenuItem>
                      <MenuItem value={250000}>250.000£</MenuItem>
                      <MenuItem value={275000}>275.000£</MenuItem>
                      <MenuItem value={300000}>300.000£</MenuItem>
                      <MenuItem value={325000}>325.000£</MenuItem>
                      <MenuItem value={350000}>350.000£</MenuItem>
                      <MenuItem value={375000}>375.000£</MenuItem>
                      <MenuItem value={400000}>400.000£</MenuItem>
                      <MenuItem value={425000}>425.000£</MenuItem>
                      <MenuItem value={450000}>450.000£</MenuItem>
                      <MenuItem value={475000}>475.000£</MenuItem>
                      <MenuItem value={500000}>500.000£</MenuItem>
                      <MenuItem value={550000}>550.000£</MenuItem>
                      <MenuItem value={600000}>600.000£</MenuItem>
                      <MenuItem value={650000}>650.000£</MenuItem>
                      <MenuItem value={700000}>700.000£</MenuItem>
                      <MenuItem value={750000}>750.000£</MenuItem>
                      <MenuItem value={800000}>800.000£</MenuItem>
                      <MenuItem value={850000}>850.000£</MenuItem>
                      <MenuItem value={900000}>900.000£</MenuItem>
                      <MenuItem value={950000}>950.000£</MenuItem>
                      <MenuItem value={1000000}>1.000.000£</MenuItem>
                      <MenuItem value={1100000}>1.100.000£</MenuItem>
                      <MenuItem value={1200000}>1.200.000£</MenuItem>
                      <MenuItem value={1300000}>1.300.000£</MenuItem>
                      <MenuItem value={1400000}>1.400.000£</MenuItem>
                      <MenuItem value={1500000}>1.500.000£</MenuItem>
                      <MenuItem value={1600000}>1.600.000£</MenuItem>
                      <MenuItem value={1700000}>1.700.000£</MenuItem>
                      <MenuItem value={1800000}>1.800.000£</MenuItem>
                      <MenuItem value={1900000}>1.900.000£</MenuItem>
                      <MenuItem value={2000000}>2.000.000£</MenuItem>
                      <MenuItem value={2100000}>2.100.000£</MenuItem>
                      <MenuItem value={2200000}>2.200.000£</MenuItem>
                      <MenuItem value={2300000}>2.300.000£</MenuItem>
                      <MenuItem value={2400000}>2.400.000£</MenuItem>
                      <MenuItem value={2500000}>2.500.000£</MenuItem>
                      <MenuItem value={2750000}>2.750.000£</MenuItem>
                      <MenuItem value={3000000}>3.000.000£</MenuItem>
                      <MenuItem value={3250000}>3.250.000£</MenuItem>
                      <MenuItem value={3500000}>3.500.000£</MenuItem>
                      <MenuItem value={3750000}>3.750.000£</MenuItem>
                      <MenuItem value={4000000}>4.000.000£</MenuItem>
                      <MenuItem value={4250000}>4.250.000£</MenuItem>
                      <MenuItem value={4500000}>4.500.000£</MenuItem>
                      <MenuItem value={4750000}>4.750.000£</MenuItem>
                      <MenuItem value={5000000}>5.000.000£</MenuItem>
                      <MenuItem value={5500000}>5.500.000£</MenuItem>
                      <MenuItem value={6000000}>6.000.000£</MenuItem>
                      <MenuItem value={6500000}>6.500.000£</MenuItem>
                      <MenuItem value={7000000}>7.000.000£</MenuItem>
                      <MenuItem value={7500000}>7.500.000£</MenuItem>
                      <MenuItem value={8000000}>8.000.000£</MenuItem>
                      <MenuItem value={8500000}>8.500.000£</MenuItem>
                      <MenuItem value={9000000}>9.000.000£</MenuItem>
                      <MenuItem value={9500000}>9.500.000£</MenuItem>
                      <MenuItem value={12500000}>12.500.000£</MenuItem>
                      <MenuItem value={15000000}>15.000.000£</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <FormControl>
                    <InputLabel id="rent-setting-select-label">Rent</InputLabel>
                    <Select
                      labelId="rent-setting-select-label"
                      label="Rent"
                      placeholder="Rent"
                      value={maxPrice}
                      onChange={(event) => {
                        setMaxPrice(+event.target.value);
                      }}
                      style={{ width: '150px' }}
                    >
                      <MenuItem value={0}>any</MenuItem>
                      <MenuItem value={100}>100£ pcm</MenuItem>
                      <MenuItem value={200}>200£ pcm</MenuItem>
                      <MenuItem value={300}>300£ pcm</MenuItem>
                      <MenuItem value={400}>400£ pcm</MenuItem>
                      <MenuItem value={500}>500£ pcm</MenuItem>
                      <MenuItem value={600}>600£ pcm</MenuItem>
                      <MenuItem value={700}>700£ pcm</MenuItem>
                      <MenuItem value={800}>800£ pcm</MenuItem>
                      <MenuItem value={900}>900£ pcm</MenuItem>
                      <MenuItem value={1000}>1000£ pcm</MenuItem>
                      <MenuItem value={1250}>1250£ pcm</MenuItem>
                      <MenuItem value={1500}>1500£ pcm</MenuItem>
                      <MenuItem value={1750}>1750£ pcm</MenuItem>
                      <MenuItem value={2000}>2000£ pcm</MenuItem>
                      <MenuItem value={2250}>2250£ pcm</MenuItem>
                      <MenuItem value={2500}>2500£ pcm</MenuItem>
                      <MenuItem value={2750}>2750£ pcm</MenuItem>
                      <MenuItem value={3000}>3000£ pcm</MenuItem>
                      <MenuItem value={3250}>3250£ pcm</MenuItem>
                      <MenuItem value={3500}>3500£ pcm</MenuItem>
                      <MenuItem value={3750}>3750£ pcm</MenuItem>
                      <MenuItem value={4000}>4000£ pcm</MenuItem>
                      <MenuItem value={4250}>4250£ pcm</MenuItem>
                      <MenuItem value={4500}>4500£ pcm</MenuItem>
                      <MenuItem value={4750}>4750£ pcm</MenuItem>
                      <MenuItem value={5000}>5000£ pcm</MenuItem>
                      <MenuItem value={5500}>5500£ pcm</MenuItem>
                      <MenuItem value={6000}>6000£ pcm</MenuItem>
                      <MenuItem value={6500}>6500£ pcm</MenuItem>
                      <MenuItem value={7000}>7000£ pcm</MenuItem>
                      <MenuItem value={7500}>7500£ pcm</MenuItem>
                      <MenuItem value={8000}>8000£ pcm</MenuItem>
                      <MenuItem value={8500}>8500£ pcm</MenuItem>
                      <MenuItem value={9000}>9000£ pcm</MenuItem>
                      <MenuItem value={9500}>9500£ pcm</MenuItem>
                      <MenuItem value={10000}>10000£ pcm</MenuItem>
                      <MenuItem value={12500}>12500£ pcm</MenuItem>
                      <MenuItem value={15000}>15000£ pcm</MenuItem>
                      <MenuItem value={17500}>17500£ pcm</MenuItem>
                      <MenuItem value={20000}>20000£ pcm</MenuItem>
                      <MenuItem value={25000}>25000£ pcm</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SearchIcon />}
                  style={{ padding: '1%' }}
                >
                  <Link
                    href={{
                      pathname: '../property',
                      query: {
                        value: searchArea
                          ? searchArea.value
                          : router.query.value,
                        identifier: searchArea
                          ? searchArea.identifier
                          : router.query.identifier,
                        beds: bedroomSetting.toString(),
                        price: maxPrice.toString(),
                        toRent: router.query.toRent,
                      },
                    }}
                  >
                    <Typography variant="subtitle1">apply</Typography>
                  </Link>
                </Button>
              </Grid>
            </Grid>
          </div>
          <Grid container justifyContent="center" rowSpacing="15">
            <Grid
              item
              style={{
                margin: '4.2%',
                marginTop: '2%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography variant="h3" style={{ marginBottom: '0.8%' }}>
                Property {router.query.toRent === '0' ? 'to rent' : 'for sale'}{' '}
                in {router.query.value}
              </Typography>
              {objectsToDisplay.length > 0 ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SearchIcon />}
                  style={{ padding: '1%' }}
                >
                  <Link
                    href={{
                      pathname: '../map',
                      query: {
                        value: router.query.value,
                        identifier: router.query.identifier,
                        beds: router.query.beds,
                        price: router.query.price,
                        toRent: router.query.toRent,
                      },
                    }}
                  >
                    <Typography variant="h6">Map view</Typography>
                  </Link>
                </Button>
              ) : (
                <Button disabled>
                  <Typography variant="h6">Map view</Typography>
                </Button>
              )}
            </Grid>
            {objectsToDisplay.length > 0 ? (
              objectsToDisplay.map((listing) => {
                const images: CarouselImage[] = listing.other_image.map(
                  (image) => {
                    return {
                      label: image.description,
                      imgPath: image.url,
                    };
                  },
                );

                return (
                  <Grid
                    item
                    key={listing.listing_id}
                    xs={12}
                    display="flex"
                    justifyContent="center"
                  >
                    <article
                      style={{
                        border: '0.5px solid grey',
                        borderRadius: '3px',
                        padding: '0.1%',
                      }}
                    >
                      <PropertyImageCarousel
                        images={images}
                        maxWidth={645}
                        height={430}
                      />
                      <div style={{ display: 'flex', padding: '1%' }}>
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space between',
                              alignItems: 'center',
                              marginBottom: '1.5%',
                              gap: 10,
                            }}
                          >
                            <Typography variant="h4">
                              {router.query.toRent === '0'
                                ? `${listing.rental_prices.per_month}£ pcm`
                                : `${listing.price}£`}
                            </Typography>
                            <Typography
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <BedIcon /> {+listing.num_bedrooms}
                            </Typography>
                            <Typography
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <BathtubIcon />
                              {+listing.num_bathrooms}
                            </Typography>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <Typography variant="subtitle2">
                                <LocationOnIcon fontSize="small" />
                                {listing.displayable_address}
                              </Typography>
                              <Typography variant="h5">
                                {listing.title}
                              </Typography>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        justifyContent: 'space-between',
                        width: '15%',
                        minWidth: '200px',
                        height: '100%',
                        padding: '0.8%',
                        paddingBottom: '1%',
                        border: '0.5px solid grey',
                        borderRadius: '3px',
                      }}
                    >
                      <div>
                        <img
                          src={listing.agent_logo}
                          width="100%"
                          alt="agent logo"
                          style={{ maxWidth: '150px' }}
                        />
                        <div
                          dangerouslySetInnerHTML={{
                            __html: listing.short_description.slice(0, 170),
                          }}
                        />
                      </div>
                      <Button
                        style={{ justifySelf: 'flex-end', padding: '1%' }}
                        variant="contained"
                        color="primary"
                        startIcon={<InfoIcon />}
                        onClick={async () => {
                          if (props.loggedIn && props.userId) {
                            if (listing.listing_status === 'rent') {
                              console.log('rent');

                              await setParameters(
                                props.userId,
                                props.rentSearchParams,
                                listing.rental_prices.per_month,
                                listing.num_bedrooms,
                                true,
                              );
                            }
                            if (listing.listing_status === 'sale') {
                              await setParameters(
                                props.userId,
                                props.buySearchParams,
                                parseInt(listing.price),
                                listing.num_bedrooms,
                                false,
                              );
                            }
                          }

                          sessionStorage.setItem(
                            'listingData',
                            JSON.stringify(propertyData),
                          );
                          console.log(sessionStorage.getItem('listingData'));
                          await router.push({
                            pathname: `http://localhost:3000/details/${listing.listing_id}`,
                          });
                        }}
                      >
                        <Typography variant="subtitle1">Details</Typography>
                      </Button>
                    </div>
                  </Grid>
                );
              })
            ) : (
              <Grid item xs={12} display="flex" justifyContent="center">
                <Typography variant="h2">No property found :(</Typography>
              </Grid>
            )}
          </Grid>
          <div style={{ width: '250px', padding: '2%' }} />
        </div>
        <Pagination
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '3.5%',
          }}
          size="large"
          count={
            propertyData && propertyData.result_count / 15 < 400
              ? Math.ceil(propertyData.result_count / 15)
              : 400
          }
          page={currentPage}
          onChange={(event, value) => {
            console.log(currentPage);

            setCurrentPage(value);
          }}
        />
      </>
    );
  }
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const accessToken = context.req.cookies.aT;
  const refreshToken = context.req.cookies.rT;

  config();

  const rapidApiKey = process.env.RAPIDAPI_KEY;

  if (accessToken) {
    const userId = await getUserIdByAccessToken(accessToken);

    if (userId) {
      const params = await getSearchParamsForUserById(userId.userId, true);
      const user = await getUserWith2FaSecretById(userId.userId);
      console.log('1', params);

      if (params && 'rentSearchParameters' in params) {
        return {
          props: {
            loggedIn: true,
            userId: userId.userId,
            user: user,
            rentSearchParams: params.rentSearchParameters
              ? params.rentSearchParameters
              : null,
            rapidApiKey: rapidApiKey,
          },
        };
      }
      if (params && 'buySearchParameters' in params) {
        return {
          props: {
            loggedIn: true,
            userId: userId.userId,
            user: user,
            buySearchParams: params.buySearchParameters
              ? params.buySearchParameters
              : null,
            rapidApiKey: rapidApiKey,
          },
        };
      }
    }
    console.log('2');

    return {
      props: {
        loggedIn: false,
        rapidApiKey: rapidApiKey,
      },
    };
  }

  if (refreshToken) {
    const userId = await getUserIdByRefreshToken(refreshToken);
    console.log(await getUserIdByRefreshToken(refreshToken), 'hi');

    const cookies = new Cookies(context.req, context.res);

    if (userId) {
      console.log('why');

      const csrf = await generateCsrfToken();

      const refreshAccessResponse = await fetch(
        'http://localhost:3000/api/auth/refreshAccess',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: refreshToken,
            csrfToken: csrf.token,
            csrfSaltId: csrf.id,
            userId: userId.userId,
          }),
        },
      );

      const refreshAccessResponseBody =
        (await refreshAccessResponse.json()) as RefreshAccessResponseBody;

      console.log(refreshAccessResponseBody);

      if ('cookies' in refreshAccessResponseBody) {
        cookies.set(refreshAccessResponseBody.cookies.rT);

        if (!refreshAccessResponseBody.cookies.reusedRefreshToken) {
          cookies.set(refreshAccessResponseBody.cookies.aT);

          const params = await getSearchParamsForUserById(userId.userId, true);
          const user = await getUserWith2FaSecretById(userId.userId);
          console.log('3', params);

          if (params && 'rentSearchParameters' in params) {
            return {
              props: {
                loggedIn: true,
                userId: userId.userId,
                user: user,
                rentSearchParams: params.rentSearchParameters
                  ? params.rentSearchParameters
                  : null,
                rapidApiKey: rapidApiKey,
              },
            };
          }
          if (params && 'buySearchParameters' in params) {
            return {
              props: {
                loggedIn: true,
                userId: userId.userId,
                user: user,
                buySearchParams: params.buySearchParameters
                  ? params.buySearchParameters
                  : null,
                rapidApiKey: rapidApiKey,
              },
            };
          }
        }
        console.log('4');

        return {
          props: {
            loggedIn: false,
            reusedRefreshToken: true,
          },
        };
      }
    }
  }
  console.log('5');

  return {
    props: {
      loggedIn: false,
      rapidApiKey: rapidApiKey,
    },
  };
}
