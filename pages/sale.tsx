import { Button, MenuItem } from '@material-ui/core';
import SearchIcon from '@mui/icons-material/Search';
import { Card, Grid, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import axios from 'axios';
import { config } from 'dotenv-safe';
import { GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useDeferredValue, useMemo, useState } from 'react';
import Header from '../Components/Layout/Header';
import AutocompleteInputBox from '../Components/util/AutocompleteInput';
import {
  getUserIdByAccessToken,
  getUserIdByRefreshToken,
  getUserWith2FaSecretById,
} from '../util/database';

type RentProps = {
  loggedIn: boolean;
  user?: User;
  rapidApiKey: string | undefined;
};

export default function Sale(props: RentProps) {
  const [bedroomSetting, setBedroomSetting] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [autocompleteResult, setAutocompleteResult] = useState<
    AutocompleteSuggestion[]
  >([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedOption, setSelectedOption] =
    useState<AutocompleteSuggestion | null>(null);

  const deferredInput: string = useDeferredValue(searchInput);

  const autocomplete = useMemo(() => {
    if (!props.rapidApiKey) {
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
        data = response.data as AutocompleteObject | undefined;

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
  }, [deferredInput, props.rapidApiKey]);

  console.log(autocomplete);

  return (
    <>
      <Header loggedIn={props.loggedIn} user={props.user} />
      <main
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '5%',
          gap: '20px',
        }}
      >
        <Card style={{ maxWidth: '400px', padding: '2%' }}>
          <Grid container rowSpacing={5}>
            <Grid item xs={12}>
              <Typography variant="h5">Property for sale in London</Typography>
            </Grid>
            <Grid item xs={12}>
              <AutocompleteInputBox
                id="Rent"
                options={autocompleteResult}
                setOptions={setAutocompleteResult}
                value={selectedOption}
                setValue={setSelectedOption}
                setInputValue={setSearchInput}
              />
            </Grid>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                style={{
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
                      toRent: 1,
                    },
                  }}
                >
                  Map
                </Link>
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                style={{ marginLeft: '7%' }}
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
                      toRent: 1,
                    },
                  }}
                >
                  Search
                </Link>
              </Button>
            </Grid>
          </Grid>
        </Card>
        <Image src="/Images/housePainting.jpg" height="600" width="700" />
      </main>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const aT = context.req.cookies.aT;
  const rT = context.req.cookies.rT;
  let user;

  config();

  const rapidApiKey = process.env.RAPIDAPI_KEY;

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
        loggedIn: true,
        user: user,
        rapidApiKey: rapidApiKey,
      },
    };
  }

  return {
    props: {
      loggedIn: false,
      rapidApiKey: rapidApiKey,
    },
  };
}
