import { describe, it, expect } from 'vitest';
import { validateContact, validateVolunteer } from './validation';

describe('validateContact (FORM-03)', () => {
	it('flags missing name/email/message in field order', () => {
		expect(Object.keys(validateContact({}))).toEqual(['name', 'email', 'message']);
	});
	it('rejects a malformed email with a suggestion', () => {
		expect(validateContact({ name: 'A', email: 'nope', message: 'x' }).email).toMatch(/valid email/i);
	});
	it('passes a well-formed submission', () => {
		expect(validateContact({ name: 'A', email: 'a@b.co', message: 'x' })).toEqual({});
	});
});

describe('validateVolunteer (FORM-02/03)', () => {
	it('requires all fields', () => {
		expect(Object.keys(validateVolunteer({}))).toEqual(['name', 'email', 'message']);
	});
});
