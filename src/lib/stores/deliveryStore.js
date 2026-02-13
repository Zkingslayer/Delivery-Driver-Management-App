import { writable, derived, get } from 'svelte/store';
import { sampleDeliveries } from './mockData.js';
import { generateUUID } from '$lib/utils/helpers.js';

function createDeliveryStore() {
    const { subscribe, set, update } = writable([...sampleDeliveries]);

    return {
        subscribe,

        /**
         * Start a new delivery
         * @param {number} startValue - Initial goods value on truck
         * @returns {object} The new delivery
         */
        startDelivery: (startValue) => {
            const newDelivery = {
                id: generateUUID(),
                driverId: 'drv-001',
                startValue: startValue,
                currentValue: startValue,
                endValue: null,
                startTime: new Date().toISOString(),
                endTime: null,
                isActive: true,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            update(deliveries => [newDelivery, ...deliveries]);
            return newDelivery;
        },

        /**
         * Update truck value after a transaction
         * @param {string} deliveryId
         * @param {number} amount - Amount to subtract
         */
        subtractValue: (deliveryId, amount) => {
            update(deliveries =>
                deliveries.map(d =>
                    d.id === deliveryId
                        ? {
                            ...d,
                            currentValue: Math.max(0, d.currentValue - amount),
                            lastUpdated: new Date().toISOString()
                        }
                        : d
                )
            );
        },

        /**
         * Finish the active delivery
         */
        finishDelivery: () => {
            update(deliveries =>
                deliveries.map(d =>
                    d.isActive
                        ? {
                            ...d,
                            isActive: false,
                            endValue: d.currentValue,
                            endTime: new Date().toISOString(),
                            lastUpdated: new Date().toISOString()
                        }
                        : d
                )
            );
        },

        reset: () => set([...sampleDeliveries])
    };
}

export const deliveryStore = createDeliveryStore();

/** Derived store for the current active delivery */
export const activeDelivery = derived(deliveryStore, ($deliveries) =>
    $deliveries.find(d => d.isActive) || null
);

/** Derived store for delivery history (completed) */
export const deliveryHistory = derived(deliveryStore, ($deliveries) =>
    $deliveries.filter(d => !d.isActive).sort((a, b) => new Date(b.endTime) - new Date(a.endTime))
);
