import BathtubIcon from '@mui/icons-material/Bathtub';
import BedIcon from '@mui/icons-material/Bed';
import InfoIcon from '@mui/icons-material/Info';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Button, Grid, Typography } from '@mui/material';
import axios from 'axios';
import Cookies from 'cookies';
import { config } from 'dotenv-safe';
import GoogleMapReact from 'google-map-react';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Header from '../Components/Layout/Header';
import PropertyImageCarousel from '../Components/Property/Carousel';
import LoadingScreen from '../Components/util/LoadingScreen';
import { generateCsrfToken } from '../util/auth';
import {
  getSearchParamsForUserById,
  getUserIdByAccessToken,
  getUserIdByRefreshToken,
  getUserWith2FaSecretById,
} from '../util/database';
import {
  changeObjectsToDisplay,
  checkIfMarkerObjects,
  convertClusterToMarkers,
  extendBounds,
  initializeClusters,
} from '../util/methods/pages/mapFunctions';
import { setParameters } from '../util/methods/pages/utils/searchParameters/setParameters';
import { RefreshAccessResponseBody } from './api/auth/refreshAccess';

type PkgBounds = {
  nwLng: number;
  seLat: number;
  seLng: number;
  nwLat: number;
};

export type ClusterObject = {
  outcode: string;
  propertyAmount: number;
  averageCost: number;
  coordinates: { lat: number; lng: number };
  listing_ids: string[];
};

export type MarkerObject = {
  cost: number;
  coordinates: { lat: number; lng: number };
  listing_id: string;
};

export type MapProps = {
  loggedIn: boolean;
  reusedRefreshToken?: boolean;
  userId?: number;
  user?: User;
  rentSearchParams: string | null;
  buySearchParams: string | null;
  rapidApiKey: string | undefined;
  googleKey: string | undefined;
};

const Marker = ({ children }: any) => children;

let markerBounds: any;
let propertyData: ListingObject | null;

export default function Map(props: MapProps) {
  const mapRef = useRef<any>();
  const [mapZoom, setMapZoom] = useState(7);
  const [mapBounds, setMapBounds] = useState<PkgBounds>();
  const [mapHasLoaded, setMapHasLoaded] = useState<boolean>(false);
  const [objectsToDisplay, setObjectsToDisplay] = useState<
    MarkerObject[] | ClusterObject[] | null
  >(null);
  const [rerender, setRerender] = useState<boolean>(false);
  const [displayingClusters, setDisplayingClusters] = useState<boolean>(true);
  const [infoWindowToShow, setInfoWindowToShow] = useState<Listing>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();

  // change data recieved by router to value and identifier recieved by autocomplete once fetching from autocomplete

  useEffect(() => {
    async function fetchData() {
      if (!props.googleKey || !props.rapidApiKey) {
        return;
      }

      setIsLoading(true);

      const toRent = router.query.toRent === '0' ? 'rent' : 'sale';

      let options;
      if (router.query.beds !== '0') {
        if (router.query.price !== '0') {
          options = {
            method: 'GET',
            url: 'https://zoopla.p.rapidapi.com/properties/list',
            params: {
              area: router.query.value,
              identifier: router.query.identifier,
              category: 'residential',
              listing_status: toRent,
              maximum_beds: router.query.beds,
              minimum_beds: router.query.beds,
              maximum_price: router.query.price,
              order_by: 'age',
              ordering: 'descending',
              page_number: currentPage.toString(),
              page_size: '30',
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
              area: router.query.value,
              identifier: router.query.identifier,
              category: 'residential',
              listing_status: toRent,
              maximum_beds: router.query.beds,
              minimum_beds: router.query.beds,
              order_by: 'age',
              ordering: 'descending',
              page_number: currentPage.toString(),
              page_size: '30',
            },
            headers: {
              'X-RapidAPI-Key': props.rapidApiKey,
              'X-RapidAPI-Host': 'zoopla.p.rapidapi.com',
            },
          };
        }
      } else {
        options = {
          method: 'GET',
          url: 'https://zoopla.p.rapidapi.com/properties/list',
          params: {
            area: router.query.value,
            identifier: router.query.identifier,
            category: 'residential',
            listing_status: toRent,
            order_by: 'age',
            ordering: 'descending',
            page_number: currentPage.toString(),
            page_size: '30',
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
          data = response.data;
        })
        .catch(function (error) {
          console.error(error);
        });

      propertyData = data;
      setRerender(!rerender);
      setIsLoading(false);
    }

    fetchData().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    if (checkIfMarkerObjects(objectsToDisplay)) {
      extendBounds(objectsToDisplay as MarkerObject[], markerBounds);
      mapRef.current.fitBounds(markerBounds);
    } else {
      if (propertyData && mapHasLoaded) {
        extendBounds(propertyData, markerBounds);
        mapRef.current.fitBounds(markerBounds);
      }
    }
  }, [objectsToDisplay, mapHasLoaded]);

  useEffect(() => {

    initializeClusters(router, propertyData, setObjectsToDisplay);
  }, [rerender, router]);

  let townCoordinates;

  if (propertyData) {
    townCoordinates = {
      lat: propertyData.latitude,
      lng: propertyData.longitude,
    };
  }

  if (props.reusedRefreshToken) {
    return <h1>Token reuse detected please relog</h1>;
  }

  if (
    propertyData &&
    townCoordinates &&
    objectsToDisplay &&
    !isLoading &&
    props.googleKey
  ) {
    return (
      <>
        <Header loggedIn={props.loggedIn} user={props.user} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '4%',
          }}
        >
          <Grid container style={{ marginBottom: '0.8%' }}>
            <Grid
              item
              xs={12}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 40,
              }}
            >
              <Button
                onClick={() => {
                  router.back();
                }}
              >
                <KeyboardReturnIcon fontSize="large" />
              </Button>
              <div>
                {displayingClusters ? (
                  <Button
                    onClick={() => {
                      const allMarkers: MarkerObject[] =
                        propertyData!.listing.map((listing) => {
                          return {
                            cost:
                              router.query.toRent === '0'
                                ? listing.rental_prices.per_month
                                : parseInt(listing.price),
                            coordinates: {
                              lat: listing.latitude,
                              lng: listing.longitude,
                            },
                            listing_id: listing.listing_id,
                          };
                        });

                      setDisplayingClusters(false);
                      changeObjectsToDisplay(allMarkers, setObjectsToDisplay);
                    }}
                  >
                    Show properties
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      initializeClusters(
                        router,
                        propertyData,
                        setObjectsToDisplay,
                      );
                      setDisplayingClusters(true);
                    }}
                  >
                    Show clusters
                  </Button>
                )}
              </div>
              <div style={{ display: 'flex' }}>
                {currentPage > 1 ? (
                  <Button
                    onClick={() => {
                      setMapHasLoaded(false);
                      setCurrentPage(currentPage - 1);
                      if (!displayingClusters) {
                        setDisplayingClusters(true);
                      }
                    }}
                  >
                    <KeyboardArrowLeftIcon />
                  </Button>
                ) : (
                  <Button disabled>
                    <KeyboardArrowLeftIcon />
                  </Button>
                )}
                <Typography variant="subtitle1">prev/next</Typography>
                {currentPage < Math.ceil(propertyData.result_count / 30) + 1 ? (
                  <Button
                    onClick={() => {
                      setMapHasLoaded(false);
                      setCurrentPage(currentPage + 1);
                      if (!displayingClusters) {
                        setDisplayingClusters(true);
                      }
                    }}
                  >
                    <KeyboardArrowRightIcon />
                  </Button>
                ) : (
                  <Button disabled>
                    <KeyboardArrowLeftIcon />
                  </Button>
                )}
              </div>
            </Grid>
          </Grid>
          <div style={{ display: 'flex', alignItems: 'center', flex: '1' }}>
            <div
              style={{
                height: '40vw',
                width: '40vw',
                display: 'flex',
              }}
            >
              <GoogleMapReact
                bootstrapURLKeys={{
                  key: props.googleKey,
                }}
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
                    extendBounds(propertyData!, markerBounds);
                    mapRef.current.fitBounds(markerBounds);
                    setMapHasLoaded(true);
                  }
                }}
              >
                {objectsToDisplay.map((mapObject) => {
                  if ('listing_id' in mapObject) {
                    return (
                      <Marker
                        key={mapObject.listing_id}
                        lat={mapObject.coordinates.lat}
                        lng={mapObject.coordinates.lng}
                      >
                        <button
                          onClick={async () => {
                            if (document.fullscreenElement) {
                              await document.exitFullscreen();
                            }
                            setInfoWindowToShow(
                              propertyData?.listing.find((listing) => {
                                return (
                                  mapObject.listing_id === listing.listing_id
                                );
                              }),
                            );
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
                        style={{ whiteSpace: 'nowrap', textAlign: 'center' }}
                        onClick={() => {
                          setDisplayingClusters(false);
                          changeObjectsToDisplay(
                            convertClusterToMarkers(
                              router,
                              mapObject,
                              propertyData,
                            ) as MarkerObject[],
                            setObjectsToDisplay,
                          );
                          mapRef.current.setCenter(mapObject.coordinates);
                          mapRef.current.setZoom(17);
                          markerBounds = mapRef.current.getBounds();
                        }}
                      >
                        {Math.floor(mapObject.averageCost)} (
                        {mapObject.listing_ids.length})
                      </button>
                    </Marker>
                  );
                })}
              </GoogleMapReact>
            </div>
            <div
              style={{
                height: '35vw',
                width: '35vw',
                marginLeft: '3%',
                alignSelf: 'flex-start',
              }}
            >
              {infoWindowToShow ? (
                <Grid container>
                  <Grid item xs={12}>
                    <PropertyImageCarousel
                      images={infoWindowToShow.other_image.map((img) => {
                        return {
                          label: img.description,
                          imgPath: img.url,
                        };
                      })}
                      maxWidth={400}
                      height={300}
                      autoplay
                    />
                  </Grid>
                  <Grid item xs={12} display="flex" style={{ gap: 8 }}>
                    <Typography variant="h4" marginRight="2%">
                      {router.query.toRent === '0'
                        ? `${infoWindowToShow.rental_prices.per_month}£ pcm`
                        : `${infoWindowToShow.price}£`}
                    </Typography>
                    <Typography
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <BedIcon /> {+infoWindowToShow.num_bedrooms}
                    </Typography>
                    <Typography
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <BathtubIcon /> {+infoWindowToShow.num_bathrooms}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">
                      <LocationOnIcon fontSize="small" />
                      {infoWindowToShow.displayable_address}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5" style={{ marginTop: '0.5%' }}>
                      {infoWindowToShow.title}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} marginTop="5%">
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<InfoIcon />}
                      style={{ padding: '1%' }}
                      onClick={async () => {
                        sessionStorage.setItem(
                          'listingData',
                          JSON.stringify(propertyData),
                        );
                        if (props.loggedIn && props.userId && propertyData) {
                          const listing = propertyData.listing.find(
                            (property) => {
                              return (
                                infoWindowToShow.listing_id ===
                                property.listing_id
                              );
                            },
                          );

                          if (listing && listing.listing_status === 'rent') {
                            await setParameters(
                              props.userId,
                              props.rentSearchParams,
                              listing.rental_prices.per_month,
                              listing.num_bedrooms,
                              true,
                            );
                          }
                          if (listing && listing.listing_status === 'sale') {
                            await setParameters(
                              props.userId,
                              props.buySearchParams,
                              parseInt(listing.price),
                              listing.num_bedrooms,
                              false,
                            );
                          }
                        }
                        await router.push({
                          pathname: `https://home-scout.herokuapp.com/details/${infoWindowToShow.listing_id}`,
                        });
                      }}
                    >
                      Go to listing
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <div
                  style={{
                    height: '35vw',
                    width: '35vw',
                    marginLeft: '3%',
                    alignSelf: 'flex-start',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h5">
                    Select an Object to see details here
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return <LoadingScreen />;
  }
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const accessToken = context.req.cookies.aT;
  const refreshToken = context.req.cookies.rT;

  config();

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const googleKey = process.env.GOOGLE_KEY;

  if (accessToken) {
    const userId = await getUserIdByAccessToken(accessToken);

    if (userId) {
      const user = await getUserWith2FaSecretById(userId.userId);
      const params = await getSearchParamsForUserById(userId.userId, true);

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
            googleKey: googleKey,
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
            googleKey: googleKey,
          },
        };
      }
    }

    return {
      props: {
        loggedIn: false,
      },
    };
  }

  if (refreshToken) {
    const userId = await getUserIdByRefreshToken(refreshToken);

    const cookies = new Cookies(context.req, context.res);

    if (userId) {

      const csrf = await generateCsrfToken();

      const refreshAccessResponse = await fetch(
        'https://home-scout.herokuapp.com/api/auth/refreshAccess',
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

      if ('cookies' in refreshAccessResponseBody) {
        cookies.set(refreshAccessResponseBody.cookies.rT);

        if (!refreshAccessResponseBody.cookies.reusedRefreshToken) {
          cookies.set(refreshAccessResponseBody.cookies.aT);

          const params = await getSearchParamsForUserById(userId.userId, true);
          const user = await getUserWith2FaSecretById(userId.userId);

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
                googleKey: googleKey,
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
                googleKey: googleKey,
              },
            };
          }
        }

        return {
          props: {
            loggedIn: false,
            reusedRefreshToken: true,
          },
        };
      }
    }
  }

  return {
    props: {
      loggedIn: false,
      rapidApiKey: rapidApiKey,
      googleKey: googleKey,
    },
  };
}
