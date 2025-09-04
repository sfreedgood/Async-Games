export const normalizeStringForPath = (string: string) => {
  return string.replaceAll(' ', '-').toLowerCase();
};
