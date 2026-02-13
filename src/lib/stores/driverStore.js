import { writable, derived } from 'svelte/store';
import { sampleDriver } from './mockData.js';

function createDriverStore() {
    const { subscribe, set, update } = writable({
        ...sampleDriver,
        syncStatus: 'online', // 'online', 'offline', 'syncing'
        lastSync: new Date().toISOString()
    });

    return {
        subscribe,
        setOnline: () => update(d => ({ ...d, syncStatus: 'online' })),
        setOffline: () => update(d => ({ ...d, syncStatus: 'offline' })),
        setSyncing: () => update(d => ({ ...d, syncStatus: 'syncing' })),
        updateLastSync: () => update(d => ({ ...d, lastSync: new Date().toISOString() })),
        verify: () => update(d => ({ ...d, isVerified: true })),
        reset: () => set({ ...sampleDriver, syncStatus: 'online', lastSync: new Date().toISOString() })
    };
}

export const driverStore = createDriverStore();
