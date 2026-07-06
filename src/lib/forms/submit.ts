import { WEB3FORMS_ACCESS_KEY } from '$lib/config';

export async function submitToWeb3Forms(
	fields: Record<string, string>
): Promise<{ ok: boolean; message: string }> {
	try {
		const res = await fetch('https://api.web3forms.com/submit', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
			body: JSON.stringify({ access_key: WEB3FORMS_ACCESS_KEY, ...fields })
		});
		const json = await res.json().catch(() => ({}));
		const ok = res.ok && json.success !== false;
		return { ok, message: json.message ?? (ok ? 'Sent.' : 'Something went wrong.') };
	} catch {
		return { ok: false, message: 'Network error — please email us directly instead.' };
	}
}
