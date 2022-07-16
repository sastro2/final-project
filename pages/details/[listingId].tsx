import BathtubIcon from '@mui/icons-material/Bathtub';
import BedIcon from '@mui/icons-material/Bed';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import LocalAirportIcon from '@mui/icons-material/LocalAirport';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RoomIcon from '@mui/icons-material/Room';
import SchoolIcon from '@mui/icons-material/School';
import TrainIcon from '@mui/icons-material/Train';
import { Button, Chip, Grid, Typography } from '@mui/material';
import GoogleMapReact from 'google-map-react';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import PropertyImageCarousel, {
  CarouselImage,
} from '../../Components/Property/Carousel';
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

  const fetchPOI = useCallback(
    () =>
      fetchPointsOfInterest(
        foundListing ? foundListing.listing_id : null,
        setPointsOfInterest,
        setPoiSet,
      ),
    [foundListing],
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

  if (nearbyAirports) {
    console.log(nearbyAirports[0].name);
  }

  console.log(foundListing);

  if (foundListing) {
    return (
      <main style={{ display: 'flex' }}>
        <section style={{ marginLeft: '10%', maxWidth: '800px' }}>
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
            <Grid item xs={12}>
              <Typography variant="h4">{foundListing.title}</Typography>
            </Grid>
            <Grid item xs={12}>
              <div style={{ height: '35vh', width: 'auto' }}>
                <Typography variant="h5">Points of Interest</Typography>
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
              <Grid container marginTop="4.5%">
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
              </Grid>
            </Grid>
            <Grid item xs={12}>
              {foundListing.floor_plan ? (
                <Typography>{foundListing.floor_plan[0]}</Typography>
              ) : null}
            </Grid>
          </Grid>
        </section>
        <section>
          <div style={{ width: '35vw', height: '100%' }} />
        </section>
      </main>
    );
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
