import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const pairs = [
	{ label: 'mail-vue', base: 'mail-vue/src/i18n/en.js', target: 'mail-vue/src/i18n/tr.js' },
	{ label: 'mail-worker', base: 'mail-worker/src/i18n/en.js', target: 'mail-worker/src/i18n/tr.js' }
];

function keyPaths(obj, prefix = '') {
	const out = [];
	for (const [key, value] of Object.entries(obj)) {
		const path = prefix ? `${prefix}.${key}` : key;
		if (value && typeof value === 'object' && !Array.isArray(value)) {
			out.push(...keyPaths(value, path));
		} else {
			out.push(path);
		}
	}
	return out;
}

async function load(relPath) {
	const mod = await import(pathToFileURL(resolve(root, relPath)).href);
	return mod.default;
}

let failed = false;

for (const { label, base, target } of pairs) {
	const baseKeys = keyPaths(await load(base));
	const targetKeys = new Set(keyPaths(await load(target)));

	const missing = baseKeys.filter((k) => !targetKeys.has(k));
	const extra = [...targetKeys].filter((k) => !baseKeys.includes(k));

	if (missing.length) {
		failed = true;
		console.error(`\n[${label}] TR çevirisi eksik ${missing.length} anahtar:`);
		for (const k of missing) console.error(`  - ${k}`);
	}

	if (extra.length) {
		console.warn(`\n[${label}] TR'de olup EN'de olmayan ${extra.length} anahtar (muhtemelen upstream'de kaldırıldı):`);
		for (const k of extra) console.warn(`  - ${k}`);
	}

	if (!missing.length && !extra.length) {
		console.log(`[${label}] ${baseKeys.length} anahtar, TR tam.`);
	}
}

if (failed) {
	console.error('\nEksik TR çevirisi var. mail-*/src/i18n/tr.js dosyalarını tamamlayın.');
	process.exit(1);
}
