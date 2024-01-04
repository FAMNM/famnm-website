import { expect, test } from "vitest";
import { isTeamNumber } from "../src/components/events/KickoffScheduleMap";

test('team number recognition', () => {
    expect(isTeamNumber('')).toBe(false);
    expect(isTeamNumber('-')).toBe(false);
    expect(isTeamNumber('A')).toBe(false);
    expect(isTeamNumber('-1')).toBe(false);

    expect(isTeamNumber('1 ')).toBe(true);
    expect(isTeamNumber('9')).toBe(true);
    expect(isTeamNumber(' 30')).toBe(true);
    expect(isTeamNumber('5530\t')).toBe(true);
    expect(isTeamNumber('\n4410\n')).toBe(true);
    expect(isTeamNumber('8888')).toBe(true);
    expect(isTeamNumber('0808')).toBe(true);
    expect(isTeamNumber('99999')).toBe(true);
    expect(isTeamNumber('00000')).toBe(true);

    expect(isTeamNumber('0x022')).toBe(false);
    expect(isTeamNumber('0b010')).toBe(false);
    expect(isTeamNumber('100100')).toBe(false);
    expect(isTeamNumber('1 1 1')).toBe(false);
})