import { useRef, useState } from "react";
import EventMap from "./EventMap";

export interface Agenda {
    startTime: number;
    events: {
        startMins: number;
        endMins: number;
        activity: string;
        icon?: string;
        location?: string;
    }[];
    markers: {
        lat: number;
        long: number;
        title: string;
        icon: string;
    }[];
}

const kHeightMultiplier = 2;

export default function DayAgenda(props: Agenda) {
    if (props === undefined) return null;
    const { events, startTime, markers } = props;

    const uniqueTimes = new Set(events.flatMap(i => [i.startMins, i.endMins]));
    const uniqueTimesSorted = Array.from(uniqueTimes).sort();
    const cellSizes = pairwiseDiff(uniqueTimesSorted);
    const minTime = uniqueTimesSorted[0]!;
    const maxTime = uniqueTimesSorted[uniqueTimesSorted.length - 1]!;

    const [now, setNow] = useState<Date>(new Date());
    const nowUpdater = useRef(setInterval(() => {
        setNow(new Date());
    }, 1000 * 30));

    const styles: {[name: string]: React.CSSProperties} = {
        scheduleContainer: {
            display: 'grid',
            gridTemplateColumns: `10ch auto`,
            gap: '4px',
            position: 'relative',
            marginBottom: '0.5rem',
            gridTemplateRows: cellSizes.map(size => `${size * kHeightMultiplier}px`).join(' ')
        }
    };

    function buildEvent(event: typeof events[number], i: number) {
        return <div className="event" style={{gridRow: uniqueTimesSorted.indexOf(event.startMins) + 1, gridColumn: 2}} key={i}>
            {event.icon && <><i className={`fa-solid ${event.icon}`} />&nbsp;</>}
            <strong className="fw-bold">{event.activity}</strong>
            {event.location && <><br />{event.location}</>}
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
        <div className="col-12 col-md-4">
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
        <div className="col-12 col-md-8 d-flex flex-column">
            <h2>Map</h2>
            <EventMap markers={markers} />
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