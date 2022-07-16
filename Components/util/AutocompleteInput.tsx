import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { Dispatch, SetStateAction, SyntheticEvent } from 'react';

type AutocompleteInputBoxProps = {
  id: string;
  options: AutocompleteSuggestion[];
  setOptions: Dispatch<SetStateAction<AutocompleteSuggestion[]>>;
  value: AutocompleteSuggestion | null;
  setValue: Dispatch<SetStateAction<AutocompleteSuggestion | null>>;
  setInputValue: Dispatch<SetStateAction<string>>;
  placeholder?: string;
};

export default function AutocompleteInputBox(props: AutocompleteInputBoxProps) {
  return (
    <Autocomplete
      id={props.id}
      getOptionLabel={(option) => option.value}
      filterOptions={(x) => x}
      options={props.options}
      autoComplete
      includeInputInList
      isOptionEqualToValue={(option, value) => option.value === value.value}
      filterSelectedOptions
      value={props.value}
      onChange={(
        event: SyntheticEvent,
        newValue: AutocompleteSuggestion | null,
      ) => {
        props.setOptions(
          newValue ? [newValue, ...props.options] : props.options,
        );
        props.setValue(newValue);
      }}
      onInputChange={(event: SyntheticEvent, newInputValue) => {
        props.setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.placeholder ? props.placeholder : 'Enter a city or town'}
          fullWidth
        />
      )}
      renderOption={(liProps, option) => {
        return (
          <li {...liProps}>
            <Grid container alignItems="center">
              <Grid item>
                <Box component={LocationOnIcon} />
              </Grid>
            </Grid>
            <Grid item>{option.value}</Grid>
          </li>
        );
      }}
    />
  );
}
