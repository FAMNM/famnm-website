import { useCallback, useMemo, useRef, useState, type KeyboardEventHandler } from "react";
import EventMap from "./EventMap";
import mapboxgl from "mapbox-gl";

export interface Agenda {
    startTime: number;
    events: {
        startMins: number;
        endMins: number;
        activity: string;
        icon?: string;
        location?: string;
        locationMarkerCode?: string;
        // If multiple events occupy the same space, we can place them side-by-side
        // We have 2 columns standard
        startColumn?: number; // Default: 1
        endColumn?: number; // Default: 2
        // We should also indent them
        indent?: number; // Default: 0 (level)
    }[];
    markers: {[code: string]: {
        lat: number;
        long: number;
        title: string;
        icon: string;
    }};
}

const kHeightMultiplier = 1.6;

export default function DayAgenda(props: Agenda) {
    if (props === undefined) return null;
    const { events, startTime, markers } = props;
    const map = useRef<mapboxgl.Map | null>(null);

    const uniqueTimes = new Set(events.flatMap(i => [i.startMins, i.endMins]));
    const uniqueTimesSorted = Array.from(uniqueTimes).sort();
    const cellSizes = pairwiseDiff(uniqueTimesSorted);
    const minTime = uniqueTimesSorted[0]!;
    const maxTime = uniqueTimesSorted[uniqueTimesSorted.length - 1]!;

    // For testing only
    // const [now, setNow] = useState<Date>(new Date("2024-01-06 09:50:04 EST"));

    const [now, setNow] = useState<Date>(new Date());
    useRef(setInterval(() => {
        setNow(new Date());
    }, 1000 * 30));
    
    const styles: {[name: string]: React.CSSProperties} = {
        scheduleContainer: {
            display: 'grid',
            gridTemplateColumns: `9ch 1fr 1fr`,
            gap: '4px',
            position: 'relative',
            marginBottom: '0.5rem',
            gridTemplateRows: cellSizes.map(size => `${size * kHeightMultiplier}px`).join(' ')
        }
    };

    const focusLocation = useCallback((locationMarkerCode: string) => {
        const { long, lat } = markers[locationMarkerCode]!;
        map.current?.easeTo({
            center: [long, lat],
            zoom: 18
        });
    }, [map, markers]);

    function buildEvent(event: typeof events[number], i: number) {
        const startColumn = (event.startColumn ?? 1) + 1;
        const endColumn = (event.endColumn ?? 2) + 2;
        const startRow = uniqueTimesSorted.indexOf(event.startMins) + 1;
        const endRow = uniqueTimesSorted.indexOf(event.endMins) + 1;
        const leftIndent = (event.startColumn ?? 1) === 1 ? (event.indent ?? 0) * 8 : 0;
        const rightIndent = (event.startColumn ?? 1) === 2 ? (event.indent ?? 0) * 4 : 0;

        const onKeyDown: KeyboardEventHandler<HTMLDivElement>|undefined = event.location === undefined ? undefined : (evt => {
            if (evt.key === ' ') {
                evt.preventDefault();
                focusLocation(event.locationMarkerCode!);
            }
        });

        return <div style={{
            marginLeft: `${leftIndent}px`,
            marginRight: `${rightIndent}px`,
            gridRow: `${startRow} / ${endRow}`,
            gridColumn: `${startColumn} / ${endColumn}`,
        }} key={i}>
            <div className={`event event-indent-${event.indent ?? 0}`}>
                {event.icon && <><i className={`fa-solid ${event.icon}`} />&nbsp;</>}
                <strong className="fw-bold">{event.activity}</strong>
                {event.location && <>
                    <div className="text-location" tabIndex={0}
                        onKeyDown={onKeyDown}
                        onClick={event.location !== undefined ? (() => focusLocation(event.locationMarkerCode!)) : undefined}>
                        {event.location}
                    </div>
                </>}
            </div>
        </div> 
    }

    function renderTimeBar(date: Date) {
        const msSinceMidnight = date.getTime() - startTime;
        const minutesSinceMidnight = msSinceMidnight / 1000 / 60;
        if (minutesSinceMidnight < minTime || minutesSinceMidnight > maxTime) {
            return null;
        }
        const minutesSinceStart = minutesSinceMidnight - minTime;
        const pixelsFromTop = minutesSinceStart * kHeightMultiplier - 1;
        return <div className="event-time-bar" style={{top: `${pixelsFromTop}px`}}></div>
    }


    return <>
        <div className="col-12 col-md-6 col-lg-5">
            <h2 className="mb-4">Schedule</h2>
            <div style={styles.scheduleContainer}>
                {renderTimeBar(now)}
                {uniqueTimesSorted.map((time, i) =>
                    <div style={{gridRow: i+1, gridColumn: '1/-1'}} className="event-time-container" key={time}>
                        <div className="event-time">{formatTime(time)}</div>
                        <div className="event-time-divider"></div>
                    </div>)}
                {events.map(buildEvent)}
            </div>
        </div>
        <div className="col-12 col-md-6 col-lg-7 d-flex flex-column">
            <h2>Map</h2>
            <EventMap markers={Object.values(markers)} mapRef={map} />
        </div>
    </>;
}

function pairwiseDiff(risingArray: number[]): number[] {
    const output: number[] = [];
    for (let i = 0; i < risingArray.length - 1; ++i) {
        output.push(risingArray[i + 1]! - risingArray[i]!);
    }
    return output;
}

function formatTime(minsSinceMidnight: number) {
    function padZero(str: string) {
        while (str.length < 2) {
            str = "0" + str;
        }
        return str;
    }
    const hour = Math.floor(minsSinceMidnight / 60);
    const hourString = padZero(((hour + 11) % 12 + 1).toString());
    const minuteString = padZero((minsSinceMidnight % 60).toString());
    return `${hourString}:${minuteString} ${hour < 12 ? 'AM' : 'PM'}`;
}