import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import BathtubIcon from '@mui/icons-material/Bathtub';
import BedIcon from '@mui/icons-material/Bed';
import EmailIcon from '@mui/icons-material/Email';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import LocalAirportIcon from '@mui/icons-material/LocalAirport';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import RoomIcon from '@mui/icons-material/Room';
import SchoolIcon from '@mui/icons-material/School';
import TrainIcon from '@mui/icons-material/Train';
import {
  Alert,
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  Snackbar,
  Typography,
} from '@mui/material';
import { config } from 'dotenv-safe';
import GoogleMapReact from 'google-map-react';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import Header from '../../Components/Layout/Header';
import PropertyImageCarousel, {
  CarouselImage,
} from '../../Components/Property/Carousel';
import DetailEmailForm from '../../Components/Property/Details/DetailEmailForm';
import LoadingScreen from '../../Components/util/LoadingScreen';
import {
  getUserIdByAccessToken,
  getUserIdByRefreshToken,
  getUserWith2FaSecretById,
} from '../../util/database';
import {
  fetchPointsOfInterest,
  mappedObjects,
} from '../../util/methods/pages/details/listingDetailsFunctions';
import {
  unixTimeFromDate,
  unixTimeFromNumber,
} from '../../util/methods/pages/utils/convertDateToUnixTime';

type ListingProps = {
  listingId: string;
  loggedIn: boolean;
  user?: User;
  rapidApiKey: string | undefined;
};

const Marker = ({ children }: any) => children;

export default function Listing(props: ListingProps) {
  const [listingData, setListingData] = useState<ListingObject>();
  const [foundListing, setFoundListing] = useState<Listing | null>(null);
  const [pointsOfInterest, setPointsOfInterest] = useState<any>(null);
  const [nearbyAirports, setNearbyAirports] = useState<any>(null);
  const [nearbySchools, setNearbySchools] = useState<any>(null);
  const [nearbyPrimarySchools, setNearbyPrimarySchools] = useState<any>(null);
  const [nearbySecondarySchools, setNearbySecondarySchools] =
    useState<any>(null);
  const [nearbyStations, setNearbyStations] = useState<any>(null);
  const [poiSet, setPoiSet] = useState<boolean>(false);
  const [descriptionCollapsed, setDescriptionCollapsed] =
    useState<boolean>(true);
  const [detailEmailFormShown, setDetailEmailFormShown] =
    useState<boolean>(false);
  const [showEmailSuccessSnackbar, setShowEmailSuccessSnackbar] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPOI = useCallback(
    () =>
      fetchPointsOfInterest(
        foundListing ? foundListing.listing_id : null,
        setPointsOfInterest,
        setPoiSet,
        setLoading,
        props.rapidApiKey,
      ),
    [foundListing, props.rapidApiKey],
  );

  if (pointsOfInterest && foundListing && !poiSet) {
    const listingId = foundListing.listing_id;

    if (pointsOfInterest[listingId].airports) {
      setNearbyAirports(mappedObjects(pointsOfInterest[listingId].airports));
      setPoiSet(true);
    }
    if (pointsOfInterest[listingId].schools) {
      setNearbySchools(mappedObjects(pointsOfInterest[listingId].schools));
      setPoiSet(true);
    }
    if (pointsOfInterest[listingId].primary_schools) {
      setNearbyPrimarySchools(
        mappedObjects(pointsOfInterest[listingId].primary_schools),
      );
      setPoiSet(true);
    }
    if (pointsOfInterest[listingId].secondary_schools) {
      setNearbySecondarySchools(
        mappedObjects(pointsOfInterest[listingId].secondary_schools),
      );
      setPoiSet(true);
    }
    if (pointsOfInterest[listingId].stations) {
      setNearbyStations(mappedObjects(pointsOfInterest[listingId].stations));
      setPoiSet(true);
    }
  }

  const router = useRouter();

  let images: CarouselImage[] = [];

  if (foundListing) {
    images = foundListing.other_image.map((image) => {
      return {
        label: image.description,
        imgPath: image.url,
      };
    });
  }

  useEffect(() => {
    fetchPOI().catch(console.error);
  }, [fetchPOI]);

  useEffect(() => {
    if (sessionStorage.getItem('listingData') !== null) {
      const data = JSON.parse(sessionStorage.getItem('listingData')!);

      setListingData(data);
    }
  }, []);

  useEffect(() => {
    if (listingData) {
      const lookingUpListing = listingData.listing.find((listing) => {
        return props.listingId === listing.listing_id;
      });

      if (lookingUpListing) {
        setFoundListing(lookingUpListing);
      }
    }
  }, [listingData, props.listingId]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (foundListing) {
    return (
      <>
        {detailEmailFormShown ? (
          <DetailEmailForm
            setDetailEmailFormShown={setDetailEmailFormShown}
            setShowEmailSuccessSnackbar={setShowEmailSuccessSnackbar}
          />
        ) : null}
        <Header loggedIn={props.loggedIn} user={props.user} />
        <main style={{ display: 'flex' }}>
          <section style={{ marginLeft: '8%', maxWidth: '800px' }}>
            <Button
              onClick={() => {
                router.back();
              }}
            >
              <KeyboardReturnIcon fontSize="large" />
            </Button>
            <PropertyImageCarousel
              images={images}
              maxWidth={800}
              height={533}
              autoplay
            />
            {unixTimeFromDate(new Date(foundListing.listing_date)) >=
            unixTimeFromNumber(Date.now()) - 86400 ? (
              <Chip
                style={{ marginTop: '2%', marginBottom: '2%' }}
                icon={<FiberNewIcon />}
                label="NEW LISTING"
                color="success"
              />
            ) : null}
            <Grid container>
              <Grid item xs={12} display="flex" alignItems="center" gap={2}>
                <Typography variant="h3">
                  {foundListing.listing_status === 'rent'
                    ? `${foundListing.rental_prices.per_month}£ pcm`
                    : `${foundListing.price}£`}
                </Typography>
                <Typography
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <BedIcon /> {+foundListing.num_bedrooms}
                </Typography>
                <Typography
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <BathtubIcon />
                  {+foundListing.num_bathrooms}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  display="flex"
                  alignItems="center"
                >
                  <LocationOnIcon />
                  {foundListing.displayable_address}
                </Typography>
              </Grid>
              <Grid item xs={12} marginBottom="3%">
                <Typography variant="h4">{foundListing.title}</Typography>
              </Grid>
              <Grid item xs={12} borderTop="1.5px solid grey" paddingTop="2%">
                <div style={{ height: '35vh', width: 'auto' }}>
                  <Typography marginBottom="2%" variant="h5">
                    Points of Interest
                  </Typography>
                  <GoogleMapReact
                    bootstrapURLKeys={{
                      key: 'AIzaSyBTg924Z_lgqKWI3ZulRU6YgRUEDdmeclQ',
                    }}
                    defaultCenter={{
                      lat: foundListing.latitude,
                      lng: foundListing.longitude,
                    }}
                    defaultZoom={15}
                    options={{
                      disableDefaultUI: true,
                      zoomControl: true,
                      draggable: false,
                      keyboardShortcuts: false,
                    }}
                  >
                    <Marker
                      lat={foundListing.latitude}
                      lng={foundListing.longitude}
                    >
                      <RoomIcon fontSize="large" />
                    </Marker>
                    {nearbyAirports
                      ? nearbyAirports.map((airport: any) => {
                          return (
                            <Marker
                              key={airport.name}
                              lat={airport.lat}
                              lng={airport.lng}
                            >
                              <LocalAirportIcon />
                            </Marker>
                          );
                        })
                      : null}
                    {nearbyPrimarySchools
                      ? nearbyPrimarySchools.map((primarySchool: any) => {
                          return (
                            <Marker
                              key={primarySchool.name}
                              lat={primarySchool.lat}
                              lng={primarySchool.lng}
                            >
                              <SchoolIcon />
                            </Marker>
                          );
                        })
                      : null}
                    {nearbySecondarySchools
                      ? nearbySecondarySchools.map((secondarySchool: any) => {
                          return (
                            <Marker
                              key={secondarySchool.name}
                              lat={secondarySchool.lat}
                              lng={secondarySchool.lng}
                            >
                              <SchoolIcon />
                            </Marker>
                          );
                        })
                      : null}
                    {nearbySchools
                      ? nearbySchools.map((school: any) => {
                          return (
                            <Marker
                              key={school.name}
                              lat={school.lat}
                              lng={school.lng}
                            >
                              <SchoolIcon />
                            </Marker>
                          );
                        })
                      : null}
                    {nearbyStations
                      ? nearbyStations.map((station: any) => {
                          return (
                            <Marker
                              key={station.name}
                              lat={station.lat}
                              lng={station.lng}
                            >
                              <TrainIcon />
                            </Marker>
                          );
                        })
                      : null}
                  </GoogleMapReact>
                </div>
              </Grid>
              <Grid item xs={12}>
                <Grid container marginTop="6.8%" paddingBottom="2%">
                  <Grid item xs={6}>
                    {nearbyPrimarySchools ? (
                      <Typography
                        key={nearbyPrimarySchools[0].name}
                        variant="subtitle2"
                        gap={2}
                        display="flex"
                        alignItems="center"
                      >
                        <SchoolIcon />
                        {nearbyPrimarySchools[0].name}
                      </Typography>
                    ) : null}
                  </Grid>
                  <Grid item xs={6}>
                    {nearbyStations ? (
                      <Typography
                        key={nearbyStations[0].name}
                        variant="subtitle2"
                        gap={2}
                        display="flex"
                        alignItems="center"
                      >
                        <TrainIcon />
                        {nearbyStations[0].name}
                      </Typography>
                    ) : null}
                  </Grid>
                  <Grid item xs={6}>
                    {nearbySecondarySchools ? (
                      <Typography
                        key={nearbySecondarySchools[0].name}
                        variant="subtitle2"
                        gap={2}
                        display="flex"
                        alignItems="center"
                      >
                        <SchoolIcon />
                        {nearbySecondarySchools[0].name}
                      </Typography>
                    ) : null}
                  </Grid>
                  <Grid item xs={6}>
                    {nearbyAirports ? (
                      <Typography
                        key={nearbyAirports[0].name}
                        variant="subtitle2"
                        gap={2}
                        display="flex"
                        alignItems="center"
                      >
                        <LocalAirportIcon />
                        {nearbyAirports[0].name}
                      </Typography>
                    ) : null}
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                item
                xs={12}
                display="flex"
                flexDirection="column"
                borderTop="1.5px solid grey"
                paddingTop="2%"
                paddingBottom="2%"
              >
                <Typography marginBottom="2%" variant="h5">
                  Description
                </Typography>
                <Typography variant="subtitle1">
                  {foundListing.description.length < 300 ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: foundListing.description,
                      }}
                    />
                  ) : descriptionCollapsed ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: foundListing.description.slice(0, 300),
                      }}
                    />
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: foundListing.description,
                      }}
                    />
                  )}
                </Typography>
                {descriptionCollapsed &&
                !(foundListing.description.length < 300) ? (
                  <IconButton
                    style={{ marginTop: '1.5%' }}
                    onClick={() => setDescriptionCollapsed(false)}
                  >
                    <Typography variant="subtitle2">
                      Show full description
                    </Typography>
                    <KeyboardArrowDown />
                  </IconButton>
                ) : !(foundListing.description.length < 300) ? (
                  <IconButton
                    style={{ marginTop: '1.5%' }}
                    onClick={() => setDescriptionCollapsed(true)}
                  >
                    <Typography variant="subtitle2">
                      Hide full description
                    </Typography>
                    <KeyboardArrowUp />
                  </IconButton>
                ) : null}
              </Grid>
              {foundListing.floor_plan ? (
                <Grid
                  item
                  xs={12}
                  borderTop="1.5px solid grey"
                  paddingTop="2%"
                  paddingBottom="2%"
                >
                  <Typography marginBottom="2%" variant="h5">
                    {foundListing.floor_plan.length > 1
                      ? 'Floor plans'
                      : 'Floor plan'}
                  </Typography>
                  {foundListing.floor_plan.map((plan) => {
                    return (
                      <Link href={plan} key={plan} target="_blank">
                        <img
                          src={plan}
                          style={{
                            maxHeight: '200px',
                            maxWidth: '200px',
                            cursor: 'pointer',
                            marginRight: '15px',
                          }}
                          alt="floor plan"
                        />
                      </Link>
                    );
                  })}
                </Grid>
              ) : null}
            </Grid>
          </section>
          <section>
            <div
              style={{
                width: '35vw',
                height: '100%',
              }}
            >
              <Card
                style={{
                  position: 'sticky',
                  top: '5%',
                  marginLeft: '6%',
                  marginTop: '6%',
                  padding: '2%',
                }}
              >
                <Grid container rowSpacing={2}>
                  <Grid
                    item
                    xs={12}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap={2}
                  >
                    <Typography variant="h5">
                      {foundListing.agent_name}
                    </Typography>
                    <img
                      src={foundListing.agent_logo}
                      width="100%"
                      alt="agent logo"
                      style={{ maxWidth: '100px' }}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap={2}
                  >
                    <PhoneIcon />
                    {foundListing.agent_phone}
                  </Grid>
                  <Grid item xs={12} display="flex" justifyContent="center">
                    <Button onClick={() => setDetailEmailFormShown(true)}>
                      <EmailIcon /> Email agent
                    </Button>
                  </Grid>
                </Grid>
              </Card>
            </div>
          </section>
          <Snackbar
            open={showEmailSuccessSnackbar}
            onClose={() => setShowEmailSuccessSnackbar(false)}
          >
            <Alert
              onClose={() => setShowEmailSuccessSnackbar(false)}
              severity="success"
              sx={{ width: '100%' }}
            >
              Email sent!
            </Alert>
          </Snackbar>
        </main>
      </>
    );
  }
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const listingId = context.query.listingId;

  config();

  const rapidApiKey = process.env.RAPIDAPI_KEY;

  const aT = context.req.cookies.aT;
  const rT = context.req.cookies.rT;
  let user;

  if (aT || rT) {
    if (aT) {
      const userId = await getUserIdByAccessToken(aT);

      if (userId) {
        user = await getUserWith2FaSecretById(userId.userId);
      }
    }
    if (!user) {
      const userId = await getUserIdByRefreshToken(rT);

      if (userId) {
        user = await getUserWith2FaSecretById(userId.userId);
      }
    }
  }

  if (user) {
    return {
      props: {
        listingId: listingId,
        loggedIn: true,
        user: user,
        rapidApiKey: rapidApiKey,
      },
    };
  }

  return {
    props: {
      listingId: listingId,
      loggedIn: false,
      rapidApiKey: rapidApiKey,
    },
  };
}
