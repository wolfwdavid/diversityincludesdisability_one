export type Errors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function base(data: Record<string, unknown>, helpMsg: string): Errors {
	const errors: Errors = {};
	const name = String(data.name ?? '').trim();
	const email = String(data.email ?? '').trim();
	const message = String(data.message ?? '').trim();
	if (!name) errors.name = 'Enter your name.';
	if (!email) errors.email = 'Enter your email address.';
	else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email like name@example.com.';
	if (!message) errors.message = helpMsg;
	return errors;
}

export function validateContact(data: Record<string, unknown>): Errors {
	return base(data, 'Enter a message.');
}

export function validateVolunteer(data: Record<string, unknown>): Errors {
	return base(data, 'Tell us how you would like to help.');
}
