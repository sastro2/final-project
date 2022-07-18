import {
  Button,
  Grid,
  MenuItem,
  Tab,
  Tabs,
  Typography,
} from '@material-ui/core';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import SearchIcon from '@mui/icons-material/Search';
import { Stack } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import axios from 'axios';
import Cookies from 'cookies';
import { GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ChangeEvent, useDeferredValue, useMemo, useState } from 'react';
import Header from '../Components/Layout/Header';
import AutocompleteInputBox from '../Components/util/AutocompleteInput';
import { generateCsrfToken } from '../util/auth';
import {
  getUserIdByAccessToken,
  getUserIdByRefreshToken,
  getUserWith2FaSecretById,
} from '../util/database';
import { RefreshAccessResponseBody } from './api/auth/refreshAccess';

type HomeProps = {
  loggedIn: boolean;
  user?: User;
  reusedRefreshToken?: boolean;
};

export default function Home(props: HomeProps) {
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedOption, setSelectedOption] =
    useState<AutocompleteSuggestion | null>(null);
  const [bedroomSetting, setBedroomSetting] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [autocompleteResult, setAutocompleteResult] = useState<
    AutocompleteSuggestion[]
  >([]);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  console.log(searchInput, autocompleteResult, selectedOption);

  const deferredInput: string = useDeferredValue(searchInput);

  console.log(deferredInput);

  const autocomplete = useMemo(() => {
    const options = {
      method: 'GET',
      url: 'https://zoopla.p.rapidapi.com/auto-complete',
      params: { search_term: deferredInput },
      headers: {
        'X-RapidAPI-Key': 'a1dc1a29d9msh550f536bda95b23p1b94f7jsn783982c2ea68',
        'X-RapidAPI-Host': 'zoopla.p.rapidapi.com',
      },
    };

    let data: AutocompleteObject | undefined;

    axios
      .request(options)
      .then(function (response) {
        data = response.data as AutocompleteObject | undefined;

        console.log(data, deferredInput);

        if (data && deferredInput) {
          setAutocompleteResult(data.suggestions);
        } else {
          setAutocompleteResult([]);
        }

        return data;
      })
      .catch(function (error) {
        setAutocompleteResult([]);
        console.log(error);
        return null;
      });
  }, [deferredInput]);

  console.log(autocomplete);

  if (props.reusedRefreshToken) {
    return <h1>Token reuse detected please relog</h1>;
  }
  return (
    <>
      <Header loggedIn={props.loggedIn} user={props.user} />
      <div
        style={{
          padding: '16%',
          paddingTop: '20%',
          paddingBottom: '10%',
          backgroundImage: `url('./Images/suburb.jpg')`,
          backgroundSize: 'cover',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            paddingBottom: '1.5%',
            paddingLeft: '2%',
            paddingRight: '2%',
          }}
        >
          <Grid container>
            <Grid item xs={3} lg={4} />
            <Grid item xs={6} lg={4}>
              <Tabs
                indicatorColor="primary"
                value={selectedTab}
                onChange={(event: ChangeEvent<any>, newValue: number) => {
                  setSelectedTab(newValue);
                }}
                style={{ marginBottom: '1%' }}
              >
                <Tab label="To Rent" />
                <Tab label="For Sale" />
              </Tabs>
            </Grid>
            <Grid item xs={3} lg={4} />
            <Grid item xs={3} md={2} lg={1}>
              <FormControl>
                <InputLabel id="bedrooms-setting-select-label">Beds</InputLabel>
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
            </Grid>
            {selectedTab === 1 ? (
              <Grid item xs={3} md={2} lg={2}>
                <FormControl>
                  <InputLabel id="price-setting-select-label">Price</InputLabel>
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
              </Grid>
            ) : (
              <Grid item xs={3} md={2} lg={2}>
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
              </Grid>
            )}
            <Grid item xs={12} md={9} style={{ marginBottom: '1%' }}>
              <AutocompleteInputBox
                id="Home"
                options={autocompleteResult}
                setOptions={setAutocompleteResult}
                value={selectedOption}
                setValue={setSelectedOption}
                setInputValue={setSearchInput}
              />
            </Grid>
            <Grid item xs={12} md={2} xl={1}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                style={{
                  marginLeft: '7%',
                  marginRight: '7%',
                  marginBottom: '1%',
                }}
              >
                <Link
                  href={{
                    pathname: '/map',
                    query: {
                      value: selectedOption ? selectedOption.value : 'London',
                      identifier: selectedOption
                        ? selectedOption.identifier
                        : 'london',
                      beds: bedroomSetting,
                      price: maxPrice,
                      toRent: selectedTab,
                    },
                  }}
                >
                  Map
                </Link>
              </Button>
            </Grid>
            <Grid item xs={12} md={2} xl={1}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                style={{ marginLeft: '7%', marginRight: '7%' }}
              >
                <Link
                  href={{
                    pathname: '/property',
                    query: {
                      value: selectedOption ? selectedOption.value : 'London',
                      identifier: selectedOption
                        ? selectedOption.identifier
                        : 'london',
                      beds: bedroomSetting,
                      price: maxPrice,
                      toRent: selectedTab,
                    },
                  }}
                >
                  Search
                </Link>
              </Button>
            </Grid>
          </Grid>
        </div>
      </div>
      <Grid container style={{ padding: '5%' }}>
        <Grid item xs={12} md={4}>
          <Typography variant="h4">Discover towns and cities</Typography>
        </Grid>
        <Grid item xs={6} md={4}>
          <Tabs
            indicatorColor="primary"
            value={selectedTab}
            onChange={(event: ChangeEvent<any>, newValue: number) => {
              setSelectedTab(newValue);
            }}
          >
            <Tab label="To Rent" />
            <Tab label="For Sale" />
          </Tabs>
        </Grid>
        <Grid item xs={6} md={4} lg={4} />
        <Grid
          item
          xs={12}
          md={6}
          style={{
            marginTop: '5%',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <Image src="/Images/city1.png" width="75px" height="75px" />
          <Stack marginLeft="4%">
            <Typography variant="h4">In the city</Typography>
            <Typography variant="subtitle2">
              Live among the hustle and bustle
            </Typography>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          style={{
            marginTop: '5%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Stack>
            <Link
              href={{
                pathname: '/property',
                query: {
                  value: 'London',
                  identifier: 'london',
                  beds: 0,
                  price: 0,
                  toRent: selectedTab,
                },
              }}
              style={{ cursor: 'pointer' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '6%',
                  cursor: 'pointer',
                }}
              >
                <ArrowCircleRightIcon />
                <Typography>
                  London properties {selectedTab === 0 ? 'to rent' : 'for sale'}
                </Typography>
              </div>
            </Link>
            <Link
              href={{
                pathname: '/property',
                query: {
                  value: 'Manchester',
                  identifier: 'manchester',
                  beds: 0,
                  price: 0,
                  toRent: selectedTab,
                },
              }}
              style={{ cursor: 'pointer' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '6%',
                  cursor: 'pointer',
                }}
              >
                <ArrowCircleRightIcon />
                <Typography>
                  Manchester properties{' '}
                  {selectedTab === 0 ? 'to rent' : 'for sale'}
                </Typography>
              </div>
            </Link>
            <Link
              href={{
                pathname: '/property',
                query: {
                  value: 'Cardiff',
                  identifier: 'cardiff',
                  beds: 0,
                  price: 0,
                  toRent: selectedTab,
                },
              }}
              style={{ cursor: 'pointer' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '6%',
                  cursor: 'pointer',
                }}
              >
                <ArrowCircleRightIcon />
                <Typography>
                  Cardiff properties{' '}
                  {selectedTab === 0 ? 'to rent' : 'for sale'}
                </Typography>
              </div>
            </Link>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          style={{
            marginTop: '5%',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <Image src="/Images/coast1.png" width="75px" height="75px" />
          <Stack marginLeft="4%">
            <Typography variant="h4">On the coast</Typography>
            <Typography variant="subtitle2">
              Wake up to fresh air and sea views
            </Typography>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          style={{
            marginTop: '5%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Stack>
            <Link
              href={{
                pathname: '/property',
                query: {
                  value: 'Southampton',
                  identifier: 'southampton',
                  beds: 0,
                  price: 0,
                  toRent: selectedTab,
                },
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '6%',
                  cursor: 'pointer',
                }}
              >
                <ArrowCircleRightIcon />
                <Typography>
                  Southampton properties{' '}
                  {selectedTab === 0 ? 'to rent' : 'for sale'}
                </Typography>
              </div>
            </Link>
            <Link
              href={{
                pathname: '/property',
                query: {
                  value: 'Bristol',
                  identifier: 'bristol',
                  beds: 0,
                  price: 0,
                  toRent: selectedTab,
                },
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '6%',
                  cursor: 'pointer',
                }}
              >
                <ArrowCircleRightIcon />
                <Typography>
                  Bristol properties{' '}
                  {selectedTab === 0 ? 'to rent' : 'for sale'}
                </Typography>
              </div>
            </Link>
            <Link
              href={{
                pathname: '/property',
                query: {
                  value: 'Plymouth',
                  identifier: 'plymouth',
                  beds: 0,
                  price: 0,
                  toRent: selectedTab,
                },
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '6%',
                  cursor: 'pointer',
                }}
              >
                <ArrowCircleRightIcon />
                <Typography>
                  Plymouth properties{' '}
                  {selectedTab === 0 ? 'to rent' : 'for sale'}
                </Typography>
              </div>
            </Link>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          style={{
            marginTop: '5%',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <Image src="/Images/rural1.png" width="75px" height="75px" />
          <Stack marginLeft="4%">
            <Typography variant="h4">Rural and countryside</Typography>
            <Typography variant="subtitle2">
              Enjoy living close to nature
            </Typography>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          style={{
            marginTop: '5%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Stack>
            <Link
              href={{
                pathname: '/property',
                query: {
                  value: 'Leicester',
                  identifier: 'leicester',
                  beds: 0,
                  price: 0,
                  toRent: selectedTab,
                },
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '6%',
                  cursor: 'pointer',
                }}
              >
                <ArrowCircleRightIcon />
                <Typography>
                  Leicester properties{' '}
                  {selectedTab === 0 ? 'to rent' : 'for sale'}
                </Typography>
              </div>
            </Link>

            <Link
              href={{
                pathname: '/property',
                query: {
                  value: 'Derby',
                  identifier: 'derby',
                  beds: 0,
                  price: 0,
                  toRent: selectedTab,
                },
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '6%',
                  cursor: 'pointer',
                }}
              >
                <ArrowCircleRightIcon />
                <Typography>
                  Derby properties {selectedTab === 0 ? 'to rent' : 'for sale'}
                </Typography>
              </div>
            </Link>
            <Link
              href={{
                pathname: '/property',
                query: {
                  value: 'Northampton',
                  identifier: 'northampton',
                  beds: 0,
                  price: 0,
                  toRent: selectedTab,
                },
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '6%',
                  cursor: 'pointer',
                }}
              >
                <ArrowCircleRightIcon />
                <Typography>
                  Northampton properties{' '}
                  {selectedTab === 0 ? 'to rent' : 'for sale'}
                </Typography>
              </div>
            </Link>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          style={{
            marginTop: '5%',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <Image src="/Images/popular1.png" width="75px" height="75px" />
          <Stack marginLeft="4%">
            <Typography variant="h4">Popular locations</Typography>
            <Typography variant="subtitle2">
              Move to a property hotspot
            </Typography>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          style={{
            marginTop: '5%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Stack>
            <Link
              href={{
                pathname: '/property',
                query: {
                  value: 'Glasgow',
                  identifier: 'glasgow',
                  beds: 0,
                  price: 0,
                  toRent: selectedTab,
                },
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '6%',
                  cursor: 'pointer',
                }}
              >
                <ArrowCircleRightIcon />
                <Typography>
                  Glasgow properties{' '}
                  {selectedTab === 0 ? 'to rent' : 'for sale'}
                </Typography>
              </div>
            </Link>
            <Link
              href={{
                pathname: '/property',
                query: {
                  value: 'Birmingham',
                  identifier: 'birmingham',
                  beds: 0,
                  price: 0,
                  toRent: selectedTab,
                },
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '6%',
                  cursor: 'pointer',
                }}
              >
                <ArrowCircleRightIcon />
                <Typography>
                  Birmingham properties{' '}
                  {selectedTab === 0 ? 'to rent' : 'for sale'}
                </Typography>
              </div>
            </Link>
            <Link
              href={{
                pathname: '/property',
                query: {
                  value: 'Sheffield',
                  identifier: 'sheffield',
                  beds: 0,
                  price: 0,
                  toRent: selectedTab,
                },
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '6%',
                  cursor: 'pointer',
                }}
              >
                <ArrowCircleRightIcon />
                <Typography>
                  Sheffield properties{' '}
                  {selectedTab === 0 ? 'to rent' : 'for sale'}
                </Typography>
              </div>
            </Link>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const accessToken = context.req.cookies.aT;
  const refreshToken = context.req.cookies.rT;

  let tokenUserId;

  if (refreshToken) {
    tokenUserId = await getUserIdByRefreshToken(refreshToken);
  }

  const cookies = new Cookies(context.req, context.res);

  if (!accessToken && tokenUserId?.userId) {
    console.log('1');

    if (!refreshToken) {
      console.log('2');

      return {
        props: {
          loggedIn: false,
        },
      };
    }
    console.log('4');
    const user = await getUserWith2FaSecretById(tokenUserId.userId);
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
          userId: tokenUserId.userId,
        }),
      },
    );

    const refreshAccessResponseBody =
      (await refreshAccessResponse.json()) as RefreshAccessResponseBody;

    if ('cookies' in refreshAccessResponseBody) {
      cookies.set(refreshAccessResponseBody.cookies.rT);

      if (!refreshAccessResponseBody.cookies.reusedRefreshToken) {
        cookies.set(refreshAccessResponseBody.cookies.aT);
        console.log(refreshAccessResponseBody.cookies.reusedRefreshToken);

        return {
          props: {
            loggedIn: true,
            user: user,
          },
        };
      }

      return {
        props: {
          loggedIn: false,
          reusedRefreshToken: true,
        },
      };
    }
    console.log('6');

    return {
      props: {
        loggedIn: false,
      },
    };
  }

  if (accessToken) {
    console.log('7');

    const accessUserId = await getUserIdByAccessToken(accessToken);

    if (accessUserId?.userId) {
      const user = await getUserWith2FaSecretById(accessUserId.userId);
      console.log('8');

      return {
        props: {
          loggedIn: true,
          user: user,
        },
      };
    }

    return {
      props: {
        loggedIn: false,
      },
    };
  }

  return {
    props: {
      loggedIn: false,
    },
  };
}
