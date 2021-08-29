import React, { useEffect, useState, useMemo } from 'react'
import ApexChart from 'react-apexcharts'
import copyToClipboard from 'copy-to-clipboard'
import Color from 'color-js'
import './App.css'

const DAY_MS = 24 * 60 * 60 * 1000
const ALMOST_DAY_MS = DAY_MS - 1

const notionColorsDark = {
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

function isDatabaseItemValid(item) {
  return (
    (item.properties['Scope'].multi_select || item.properties['Scope'].select) &&
    item.properties['Event'].title && item.properties['Event'].title[0] && item.properties['Event'].title[0].text &&
    item.properties['Date'].date &&
    (!item.properties['Ongoing'] || item.properties['Ongoing'].checkbox) &&
    (!item.properties['Group'] || item.properties['Group'].select)
  )
}

export function App() {
  const [entries, setEntries] = useState([])
  const [isFailed, setIsFailed] = useState(false)

  const searchParams = new URLSearchParams(window.location.search)
  const databaseId = searchParams.get('database_id') || process.env.REACT_APP_TEST_DATABASE_ID
  const token = searchParams.get('token') || process.env.REACT_APP_TEST_NOTION_INTEGRATION_TOKEN

  const [[width, height], setSize] = useState([800, 300])

  useEffect(() => {
    const update = () => {
      setSize([window.innerWidth, window.innerHeight])
    }
    
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  
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
      .then((database) => {
        if (!database.results || !database.results.some(isDatabaseItemValid)) {
          setIsFailed(true)
          return
        }

        setEntries(database.results)
      })
  }, [databaseId, token])

  const events = useMemo(() => entries.map(item => {
    if (!isDatabaseItemValid(item)) {
      console.log('Invalid database item:', JSON.stringify(item, null, 2))
      return []
    }

    const name = item.properties['Event'].title[0].text.content
    const scopes = item.properties['Scope'].multi_select
      ? item.properties['Scope'].multi_select.map(s => ({
        name: s.name,
        color: s.color,
      }))
      : [{
        name: item.properties['Scope'].select.name,
        color: item.properties['Scope'].select.color,
      }]

    return scopes.map(scope => ({
      scope,
      scopes,
      name,
      startDate: item.properties['Date'].date.start,
      endDate: item.properties['Date'].date.end,
      ongoing: item.properties['Ongoing']?.checkbox ?? false,
      group: {
        name: item.properties['Group']?.select.name ?? scope.name,
        color: item.properties['Group']?.select.color ?? scope.color,
      }
    }))
  }).flat(), [entries])

  const groupedEvents = useMemo(() => {
    const map = new Map()

    for (const event of events) {
      if (map.has(event.group.name)) {
        continue
      }

      map.set(event.group.name, events.filter(e => e.group.name === event.group.name))
    }

    return map
  }, [events])

  const chartSeries = useMemo(() => [...groupedEvents.entries()].map(([name, events]) => {
    return {
      events,
      name,
      data: events.map(event => ({
        event,
        fillColor: notionColorsDark[event.group.color],
        strokeColor: Color(notionColorsDark[event.group.color]).lightenByRatio(0.5).toCSS(),
        x: event.scope.name,
        y: [
          Date.parse(event.startDate),
          event.ongoing
            ? (Date.now() + ALMOST_DAY_MS)
            : event.endDate
              ? (Date.parse(event.endDate) + ALMOST_DAY_MS)
              : (Date.parse(event.startDate) + ALMOST_DAY_MS),
        ]
      }))
    }
  }), [groupedEvents])

  const [min, max] = useMemo(() => [
    Math.min(...chartSeries.map(s => s.data[0].y[0])) || Date.now(),
    Math.max(...chartSeries.map(s => s.data[0].y[1])) || Date.now(),
  ], [chartSeries])

  const offset = Math.max((max - min) / 100, DAY_MS * 7)

  if (!databaseId || !token) {
    return <div>Database ID and/or Notion token is not provided</div>
  }

  if (isFailed) {
    return <div>The database is not supported by this widget</div>
  }

  return <>
    <ApexChart
      className="chart"
      type="rangeBar"
      width={width - 20}
      height={height - 20}
      options={{
        chart: {
          toolbar: {
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
                class: 'custom-icon',
                index: 0,
                title: 'Copy URL',
                click: () => copyToClipboard(window.location.href),
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
          formatter: (_, { seriesIndex, dataPointIndex }) => {
            const event = chartSeries[seriesIndex].data[dataPointIndex].event

            const [startDate, endDate] = chartSeries[seriesIndex].data[dataPointIndex].y || []
            const days = Math.ceil((endDate - startDate) / DAY_MS)
            const duration = ' (' + days + (days > 1 ? " days" : " day") + ')'

            return event.name + (event.endDate ? duration : '')
          },
        },
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
          width: 2,
        },
        tooltip: {
          custom: ({ seriesIndex, dataPointIndex }) => {
            const event = chartSeries[seriesIndex].data[dataPointIndex].event

            const [startDate, endDate] = chartSeries[seriesIndex].data[dataPointIndex].y || []
            const days = Math.ceil((endDate - startDate) / DAY_MS)
            const duration = ' (' + days + (days > 1 ? " days" : " day") + ')'

            return `<div class="chart__tooltip">
              <p class="chart__tooltip-primary-text">${event.name}${event.endDate ? duration : ''}</p>
              <p class="chart__tooltip-secondary-text">${event.startDate}${event.endDate ? ` - ${event.endDate}` : ''}</p>
            </div>`
          }
        },
        grid: {
          show: true,
          borderColor: '#FFFFFF22',
          xaxis: {
            lines: {
              show: true
            }
          },
          yaxis: {
            lines: {
              show: true
            }
          },
        }
      }}
      series={chartSeries}
    />
  </>;
}
