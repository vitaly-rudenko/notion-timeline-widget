import React, { useEffect, useState, useMemo } from 'react'
import ApexChart from 'react-apexcharts'
import './App.css'

const DAY_MS = 24 * 60 * 60 * 1000
const ALMOST_DAY_MS = DAY_MS - 1

const notionColorsDark = {
  // for light mode
  // default: '#E6E6E5',
  // gray: '#D7D7D6',
  // brown: '#E5D8D0',
  // orange: '#F9E1D4',
  // yellow: '#F9EED8',
  // green: '#D8E8E2',
  // blue: '#D5E4F7',
  // purple: '#DFD4F7',
  // pink: '#F5D5E5',
  // red: '#FBD6D5',
  default: '#505558',
  gray: '#6b6f71',
  brown: '#695c55',
  orange: '#917448',
  yellow: '#9f904d',
  green: '#487871',
  blue: '#497088',
  purple: '#6d5a90',
  pink: '#924d75',
  red: '#a05d59',
}

export function App() {
  const [entries, setEntries] = useState([])

  const searchParams = new URLSearchParams(window.location.search)
  const databaseId = searchParams.get('database_id') || process.env.REACT_APP_TEST_DATABASE_ID
  const token = searchParams.get('token') || process.env.REACT_APP_TEST_NOTION_INTEGRATION_TOKEN

  useEffect(() => {
    if (!databaseId || !token) return

    fetch(
      `${process.env.REACT_APP_CORS_EVERYWHERE_URL}/https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': '2021-08-16',
        }
      }
    )
      .then(response => response.json())
      .then(database => setEntries(database.results))
  }, [databaseId, token])

  const events = useMemo(() => entries.map(item => {
    const scopes = item.properties['Scope'].multi_select
      .map(s => ({
        name: s.name,
        color: s.color,
      }))

    return scopes.map(scope => ({
      scope,
      scopes,
      name: item.properties['Name'].title[0].text.content,
      startDate: item.properties['Date'].date.start,
      endDate: item.properties['Date'].date.end,
      ongoing: item.properties['Ongoing']?.checkbox ?? false,
    }))
  }).flat(), [entries])

  const scopes = useMemo(() => [...new Set(
    events.map(event => ({
      name: event.scope.name,
      color: event.scope.color,
    }))
  )], [events])

  const chartSeries = useMemo(() => events.map(event => ({
    name: `${event.name} (${event.scopes.map(s => s.name).join(', ')})`,
    data: [{
      x: event.scope.name,
      y: [
        Date.parse(event.startDate),
        event.ongoing
          ? (Date.now() + ALMOST_DAY_MS)
          : event.endDate
            ? (Date.parse(event.endDate) + ALMOST_DAY_MS)
            : (Date.parse(event.startDate) + ALMOST_DAY_MS)
      ]
    }]
  })), [events])

  const [min, max] = useMemo(() => [
    Math.min(...chartSeries.map(s => s.data[0].y[0])) || (Date.now() - DAY_MS),
    Math.max(...chartSeries.map(s => s.data[0].y[1])) || (Date.now() + DAY_MS),
  ], [chartSeries])

  const offset = (max - min) / 100

  if (!databaseId || !token) {
    return <div>Database ID and/or Notion token is not provided</div>
  }

  return <>
    <ApexChart
      type="rangeBar"
      width="100%"
      height="100%"
      options={{
        chart: {
          toolbar: {
            offsetX: '-100%',
            tools: {
              download: false,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              customIcons: [{
                icon: `<img src="${process.env.PUBLIC_URL}/reload.svg" width="16">`,
                class: 'custom-icon',
                index: 0,
                title: 'Reload',
                click: () => window.location.reload()
              }, {
                icon: `<img src="${process.env.PUBLIC_URL}/copy.svg" width="16">`,
                class: 'custom-icon copy-url',
                index: 0,
                title: 'Copy URL',
                click: () => { },
              }]
            }
          }
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        dataLabels: {
          enabled: true,
          formatter: ([startDate, endDate], info) => {
            const days = Math.ceil((endDate - startDate) / DAY_MS)
            const label = days + (days > 1 ? " days" : " day")

            const series = chartSeries[info.seriesIndex]
            return series ? `${series.name}: ${label}` : label
          },
        },
        colors: scopes.map(s => notionColorsDark[s.color]),
        theme: {
          palette: 'palette1',
          mode: 'dark',
        },
        xaxis: {
          type: "datetime",
          min: min - offset,
          max: max + offset,
        },
        legend: {
          show: false,
        },
        stroke: {
          width: 5,
        }
      }}
      series={chartSeries}
    />
  </>;
}
