import { appendFileSync, readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
const cargo = readFileSync('src-tauri/Cargo.toml', 'utf8');
const rustVersion = cargo.match(/^version\s*=\s*"([^"]+)"/m)?.[1];

if (!rustVersion || pkg.version !== rustVersion || lock.version !== rustVersion
    || lock.packages[''].version !== rustVersion) {
    throw new Error('package.json, package-lock.json and Cargo.toml must have the same app version');
}

const tag = `v${rustVersion}`;
const ref = process.env.GITHUB_REF ?? '';
if (ref.startsWith('refs/tags/') && ref !== `refs/tags/${tag}`) {
    throw new Error(`Release tag ${ref.slice('refs/tags/'.length)} does not match app version ${tag}`);
}

const output = `tag=${tag}\nprerelease=${rustVersion.includes('-')}\nartifact=AutoThemeMode-${rustVersion}-windows-x64\n`;
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, output);
console.log(`Building AutoThemeMode ${tag} for Windows x64`);
