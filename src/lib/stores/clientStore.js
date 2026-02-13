import { writable, derived } from 'svelte/store';
import { sampleClients } from './mockData.js';
import { generateUUID } from '$lib/utils/helpers.js';

function createClientStore() {
    const { subscribe, set, update } = writable([...sampleClients]);

    return {
        subscribe,

        /**
         * Add a new client
         * @param {{ name: string, phoneNumber?: string, photoPath?: string }} data
         */
        add: (data) => {
            const newClient = {
                id: generateUUID(),
                driverId: 'drv-001',
                name: data.name,
                phoneNumber: data.phoneNumber || '',
                photoPath: data.photoPath || null,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            update(clients => [newClient, ...clients]);
            return newClient;
        },

        /**
         * Update a client
         * @param {string} id
         * @param {Partial} data
         */
        updateClient: (id, data) => {
            update(clients =>
                clients.map(c =>
                    c.id === id
                        ? { ...c, ...data, lastUpdated: new Date().toISOString() }
                        : c
                )
            );
        },

        /**
         * Delete a client
         * @param {string} id
         */
        remove: (id) => {
            update(clients => clients.filter(c => c.id !== id));
        },

        /**
         * Get client by ID
         * @param {string} id
         * @returns {import('svelte/store').Readable}
         */
        getById: (id) => {
            return derived({ subscribe }, ($clients) =>
                $clients.find(c => c.id === id) || null
            );
        },

        reset: () => set([...sampleClients])
    };
}

export const clientStore = createClientStore();

/**
 * Create a filtered/searched clients derived store
 * @param {import('svelte/store').Writable<string>} searchQuery
 */
export function createFilteredClients(searchQuery) {
    return derived([clientStore, searchQuery], ([$clients, $query]) => {
        if (!$query || $query.trim() === '') return $clients;
        const q = $query.toLowerCase().trim();
        return $clients.filter(
            c =>
                c.name.toLowerCase().includes(q) ||
                (c.phoneNumber && c.phoneNumber.includes(q))
        );
    });
}
