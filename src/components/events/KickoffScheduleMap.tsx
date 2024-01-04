import { useMemo, useState } from "react";
import type { Agenda } from "./DayAgenda";
import DayAgenda from "./DayAgenda";

export interface KickoffSchedule {
    teamBreakoutRoom(teamNumber: number): string|null;
    teamAgenda(teamNumber: number|null): Agenda;
    teamName(teamNumber: number): string|null;
}

export function isTeamNumber(input: string): boolean {
    return input.trim().match(/^[0-9]{1,5}$/) !== null;
}

namespace Frc {
    const mapMarkers: Agenda["markers"] = {
        BEYSTER: {
            lat: 42.292873159142594,
            long: -83.71631648906802,
            icon: "fa-people-line",
            title: "Beyster Building"
        },
        STAMPS: {
            lat: 42.29210183926731,
            long: -83.71690565127908,
            icon: "fa-eye",
            title: "Stamps Auditorium"
        },
        DOW: {
            lat: 42.292972602133744,
            long: -83.71542869990924,
            icon: "fa-d",
            title: "Kit distribution & DOW Breakout Rooms"
        },
    };

    const breakoutRoomMarkers: Agenda["markers"] = {
        DOW: {
            lat: 42.292972602133744,
            long: -83.71542869990924,
            icon: "fa-d",
            title: "Kit distribution & DOW Breakout Rooms"
        },
        EECS: {
            lat: 42.29251688394525,
            long: -83.71458884571464,
            icon: "fa-e",
            title: "EECS Breakout Rooms"
        }
    };

    const eventTime = {
        startTime: new Date("2024-01-06 08:00:00 EST"),
        startDate: new Date("2024-01-06 00:00:00 EST"),
        endTime: new Date("2024-01-06 15:00:00 EST")
    };

    const teamInfo: {[team: number]: {name: string, breakout: string}} = {
        "9182": {name: "Tech Tr1be", breakout: "DOW 1018"},
        "5708": {name: "Zebrotics", breakout: "DOW 1010"},
        "3773": {name: "Arrowhead Robotics", breakout: "EECS 1005"},
        "9672": {name: "Colon Magi Robotics", breakout: "EECS 1008"},
        "5530": {name: "Greenhills Lawnmowers", breakout: "EECS 1311"},
        "7174": {name: "Charger Robotics", breakout: "EECS 1500"},
        "8427": {name: "Robo Ravens", breakout: "EECS 1500"},
        "830": {name: "The RatPack", breakout: "DOW 1013"},
        "7191": {name: "Gator Nation Innovators", breakout: "EECS 1003"},
        "8297": {name: "WIHI Robo Wolves", breakout: "DOW 1017"},
        "3568": {name: "Linden RoboEagles", breakout: "EECS 1200"},
        "4405": {name: "The Atoms Family", breakout: "EECS 1303"},
        "5067": {name: "Steiner Steel Storm", breakout: "EECS 1012"}
    };

    export const schedule: KickoffSchedule = {
        teamBreakoutRoom(teamNumber) {
            return teamInfo[teamNumber]?.breakout ?? null;
        },
        teamName(teamNumber) {
            return teamInfo[teamNumber]?.name ?? null;
        },
        teamAgenda(teamNumber) {
            const room = teamNumber ? schedule.teamBreakoutRoom(teamNumber) : null;
            let thisBreakoutMarkers = {...mapMarkers};
            let breakoutRoomFound = null;
            for (const [breakoutRoomCode, marker] of Object.entries(breakoutRoomMarkers)) {
                if (room != null && room.includes(breakoutRoomCode)) {
                    thisBreakoutMarkers[breakoutRoomCode] = marker;
                    breakoutRoomFound = breakoutRoomCode;
                    break;
                }
            }
            if (breakoutRoomFound === null) {
                // If no specific breakout room available, show all of them
                thisBreakoutMarkers = {...thisBreakoutMarkers, ...breakoutRoomMarkers};
            }
            const events: Agenda["events"] = [
                {
                    startMins: 8 * 60, // 8 AM
                    endMins: 11 * 60, // 11 AM
                    activity: "Check-in / Org Fair",
                    icon: "fa-people-line",
                    location: "Beyster Building",
                    locationMarkerCode: "BEYSTER"
                },
                {
                    startMins: 9 * 60, // 9 AM
                    endMins: 11 * 60, // 11 AM
                    activity: "Robotics Program Information Session",
                    icon: "fa-graduation-cap",
                    location: "BEYSTER 1670",
                    locationMarkerCode: "BEYSTER",
                    startColumn: 1,
                    endColumn: 1,
                    indent: 1
                },
                {
                    startMins: 9 * 60, // 9 AM
                    endMins: 11 * 60, // 11 AM
                    activity: "North Campus Tours",
                    icon: "fa-map-location-dot",
                    startColumn: 2,
                    endColumn: 2,
                    indent: 1
                },
                {
                    startMins: 11 * 60, // 11 AM
                    endMins: 12 * 60, // 12 PM
                    activity: "Guest Speaker / Ri3D Showcase",
                    icon: "fa-eye",
                    location: "Stamps Auditorium",
                    locationMarkerCode: "STAMPS"
                },
                {
                    startMins: 12 * 60, // 12 PM
                    endMins: 12.75 * 60, // 12:45 PM
                    activity: "Kickoff Broadcast",
                    icon: "fa-eye",
                    location: "Stamps Auditorium",
                    locationMarkerCode: "STAMPS"
                },
                {
                    startMins: 12.75 * 60, // 12:45 PM
                    endMins: 16 * 60, // 4 PM
                    activity: "Breakout Rooms",
                    icon: "fa-people-group",
                    startColumn: 1,
                    endColumn: 1,
                    ...(room && breakoutRoomFound ? {
                        location: room,
                        locationMarkerCode: breakoutRoomFound,
                        icon: breakoutRoomMarkers[breakoutRoomFound]!.icon
                    } : {})
                },
                {
                    startMins: 12.75 * 60, // 12:45 PM
                    endMins: 16 * 60, // 4 PM
                    activity: "Kit Distribution",
                    icon: "fa-d",
                    location: "DOW 1014",
                    locationMarkerCode: "DOW",
                    startColumn: 2,
                    endColumn: 2
                }
            ];
            
            return {
                startTime: eventTime.startDate.getTime(),
                events,
                markers: thisBreakoutMarkers
            };
        },
    }
}

// These are declared here rather than in kickoff.astro because Astro can't transport functions declared server-side to client-side hydration.
// We rely on functions to build agendas, find names, and find breakout rooms.
const schedules = {
    frc: Frc.schedule
};

export default function KickoffScheduleMap({ schedule }: { schedule: keyof typeof schedules }) {
    const { teamAgenda, teamName, teamBreakoutRoom } = schedules[schedule];

    const [teamInput, setTeamInput] = useState('');
    const team = useMemo(() => isTeamNumber(teamInput) ? parseInt(teamInput) : null, [teamInput])

    const agenda = useMemo(() => teamAgenda(team), [team, teamAgenda]);
    const name = useMemo(() => team == null ? null : teamName(team), [team, teamName]);
    const breakout = useMemo(() => team == null ? null : teamBreakoutRoom(team), [team, teamBreakoutRoom]);

    return <section className="container text-center">
        <div className="row">
            <div className="col">
                <label htmlFor="team-entry" className="form-label lead">Enter your team number to see your personalized breakout room.</label>
                <input type="number" min="1" max="9999" placeholder="Team number..." maxLength={8}
                    className="form-control form-control-lg" id="team-entry" value={teamInput} onChange={x => setTeamInput(x.target.value)} />
                {name && breakout && <p className="mt-1">Welcome, <b>{name}</b>! Your breakout room is <b>{breakout}</b>.</p>}
            </div>
        </div>
        <div className="row my-4">
            <DayAgenda {...agenda} />
        </div>
    </section>
}