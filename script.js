const DAY_MS = 24 * 60 * 60 * 1000
const ALMOST_DAY_MS = DAY_MS - 1

window.onload = async () => {
    const searchParams = new URLSearchParams(window.location.search)
    const databaseId = searchParams.get('database_id') || process.env.REACT_APP_TEST_DATABASE_ID
    const token = searchParams.get('token') || process.env.REACT_APP_TEST_NOTION_INTEGRATION_TOKEN

    if (!token || !databaseId) {
        console.log('Token and/or Database ID is not provided');
        return;
    }

    const response = await fetch(
        `${process.env.REACT_APP_CORS_EVERYWHERE_URL}/https://api.notion.com/v1/databases/${databaseId}/query`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2021-08-16',
            }
        }
    )

    const database = await response.json()
    console.log(JSON.stringify(database, null, 4))

    const notionColors = {
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

    const events = database.results.map(item => {
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
    }).flat()

    console.log(events)

    const scopes = [...new Set(
        events.map(event => ({
            name: event.scope.name,
            color: event.scope.color,
        }))
    )]

    const chartSeries = events.map(event => ({
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
    }))

    const min = Math.min(...chartSeries.map(s => s.data[0].y[0]))
    const max = Math.max(...chartSeries.map(s => s.data[0].y[1]))
    const offset = (max - min) / 100

    const options = {
        series: chartSeries,
        chart: {
            type: 'rangeBar',
            width: '100%',
            height: '100%',
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
                        icon: '<img src="/reload.svg" width="16">',
                        class: 'custom-icon',
                        index: 0,
                        title: 'Reload',
                        click: () => location.reload()
                    }, {
                        icon: '<img src="/copy.svg" width="16">',
                        class: 'custom-icon copy-url',
                        index: 0,
                        title: 'Copy URL',
                        click: () => {},
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
        colors: scopes.map(s => notionColors[s.color]),
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
            show: false
        },
        stroke: {
            width: 5
        }
    }

    new ApexCharts(
        document.querySelector("#chart"),
        options
    ).render()

    const copyUrl = document.querySelector('.copy-url')
    copyUrl.dataset.clipboardText = location.href

    new ClipboardJS('.copy-url');
}

