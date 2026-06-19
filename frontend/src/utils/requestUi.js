const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : 'N/A';
}

export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? String(value) : currencyFormatter.format(numericValue);
}

export function getRequestLocationLabel(request) {
  return request?.locationLabel || request?.location?.fullAddress || 'N/A';
}

export function canCustomerCancel(status) {
  return ['CREATED', 'SEARCHING', 'MATCHED', 'ACCEPTED'].includes(status);
}

export function getAllowedStatusOptions(roleName, currentStatus) {
  if (!roleName || ['COMPLETED', 'CANCELED'].includes(currentStatus)) {
    return [];
  }

  switch (roleName) {
    case 'ADMIN':
      return ['MATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'];
    case 'RESCUE_COMPANY':
      return ['MATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'];
    case 'RESCUE_STAFF':
      return ['IN_PROGRESS', 'COMPLETED', 'CANCELED'];
    default:
      return [];
  }
}

export function toDateTimeInputValue(value) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}
