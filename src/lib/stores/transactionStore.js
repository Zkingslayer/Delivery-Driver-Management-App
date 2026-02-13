import { writable, derived } from 'svelte/store';
import { sampleTransactions } from './mockData.js';
import { generateUUID } from '$lib/utils/helpers.js';

function createTransactionStore() {
    const { subscribe, set, update } = writable([...sampleTransactions]);

    return {
        subscribe,

        /**
         * Create a new transaction
         * @param {{ deliveryId: string, clientId: string, amount: number, paidAmount: number, notes?: string }} data
         * @returns {object}
         */
        add: (data) => {
            let status = 'unpaid';
            if (data.paidAmount >= data.amount) status = 'paid';
            else if (data.paidAmount > 0) status = 'partially_paid';

            const newTransaction = {
                id: generateUUID(),
                deliveryId: data.deliveryId,
                clientId: data.clientId,
                amount: data.amount,
                paidAmount: data.paidAmount,
                transactionDate: new Date().toISOString(),
                status,
                notes: data.notes || '',
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            update(txs => [newTransaction, ...txs]);
            return newTransaction;
        },

        /**
         * Mark a debt as paid (full or partial)
         * @param {string} transactionId
         * @param {number} paidAmount
         */
        markPaid: (transactionId, paidAmount) => {
            update(txs =>
                txs.map(t => {
                    if (t.id !== transactionId) return t;
                    const newPaid = t.paidAmount + paidAmount;
                    const newStatus =
                        newPaid >= t.amount ? 'paid' : newPaid > 0 ? 'partially_paid' : 'unpaid';
                    return {
                        ...t,
                        paidAmount: Math.min(newPaid, t.amount),
                        status: newStatus,
                        lastUpdated: new Date().toISOString()
                    };
                })
            );
        },

        /**
         * Get transactions for a specific client
         * @param {string} clientId
         */
        getByClient: (clientId) => {
            return derived({ subscribe }, ($txs) =>
                $txs
                    .filter(t => t.clientId === clientId)
                    .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
            );
        },

        /**
         * Get transactions for a specific delivery
         * @param {string} deliveryId
         */
        getByDelivery: (deliveryId) => {
            return derived({ subscribe }, ($txs) =>
                $txs.filter(t => t.deliveryId === deliveryId)
            );
        },

        reset: () => set([...sampleTransactions])
    };
}

export const transactionStore = createTransactionStore();

/** All outstanding debts (unpaid or partially paid) */
export const debtsStore = derived(transactionStore, ($txs) =>
    $txs
        .filter(t => t.status === 'unpaid' || t.status === 'partially_paid')
        .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
);

/** Total outstanding debt amount */
export const totalDebt = derived(debtsStore, ($debts) =>
    $debts.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)
);

/** Get debt summary for a specific client */
export function getClientDebt(clientId) {
    return derived(debtsStore, ($debts) => {
        const clientDebts = $debts.filter(d => d.clientId === clientId);
        return {
            debts: clientDebts,
            total: clientDebts.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0),
            count: clientDebts.length
        };
    });
}
