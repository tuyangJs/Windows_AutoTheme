import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mockIPC, clearMocks } from '@tauri-apps/api/mocks';
import { fetch as nativeFetch } from '@tauri-apps/plugin-http';

test('HTTP frontend reads response chunks returned by the Rust 2.8 backend', async t => {
    const previousWindow = globalThis.window;
    globalThis.window = { crypto: globalThis.crypto };
    t.after(() => { clearMocks(); globalThis.window = previousWindow; });
    let read = false;
    // Rust 2.8 returns a chunk plus a final-byte marker from each IPC invocation.
    mockIPC(command => {
        switch (command) {
            case 'plugin:http|fetch': return 1;
            case 'plugin:http|fetch_send':
                return { rid: 2, status: 200, statusText: 'OK', url: 'https://example.test', headers: [] };
            case 'plugin:http|fetch_read_body': {
                if (read) return new Uint8Array([1]).buffer;
                read = true;
                const json = new TextEncoder().encode('{"status":"success"}');
                return new Uint8Array([...json, 0]).buffer;
            }
            case 'plugin:http|fetch_cancel':
            case 'plugin:http|fetch_cancel_body': return;
            default: assert.fail(`Unexpected IPC command: ${command}`);
        }
    });
    let timer;
    try {
        const response = await nativeFetch('https://example.test');
        const body = await Promise.race([
            response.json(),
            new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Native response body never reached the frontend')), 500); }),
        ]);
        assert.deepEqual(body, { status: 'success' });
    } finally {
        clearTimeout(timer);
    }
});
