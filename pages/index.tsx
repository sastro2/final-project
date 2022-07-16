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
import Select from '@mui/material/Select';
import axios from 'axios';
import Cookies from 'cookies';
import { GetServerSidePropsContext } from 'next';
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
        'X-RapidAPI-Key': '87a3223e12mshecbd30f5c87c23bp1912e3jsn7ff93b3e0f99',
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

  console.log(autocompleteResult);

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
              </Select>
            </Grid>
            <Grid item xs={3} md={2} lg={1}>
              <Select
                labelId="bedrooms-setting-select-label"
                label="Price"
                placeholder="Price"
                value={maxPrice}
                onChange={(event) => {
                  setMaxPrice(+event.target.value);
                }}
              >
                <MenuItem value={0}>any</MenuItem>
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={4}>4</MenuItem>
                <MenuItem value={5}>5</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={10} style={{ marginBottom: '1%' }}>
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
            marginBottom: '2%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Stack>
            <Typography variant="h4">In the city</Typography>
            <Typography variant="subtitle1">
              Live among the hustle and bustle
            </Typography>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          style={{
            marginBottom: '2%',
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
                  value: selectedOption ? selectedOption.value : 'London',
                  identifier: selectedOption
                    ? selectedOption.identifier
                    : 'london',
                  beds: bedroomSetting,
                  price: maxPrice,
                  toRent: selectedTab,
                },
              }}
              style={{ cursor: 'pointer' }}
            >
              <div>
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
                  value: selectedOption ? selectedOption.value : 'London',
                  identifier: selectedOption
                    ? selectedOption.identifier
                    : 'london',
                  beds: bedroomSetting,
                  price: maxPrice,
                  toRent: selectedTab,
                },
              }}
              style={{ cursor: 'pointer' }}
            >
              <div>
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
                  value: selectedOption ? selectedOption.value : 'London',
                  identifier: selectedOption
                    ? selectedOption.identifier
                    : 'london',
                  beds: bedroomSetting,
                  price: maxPrice,
                  toRent: selectedTab,
                },
              }}
              style={{ cursor: 'pointer' }}
            >
              <div>
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
            marginBottom: '2%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Stack>
            <Typography variant="h4">On the coast</Typography>
            <Typography variant="subtitle1">
              Wake up to fresh air and sea views
            </Typography>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          style={{
            marginBottom: '2%',
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
              <div>
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
              <div>
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
              <div>
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
            marginBottom: '2%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Stack>
            <Typography variant="h4">Rural and countryside</Typography>
            <Typography variant="subtitle1">
              Enjoy living close to nature
            </Typography>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          style={{
            marginBottom: '2%',
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
              <div>
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
              <div>
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
              <div>
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
            marginBottom: '2%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Stack>
            <Typography variant="h4">Popular locations</Typography>
            <Typography variant="subtitle1">
              Move to a property hotspot
            </Typography>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          style={{
            marginBottom: '2%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Stack>
            <ArrowCircleRightIcon />
            <Typography>
              Glasgow properties {selectedTab === 0 ? 'to rent' : 'for sale'}
            </Typography>
            <ArrowCircleRightIcon />
            <Typography>
              Birmingham properties {selectedTab === 0 ? 'to rent' : 'for sale'}
            </Typography>
            <ArrowCircleRightIcon />
            <Typography>
              Sheffield properties {selectedTab === 0 ? 'to rent' : 'for sale'}
            </Typography>
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
