import { Button, MenuItem } from '@material-ui/core';
import SearchIcon from '@mui/icons-material/Search';
import { Card, Grid, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import axios from 'axios';
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
};

export default function Rent(props: RentProps) {
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
              <Typography variant="h5">Property to rent in London</Typography>
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
                      toRent: 0,
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
                      toRent: 0,
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

  if (aT || rT) {
    console.log('1');

    if (aT) {
      const userId = await getUserIdByAccessToken(aT);

      if (userId) {
        user = await getUserWith2FaSecretById(userId.userId);
      }
    }
    if (!user) {
      console.log('2');
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
      },
    };
  }

  return {
    props: {
      loggedIn: false,
    },
  };
}
