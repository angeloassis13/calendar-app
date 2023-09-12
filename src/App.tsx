
import React, { useState } from "react";
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DataGrid, GridColDef, GridValueFormatterParams } from '@mui/x-data-grid';

import './App.css';

type Event = {
  id: string,
  title: string,
  eventTime: string,
}

type Result = {
  events: Event[],
  result: number,
}

function App() {

  const baseURL = "http://localhost:9000";

  const [result, setResult] = useState<Result | null>(null);
  const [startDateQuery, setStartDateQuery] = useState<Date | null>(null);
  const [endDateQuery, setEndDateQuery] = useState<Date | null>(null);

  const getAllEvents = async () => {

    try {
      const res = await fetch(`${baseURL}/calc?` + new URLSearchParams(
        {
          startDate: startDateQuery ? startDateQuery.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          endDate: endDateQuery ? endDateQuery.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        }));

      if (!res.ok) {
        const message = `An error has occurred: ${res.status} - ${res.statusText}`;
        throw new Error(message);
      }

      const data = await res.json();

      setResult(data);
    } catch (err) {
      setResult(err.message);
    }
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'id' },
    { field: 'title', headerName: 'Title', width: 250 },
    {
      field: 'eventTime', headerName: 'Date', width: 450,
      valueFormatter: (params: GridValueFormatterParams<number>) => {
        const dateFormatOptions: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
        const dateFormatted = new Date(params.value).toLocaleTimeString('en-us', dateFormatOptions);
        return dateFormatted;
      },
    },
  ];

  const handleStartDate = (event) => {
    setStartDateQuery(event ? new Date(event) : null);
  }

  const handleEndDate = (event) => {
    setEndDateQuery(event ? new Date(event) : null);
  }

  return (
    <Grid container spacing={3} pt={2} pl={2} pr={2} justifyContent='center' alignItems='center'>
      <Grid item xs={2}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker label="Start date" onChange={handleStartDate} />
        </LocalizationProvider>
      </Grid>
      <Grid item xs={2}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker label="End date" onChange={handleEndDate} />
        </LocalizationProvider>
      </Grid>
      <Grid item xs={8}>
        <Button variant="contained" onClick={getAllEvents}>Get events and calculate</Button>
      </Grid>

      {result && result.events && result.events.length > 0 &&
        <Grid item xs={12}>
          <DataGrid
            columnVisibilityModel={{
              id: false,
            }}
            rows={result.events}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 50]}
          />
          <Alert severity="info">Total (R$): {result.result}</Alert>
        </Grid>
      }
    </Grid>
  );
}

export default App;
