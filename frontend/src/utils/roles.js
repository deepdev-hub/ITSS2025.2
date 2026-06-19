export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
  RESCUE_COMPANY: 'RESCUE_COMPANY',
  RESCUE_STAFF: 'RESCUE_STAFF',
};

export function getDefaultRoute(roleName) {
  switch (roleName) {
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.RESCUE_COMPANY:
      return '/company/dashboard';
    case ROLES.RESCUE_STAFF:
      return '/staff/dashboard';
    case ROLES.CUSTOMER:
    default:
      return '/customer/requests';
  }
}

export function getPostLoginRoute(roleName, fromPath) {
  if (roleName === ROLES.ADMIN) {
    return getDefaultRoute(roleName);
  }
  return fromPath || getDefaultRoute(roleName);
}

export function getMenuItems(roleName) {
  switch (roleName) {
    case ROLES.ADMIN:
      return [
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/requests', label: 'Requests' },
        { to: '/admin/accounts', label: 'Accounts' },
        { to: '/admin/roles', label: 'Roles' },
        { to: '/admin/companies', label: 'Companies' },
        { to: '/admin/company-staff', label: 'Company Staff' },
        { to: '/admin/incident-types', label: 'Incident Types' },
        { to: '/admin/service-types', label: 'Service Types' },
        { to: '/profile', label: 'My Profile' },
      ];
    case ROLES.RESCUE_COMPANY:
      return [
        { to: '/company/dashboard', label: 'Dashboard' },
        { to: '/company/profile', label: 'Company Profile' },
        { to: '/company/requests', label: 'Assigned Requests' },
        { to: '/company/staff', label: 'Staff' },
        { to: '/company/vehicles', label: 'Vehicles' },
        { to: '/profile', label: 'My Profile' },
      ];
    case ROLES.RESCUE_STAFF:
      return [
        { to: '/staff/dashboard', label: 'Dashboard' },
        { to: '/staff/nearby-requests', label: 'Nearby Requests' },
        { to: '/staff/location', label: 'Location Setting' },
        { to: '/staff/assignments', label: 'My Assignments' },
        { to: '/profile', label: 'My Profile' },
      ];
    case ROLES.CUSTOMER:
    default:
      return [
        { to: '/customer/requests', label: 'My Requests' },
        { to: '/customer/requests/new', label: 'Create Request' },
        { to: '/customer/vehicles', label: 'My Vehicles' },
        { to: '/profile', label: 'My Profile' },
      ];
  }
}
