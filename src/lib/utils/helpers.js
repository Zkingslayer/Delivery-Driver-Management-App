/**
 * Format a number as currency
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'DZD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amount);
}

/**
 * Format a date string to a readable format
 * @param {string|Date} date
 * @param {boolean} includeTime
 * @returns {string}
 */
export function formatDate(date, includeTime = false) {
    const d = new Date(date);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(includeTime && { hour: '2-digit', minute: '2-digit' })
    };
    return d.toLocaleDateString('en-US', options);
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date
 * @returns {string}
 */
export function timeAgo(date) {
    const now = new Date();
    const d = new Date(date);
    const seconds = Math.floor((now - d) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(date);
}

/**
 * Generate a UUID v4
 * @returns {string}
 */
export function generateUUID() {
    return crypto.randomUUID?.() ??
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
}

/**
 * Get initials from a name
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
    return name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Debounce function
 * @param {Function} fn
 * @param {number} ms
 * @returns {Function}
 */
export function debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

/**
 * Get status color class
 * @param {'paid'|'partially_paid'|'unpaid'} status
 * @returns {{ bg: string, text: string, label: string }}
 */
export function getStatusInfo(status) {
    switch (status) {
        case 'paid':
            return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Paid' };
        case 'partially_paid':
            return { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Partial' };
        case 'unpaid':
            return { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Unpaid' };
        default:
            return { bg: 'bg-slate-500/15', text: 'text-slate-400', label: status };
    }
}

/**
 * Calculate due date (transaction date + 30 days)
 * @param {string|Date} transactionDate
 * @returns {Date}
 */
export function getDueDate(transactionDate) {
    const d = new Date(transactionDate);
    d.setDate(d.getDate() + 30);
    return d;
}

/**
 * Check if a debt is overdue
 * @param {string|Date} transactionDate
 * @returns {boolean}
 */
export function isOverdue(transactionDate) {
    return getDueDate(transactionDate) < new Date();
}
