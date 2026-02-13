import { generateUUID } from '$lib/utils/helpers.js';

// ===== Sample Driver =====
export const sampleDriver = {
    id: 'drv-001',
    name: 'Ahmed Benali',
    isVerified: true,
    createdAt: '2025-01-15T08:00:00Z',
    lastSync: '2026-02-12T14:30:00Z'
};

// ===== Sample Clients =====
export const sampleClients = [
    {
        id: 'cli-001',
        driverId: 'drv-001',
        name: 'Boulangerie El Baraka',
        phoneNumber: '+213 555 012 345',
        photoPath: null,
        createdAt: '2025-02-10T09:00:00Z',
        lastUpdated: '2026-02-11T16:00:00Z'
    },
    {
        id: 'cli-002',
        driverId: 'drv-001',
        name: 'Superette Amine',
        phoneNumber: '+213 555 067 890',
        photoPath: null,
        createdAt: '2025-03-05T10:30:00Z',
        lastUpdated: '2026-02-10T11:00:00Z'
    },
    {
        id: 'cli-003',
        driverId: 'drv-001',
        name: 'Café du Coin',
        phoneNumber: '+213 555 098 765',
        photoPath: null,
        createdAt: '2025-04-20T14:00:00Z',
        lastUpdated: '2026-02-09T09:30:00Z'
    },
    {
        id: 'cli-004',
        driverId: 'drv-001',
        name: 'Marché Samir',
        phoneNumber: '+213 555 034 567',
        photoPath: null,
        createdAt: '2025-05-12T08:15:00Z',
        lastUpdated: '2026-02-08T15:45:00Z'
    },
    {
        id: 'cli-005',
        driverId: 'drv-001',
        name: 'Épicerie Fatima',
        phoneNumber: '+213 555 078 901',
        photoPath: null,
        createdAt: '2025-06-01T11:00:00Z',
        lastUpdated: '2026-02-07T10:20:00Z'
    },
    {
        id: 'cli-006',
        driverId: 'drv-001',
        name: 'Pâtisserie Nour',
        phoneNumber: '+213 555 045 678',
        photoPath: null,
        createdAt: '2025-07-18T13:30:00Z',
        lastUpdated: '2026-02-06T14:10:00Z'
    }
];

// ===== Sample Transactions =====
export const sampleTransactions = [
    {
        id: 'trx-001',
        deliveryId: 'del-old-001',
        clientId: 'cli-001',
        amount: 15000,
        paidAmount: 15000,
        transactionDate: '2026-02-10T10:30:00Z',
        status: 'paid',
        notes: 'Regular weekly order',
        createdAt: '2026-02-10T10:30:00Z',
        lastUpdated: '2026-02-10T10:30:00Z'
    },
    {
        id: 'trx-002',
        deliveryId: 'del-old-001',
        clientId: 'cli-002',
        amount: 8500,
        paidAmount: 5000,
        transactionDate: '2026-02-10T11:15:00Z',
        status: 'partially_paid',
        notes: 'Will pay the rest next week',
        createdAt: '2026-02-10T11:15:00Z',
        lastUpdated: '2026-02-10T11:15:00Z'
    },
    {
        id: 'trx-003',
        deliveryId: 'del-old-001',
        clientId: 'cli-003',
        amount: 12000,
        paidAmount: 0,
        transactionDate: '2026-02-09T09:45:00Z',
        status: 'unpaid',
        notes: 'Cash not ready, promised payment by Friday',
        createdAt: '2026-02-09T09:45:00Z',
        lastUpdated: '2026-02-09T09:45:00Z'
    },
    {
        id: 'trx-004',
        deliveryId: 'del-old-002',
        clientId: 'cli-004',
        amount: 22000,
        paidAmount: 22000,
        transactionDate: '2026-02-08T14:20:00Z',
        status: 'paid',
        notes: '',
        createdAt: '2026-02-08T14:20:00Z',
        lastUpdated: '2026-02-08T14:20:00Z'
    },
    {
        id: 'trx-005',
        deliveryId: 'del-old-002',
        clientId: 'cli-005',
        amount: 6800,
        paidAmount: 0,
        transactionDate: '2026-02-07T10:00:00Z',
        status: 'unpaid',
        notes: 'Long-standing client, will settle monthly',
        createdAt: '2026-02-07T10:00:00Z',
        lastUpdated: '2026-02-07T10:00:00Z'
    },
    {
        id: 'trx-006',
        deliveryId: 'del-old-002',
        clientId: 'cli-001',
        amount: 9200,
        paidAmount: 4000,
        transactionDate: '2026-02-06T16:30:00Z',
        status: 'partially_paid',
        notes: 'Partial cash payment',
        createdAt: '2026-02-06T16:30:00Z',
        lastUpdated: '2026-02-06T16:30:00Z'
    }
];

// ===== Sample Deliveries =====
export const sampleDeliveries = [
    {
        id: 'del-old-001',
        driverId: 'drv-001',
        startValue: 50000,
        currentValue: 14500,
        endValue: 14500,
        startTime: '2026-02-10T08:00:00Z',
        endTime: '2026-02-10T17:00:00Z',
        isActive: false,
        createdAt: '2026-02-10T08:00:00Z',
        lastUpdated: '2026-02-10T17:00:00Z'
    },
    {
        id: 'del-old-002',
        driverId: 'drv-001',
        startValue: 45000,
        currentValue: 7000,
        endValue: 7000,
        startTime: '2026-02-08T07:30:00Z',
        endTime: '2026-02-08T16:45:00Z',
        isActive: false,
        createdAt: '2026-02-08T07:30:00Z',
        lastUpdated: '2026-02-08T16:45:00Z'
    }
];
