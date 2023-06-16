import { useEffect, useRef, useState } from 'react';
import backendUrl from './backendUrl';
import exhaustivenessCheck from './exhaustivenessCheck';
import overrideSubmit from './onSubmit';

interface Member {
  uniqname: string;
  active: boolean;
  last_semester: number;
  this_semester: number;
  mentor: boolean | null;
}

interface Meeting {
  id: number;
  meeting_type: string;
  meeting_date: string;
  attendees: string[];
}

interface MemberRowProps {
  member: Member;
}

function MemberRow(props: MemberRowProps) {
  const { member } = props;

  let mentorEmoji: '❓' | '✅' | '🚫';
  if (member.mentor === null) {
    mentorEmoji = '❓';
  } else if (member.mentor === true) {
    mentorEmoji = '✅';
  } else if (member.mentor === false) {
    mentorEmoji = '🚫';
  } else {
    exhaustivenessCheck(member.mentor);
  }

  return (
    <tr>
      <th>
        {member.uniqname}
      </th>
      <td>
        {member.active ? '✅' : '🚫'}
      </td>
      <td>
        {member.this_semester}
      </td>
      <td>
        {member.last_semester}
      </td>
      <td>
        {mentorEmoji}
      </td>
    </tr>
  );
}

interface MeetingRowProps {
  meeting: Meeting;
}

function MeetingRow(props: MeetingRowProps) {
  const { meeting } = props;

  const monthIdxToString = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'June',
    'July',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const date = new Date(meeting.meeting_date);
  const dateString = `${monthIdxToString[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;

  let attendeeString = '';
  meeting.attendees.forEach((attendee, i) => {
    if (i !== meeting.attendees.length - 1) {
      attendeeString += `${attendee}, `;
    } else {
      attendeeString += attendee;
    }
  });

  return (
    <tr>
      <th>
        {dateString}
      </th>
      <td>
        {meeting.meeting_type}
      </td>
      <td>
        {attendeeString}
      </td>
    </tr>
  );
}

export default function ViewAttendance() {
  const [showNonActive, setShowNonActive] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);

  const [uniqnameSearch, setUniqnameSearch] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const uniqnameSearchField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      const response = await fetch(`${backendUrl}/member`);

      if (!response.ok) {
        // TODO: Catch error and display error message
        throw Error(response.statusText);
      }

      setMembers(await response.json());
    };

    const fetchMeetings = async () => {
      const response = await fetch(`${backendUrl}/meeting`);

      if (!response.ok) {
        // TODO: Catch error and display error message
        throw Error(response.statusText);
      }

      setMeetings(await response.json());
    };

    fetchMembers();
    fetchMeetings();
  }, []);

  // Show Non-Active Button
  const showNonActiveButton = showNonActive ? 'Hide Non-Active' : 'Show Non-Active';

  const toggleNonAcitve = () => {
    setShowNonActive((oldShowNonActive) => !oldShowNonActive);
  };

  // Members table
  const displayedMembers = members.filter((member) => {
    if (!member.active && !showNonActive) {
      return false;
    } else if (member.last_semester === 0 && member.this_semester === 0) {
      return false;
    }

    return true;
  });

  displayedMembers.sort((a, b) => {
    if (a.this_semester !== b.this_semester) {
      return b.this_semester - a.this_semester;
    } else if (a.last_semester !== b.last_semester) {
      return b.last_semester - a.last_semester;
    } else if (a.mentor && !b.mentor) {
      return -1;
    } else if (!a.mentor && b.mentor) {
      return 1;
    } else if (a.active && !b.active) {
      return -1;
    } else if (!a.active && b.active) {
      return 1;
    } else {
      return a.uniqname.localeCompare(b.uniqname);
    }
  });

  // Meetings table
  const displayedMeetings = meetings.filter(
    (meeting) => uniqnameSearch === null || meeting.attendees.includes(uniqnameSearch),
  );
  displayedMeetings.sort(
    (a, b) => new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime(),
  );

  const search = () => {
    if (uniqnameSearchField.current !== null) {
      if (uniqnameSearchField.current.value !== '') {
        setUniqnameSearch(uniqnameSearchField.current.value);
      } else {
        setUniqnameSearch(null);
      }
    }
  };

  const clear = () => {
    if (uniqnameSearchField.current !== null) {
      uniqnameSearchField.current.value = '';
    }
    setUniqnameSearch(null);
  };

  return (
    <>
      <div className="mt-5 w-75 mx-auto">
        <div className="d-flex justify-content-between">
          <h2 className="col-10">Members</h2>
          <div className="col-2">
            <button type="button" className="btn famnm-btn-secondary mb-3" onClick={toggleNonAcitve}>
              {showNonActiveButton}
            </button>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th scope="col">Uniqname</th>
              <th scope="col">Active</th>
              <th scope="col">Attendances This Semester</th>
              <th scope="col">Attendances Last Semester</th>
              <th scope="col">Mentor</th>
            </tr>
          </thead>
          <tbody>
            {displayedMembers.map((member) => <MemberRow member={member} key={member.uniqname} />)}
          </tbody>
        </table>
      </div>

      <div className="mt-5 w-75 mx-auto">
        <div className="d-flex justify-content-between">
          <h2 className="col-10">Meetings</h2>
          <form onSubmit={overrideSubmit(search)}>
            <div className="col-2 mx-auto uniqname-search d-flex justify-content-end mb-3">
              <input type="text" placeholder="uniqname" ref={uniqnameSearchField} />
              <button type="submit" className="btn famnm-btn-secondary ms-1">Search</button>
              <button type="button" className="btn btn-secondary ms-1" onClick={clear}>Clear</button>
            </div>
          </form>
        </div>

        <table className="table all-meetings">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Type</th>
              <th scope="col">Attendees</th>
            </tr>
          </thead>
          <tbody>
            {displayedMeetings.map((meeting) => <MeetingRow meeting={meeting} key={`${meeting.meeting_date} ${meeting.meeting_type}`} />)}
          </tbody>
        </table>
      </div>
    </>
  );
}
