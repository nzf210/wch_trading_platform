export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function formatDate(value?: Date | string | null) {
  if (!value) {
    return '-';
  }

  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatNumber(value?: number | null, options?: Intl.NumberFormatOptions) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

export function formatCurrency(value?: number | null, currency = 'USD') {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function shortenAddress(value?: string | null, start = 6, end = 4) {
  if (!value) {
    return '-';
  }

  if (value.length <= start + end) {
    return value;
  }

  return `${value.slice(0, start)}...${value.slice(-end)}`;
}
