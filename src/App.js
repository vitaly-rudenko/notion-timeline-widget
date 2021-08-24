import React, { useMemo, useState } from 'react'
import { DataGrid } from '@material-ui/data-grid';
import ReactCalendarTimeline from 'react-calendar-timeline'
import { Timeline } from 'react-svg-timeline'
import 'react-calendar-timeline/lib/Timeline.css'

const exampleEvents = [{
  date: '2021-01-01',
  name: 'New Year',
}, {
  date: '2021-04-14',
  name: 'Birthday',
  scope: 'personal',
}, {
  startDate: '2021-05-17',
  name: 'Affinidi',
  scope: 'work',
}, {
  startDate: '2021-08-26',
  endDate: '2021-08-27',
  name: 'Hackathon',
  scope: 'work',
}].map((event, i) => ({ id: `${event}-${i}`, scope: 'global', ...event }))

const COLORS = [
  'aqua',
  'black',
  'red',
  'yellow',
  'green'
]

const columns = [{
  field: 'name',
  headerName: 'Name',
  editable: true,
  width: 200,
}, {
  field: 'scope',
  headerName: 'Scope',
  editable: true,
  width: 200,
}, {
  field: 'date',
  headerName: 'Date',
  type: 'date',
  editable: true,
  width: 200,
}, {
  field: 'startDate',
  headerName: 'Start Date',
  type: 'date',
  editable: true,
  width: 200,
}, {
  field: 'endDate',
  headerName: 'End Date',
  type: 'date',
  editable: true,
  width: 200,
}]

export function App() {
  const [events, setEvents] = useState(exampleEvents)
    
  const scopes = useMemo(() => [...new Set(events.map(event => event.scope))], [events])

  const timelineLanes = useMemo(() => scopes
    .map((scope, i) => ({
      laneId: scope,
      label: scope,
      color: COLORS[i % COLORS.length],
    })), [scopes])

  const timelineEvents = useMemo(() => events.map(event => ({
    eventId: event.name,
    tooltip: event.name,
    laneId: event.scope,
    color: timelineLanes.find(lane => lane.laneId === event.scope).color,
    ...event.date
      ? { startTimeMillis: Date.parse(event.date) }
      : {
        startTimeMillis: Date.parse(event.startDate),
        endTimeMillis: event.endDate
          ? Date.parse(event.endDate)
          : Date.now(),
      },
  })), [events, timelineLanes])

  const timelineGroups = useMemo(() => scopes.map(scope => ({
    id: scope,
    title: scope,
  })), [scopes])

  const timelineItems = useMemo(() => events.map(event => ({
    id: event.name,
    group: event.scope,
    ...event.date
      ? { start_time: new Date(event.date), end_time: new Date(Date.parse(event.date) + 24 * 60 * 60 * 1000) }
      : {
        start_time: new Date(event.startDate),
        end_time: event.endDate
          ? new Date(event.endDate)
          : new Date(),
      },
  })), [events])

  return <>
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={events}
        columns={columns}
        onCellEditCommit={(params) => {
          const index = events.findIndex(event => event.id === params.id)
          const event = events[index]
          const updatedEvents = [...events]
          updatedEvents.splice(index, 1, { ...event, [params.field]: params.value })

          setEvents(updatedEvents)
        }}
      />
    </div>
    <Timeline
      width={window.innerWidth}
      height={400}
      events={timelineEvents}
      lanes={timelineLanes}
      trimRange={[
        Math.min(...events.map(e => Date.parse(e.date || e.startDate || e.endDate))),
        Math.max(...events.map(e => Date.parse(e.endDate || e.startDate || e.date))),
      ]}
      dateFormat={ms => new Date(ms).toLocaleString()}
    />
    <br/>
    <ReactCalendarTimeline
      groups={timelineGroups}
      items={timelineItems}
      minZoom={365.24 * 86400 * 1000}
      maxZoom={365.24 * 86400 * 1000}
      timeSteps={{
        day: 0,
        hour: 0,
        month: 1,
        second: 0,
        minute: 0,
        year: 1,
      }}
      defaultTimeStart={new Date(
        Math.min(...timelineItems.map(e => e.start_time.getTime())) - 24 * 60 * 60 * 1000
      )}
      defaultTimeEnd={
        new Date(Math.max(...timelineItems.map(e => e.end_time.getTime())) + 24 * 60 * 60 * 1000
      )}
    />
  </>;
}
