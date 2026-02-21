export function getCurrentAcademicYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan
  // Academic year assumed July -> June
  const startYear = month >= 6 ? year : year - 1;
  const endYear = startYear + 1;
  return `${startYear}-${endYear}`;
}

