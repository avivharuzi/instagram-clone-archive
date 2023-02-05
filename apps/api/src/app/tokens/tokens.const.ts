// Expired after 30 days.
export const getDefaultTokenExpiration = (): Date =>
  new Date(Date.now() + 86400000 * 30);
