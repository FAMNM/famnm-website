// This rule seems to be broken. Reenable it if it's ever fixed.
/* eslint-disable jsx-a11y/label-has-associated-control */

import {
  RefObject, useEffect, useId, useRef, useState,
} from 'react';
import backendUrl from './backendUrl';
import overrideSubmit from './onSubmit';
import exhaustivenessCheck from './exhaustivenessCheck';

const defaultMeetingType = '------';

type Mode = 'entry' | 'confirm';

interface MaybeNewAttendee {
  uniqname: string;
  newMember: boolean;
}

interface ValidateRequest {
  meeting_type: string;
  meeting_date: string;
  attendees: string[];
}

interface ValidateResponse {
  already_exists: boolean;
  new_uniqnames: string[];
}

interface SubmitRequest {
  meeting_type: string;
  meeting_date: string;
  attendees: string[];
}

interface MeetingTypeInputProps {
  warning: string | null;
  selectRef: RefObject<HTMLSelectElement>;
  onChange: () => void;
  setErrorMessage: (message: string | null) => void;
}

function MeetingTypeInput(props: MeetingTypeInputProps) {
  const {
    warning, selectRef, onChange, setErrorMessage,
  } = props;

  const [meetingTypes, setMeetingTypes] = useState<string[]>([]);

  // Load meeting types
  useEffect(() => {
    (async () => {
      try {
        if (meetingTypes.length === 0) {
          const response = await fetch(`${backendUrl}/meeting/types`);

          if (!response.ok) {
            throw Error(response.statusText);
          }

          setMeetingTypes(await response.json());
        }
      } catch (error) {
        setErrorMessage((error as Error).message);
      }
    })();
  });

  const selectId = useId();

  const selectClass = warning === null
    ? 'form-select'
    : 'form-select is-invalid';

  return (
    <div className="row mb-3 align-items-center">
      <div className="col-sm-3">
        <label htmlFor={selectId} className="col-form-label">Meeting Type</label>
      </div>
      <div className="col">
        <select
          ref={selectRef}
          className={selectClass}
          id={selectId}
          defaultValue={defaultMeetingType}
          onChange={onChange}
        >
          <option disabled>{defaultMeetingType}</option>
          {meetingTypes.map((meetingType) => <option key={meetingType}>{meetingType}</option>)}
        </select>
        {warning !== null && (
          <div className="invalid-feedback">
            {warning}
          </div>
        )}
      </div>
    </div>
  );
}

interface DateInputProps {
  warning: string | null;
  inputRef: RefObject<HTMLInputElement>;
  onInput: () => void;
}

function DateInput(props: DateInputProps) {
  const { warning, inputRef, onInput } = props;

  const inputId = useId();

  const inputClass = warning === null
    ? 'form-control'
    : 'form-control is-invalid';

  return (
    <div className="row mb-3 align-items-center">
      <div className="col-sm-3">
        <label htmlFor={inputId} className="col-form-label">Date</label>
      </div>
      <div className="col">
        <input ref={inputRef} type="date" id={inputId} className={inputClass} onInput={onInput} />
        {warning !== null && (
          <div className="invalid-feedback">
            {warning}
          </div>
        )}
      </div>
    </div>
  );
}

interface AttendeesProps {
  attendees: MaybeNewAttendee[];
  removeAttendee: (attendeeToRemove: string) => void;
}

function Attendees(props: AttendeesProps) {
  const { attendees, removeAttendee } = props;

  const buttons = attendees.map(({ uniqname, newMember }) => {
    const buttonClass = newMember ? 'btn btn-success m-3 uniqname-btn' : 'btn btn-outline-secondary m-3 uniqname-btn';

    return (
      <button type="button" className={buttonClass} onClick={() => removeAttendee(uniqname)} key={uniqname}>
        {uniqname}
      </button>
    );
  });

  const newMembers = attendees.some((attendee) => attendee.newMember);

  return (
    <>
      <div>
        {buttons}
      </div>
      {newMembers && (
        <p className="text-success">
          Green indicates new members (or typos)
        </p>
      )}
    </>
  );
}

interface AttendeesInputProps {
  attendees: MaybeNewAttendee[];
  warning: string | null;
  inputRef: RefObject<HTMLInputElement>;
  addAttendee: () => void;
  removeAttendee: (attendee: string) => void;
  onInput: () => void;
}

function AttendeesInput(props: AttendeesInputProps) {
  const {
    warning, attendees, inputRef, addAttendee, removeAttendee, onInput,
  } = props;

  const inputId = useId();

  const inputClass = warning === null
    ? 'form-control'
    : 'form-control is-invalid';

  return (
    <>
      <form onSubmit={overrideSubmit(addAttendee)}>
        <div className="row mb-3 align-items-center">
          <div className="col-sm-3">
            <label htmlFor={inputId} className="col-form-label">Attendees</label>
          </div>
          <div className="col input-group">
            <input type="text" id={inputId} ref={inputRef} className={inputClass} placeholder="Uniqname..." onInput={onInput} />
            <button type="submit" className="btn btn-primary">+</button>
            {warning !== null && (
              <div className="invalid-feedback">
                {warning}
              </div>
            )}
          </div>
        </div>
      </form>

      <Attendees attendees={attendees} removeAttendee={removeAttendee} />
    </>
  );
}

interface ConfirmSubmitProps {
  mode: Mode;
  warning: string | null;
  inputRef: RefObject<HTMLInputElement>;
  confirm: () => void;
  submit: () => void;
}

function ConfirmSubmit(props: ConfirmSubmitProps) {
  const {
    mode, warning, inputRef, confirm, submit,
  } = props;

  let text: string;
  let onSubmit: () => void;
  let passphrase;

  if (mode === 'entry') {
    text = 'Confirm';
    onSubmit = confirm;
    passphrase = null;
  } else if (mode === 'confirm') {
    text = 'Submit';
    onSubmit = submit;

    const inputClass = warning === null
      ? 'form-control'
      : 'form-control is-invalid';

    passphrase = <input ref={inputRef} type="password" placeholder="Passphrase" className={inputClass} />;
  } else {
    exhaustivenessCheck(mode);
  }

  return (
    <form onSubmit={overrideSubmit(onSubmit)}>
      <div className="d-flex justify-content-end align-items-start">
        <div className="pe-2">
          {passphrase}
          {warning !== null && (
            <div className="invalid-feedback">
              {warning}
            </div>
          )}
        </div>
        <button type="submit" className="btn famnm-btn">{text}</button>
      </div>
    </form>
  );
}

export default function CreateAttendance() {
  const [attendees, setAttendees] = useState<MaybeNewAttendee[]>([]);
  const [mode, setMode] = useState<Mode>('entry');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [meetingTypeWarning, setMeetingTypeWarning] = useState<string | null>(null);
  const [dateWarning, setDateWarning] = useState<string | null>(null);
  const [attendeesWarning, setAttendeesWarning] = useState<string | null>(null);
  const [passphraseWarning, setPassphraseWarning] = useState<string | null>(null);

  const meetingTypeSelect = useRef<HTMLSelectElement>(null);
  const dateInput = useRef<HTMLInputElement>(null);
  const attendeeInput = useRef<HTMLInputElement>(null);
  const passphraseInput = useRef<HTMLInputElement>(null);

  // Set default date
  useEffect(() => {
    if (dateInput.current !== null && dateInput.current.value === '') {
      const currentDate = new Date();
      const currentLocalDate = new Date(
        currentDate.getTime() - currentDate.getTimezoneOffset() * 60 * 1000,
      );

      dateInput.current.value = currentLocalDate.toISOString().slice(0, 10);
    }
  }, []);

  const leaveConfirmMode = () => {
    setMode('entry');
    setPassphraseWarning(null);
  };

  const addAttendee = () => {
    leaveConfirmMode();

    let updatedAttendees = false;

    if (attendeeInput.current !== null) {
      const uniqname = attendeeInput.current.value.toLowerCase();
      const uniqnameExists = attendees.some((attendee) => attendee.uniqname === uniqname);

      if (uniqname.length > 0) {
        if (!uniqnameExists) {
          if (/^[a-z]{3,8}$/.test(uniqname)) {
            setAttendees((oldAttendees) => {
              const newAttendees = oldAttendees.slice();
              newAttendees.push({ uniqname, newMember: false });
              return newAttendees;
            });

            updatedAttendees = true;
            setAttendeesWarning(null);
          } else {
            setAttendeesWarning(`"${uniqname}" is not a valid uniqname`);
          }
        } else {
          setAttendeesWarning(`"${uniqname}" has already been entered`);
        }

        attendeeInput.current.value = '';
      }
    }

    return updatedAttendees;
  };

  const removeAttendee = (attendeeToRemove: string) => {
    leaveConfirmMode();

    setAttendees(
      (oldAttendees) => oldAttendees.filter(({ uniqname }) => uniqname !== attendeeToRemove),
    );
  };

  const confirm = async () => {
    try {
      const updatedAttendees = addAttendee();
      if (updatedAttendees) {
        return;
      }

      if (meetingTypeSelect.current !== null && dateInput.current !== null) {
        let enterConfirmMode = true;

        const meetingType = meetingTypeSelect.current.value;
        const meetingDate = dateInput.current.value;

        if (meetingType === defaultMeetingType) {
          setMeetingTypeWarning('Required');
          enterConfirmMode = false;
        } else {
          setMeetingTypeWarning(null);
        }

        if (attendees.length === 0) {
          setAttendeesWarning('Must have at least one attendee');
          enterConfirmMode = false;
        } else {
          setAttendeesWarning(null);
        }

        const requestData: SubmitRequest = {
          meeting_type: meetingType,
          meeting_date: meetingDate,
          attendees: attendees.map((attendee) => attendee.uniqname),
        };

        const response = await fetch(`${backendUrl}/meeting/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw Error(response.statusText);
        }

        const {
          already_exists: alreadyExists,
          new_uniqnames: newUniqnames,
        }: ValidateResponse = await response.json();

        if (alreadyExists) {
          setDateWarning(`The ${meetingType} meeting on ${meetingDate} has already been logged`);
          enterConfirmMode = false;
        } else {
          setDateWarning(null);
        }

        setAttendees((oldAttendees) => oldAttendees.map(
          (attendee) => (
            newUniqnames.includes(attendee.uniqname)
              ? { uniqname: attendee.uniqname, newMember: true }
              : { uniqname: attendee.uniqname, newMember: false }
          ),
        ));

        if (enterConfirmMode) {
          setMode('confirm');
        }
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const submit = async () => {
    try {
      if (meetingTypeSelect.current !== null
        && dateInput.current !== null
        && passphraseInput.current !== null) {
        const meetingType = meetingTypeSelect.current.value;
        const meetingDate = dateInput.current.value;
        const passphrase = passphraseInput.current.value;

        if (meetingType === defaultMeetingType) {
          throw Error('meetingType === defaultMeetingType');
        }

        const requestData: ValidateRequest = {
          meeting_type: meetingType,
          meeting_date: meetingDate,
          attendees: attendees.map((attendee) => attendee.uniqname),
        };

        const response = await fetch(`${backendUrl}/meeting`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`famnm:${passphrase}`)}`,
          },
          method: 'POST',
          body: JSON.stringify(requestData),
        });

        if (response.ok) {
          window.location.href = '/attendance/view';
        } else if (response.status === 401) {
          setPassphraseWarning('Incorrect passphrase');
        } else {
          throw Error(response.statusText);
        }
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <>
      {errorMessage !== null && (
        <div className="alert alert-danger" role="alert">
          {'Error: '}
          {errorMessage}
        </div>
      )}

      <div className="attendance-form">
        <MeetingTypeInput
          warning={meetingTypeWarning}
          selectRef={meetingTypeSelect}
          onChange={leaveConfirmMode}
          setErrorMessage={setErrorMessage}
        />

        <DateInput
          warning={dateWarning}
          inputRef={dateInput}
          onInput={leaveConfirmMode}
        />

        <AttendeesInput
          attendees={attendees}
          warning={attendeesWarning}
          inputRef={attendeeInput}
          addAttendee={addAttendee}
          removeAttendee={removeAttendee}
          onInput={leaveConfirmMode}
        />

        <ConfirmSubmit
          mode={mode}
          warning={passphraseWarning}
          inputRef={passphraseInput}
          confirm={confirm}
          submit={submit}
        />
      </div>
    </>
  );
}
