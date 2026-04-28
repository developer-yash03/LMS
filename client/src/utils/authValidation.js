export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

export const isValidEmail = (email = '') => EMAIL_REGEX.test(email.trim());

export const inferRoleFromEmail = (email = '') => {
  const normalized = email.trim().toLowerCase();

  if (normalized.startsWith('instructor')) {
    return 'instructor';
  }

  if (normalized.startsWith('admin')) {
    return 'admin';
  }

  return 'student';
};

export const dashboardRouteByRole = {
  admin: '/admin/users',
  instructor: '/instructor/dashboard',
  student: '/my-learning',
};

export const getDashboardRoute = (role = 'student') => {
  return dashboardRouteByRole[role] || '/my-learning';
};
