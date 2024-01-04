import { useEffect, useMemo, useState } from "react";

function countdownDhms(now: Date, kickoffTime: Date, kickoffDoneTime: Date) {
    let diff = (kickoffTime.getTime() - now.getTime());
    let d, h, m, s;

    if (diff <= 0) {
        diff = (kickoffDoneTime.getTime() - (new Date()).getTime());
        if (diff <= 0) {
            return "We hope you enjoyed kickoff! Good luck this season!"
        } else {
            return "It's kickoff time!";
        }
    } else {
        //Knock off milliseconds
        diff = Math.floor(diff / 1e3);
        s = diff % 60;

        //Knock off seconds
        diff = Math.floor(diff / 60);
        m = diff % 60;

        //Knock off minutes
        diff = Math.floor(diff / 60);
        h = diff % 24;

        //Knock off hours
        d = Math.floor(diff / 24);

        return `${d}d ${h}h ${m}m ${s}s`;
    }
}

export interface EventTime {
    startTime: Date;
    endTime: Date;
}

export default function Countdown({ startTime, endTime }: EventTime) {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 500);
        return () => clearInterval(interval);
    }, []);

    const countdownMessage = useMemo(
        () => countdownDhms(now, startTime, endTime),
        [now, startTime, endTime]
    );

    return <p className="fs-3 text-center">{countdownMessage}</p>;
}