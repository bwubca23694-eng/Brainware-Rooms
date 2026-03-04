// ── Semester Pricing ──────────────────────────────────────────
export const SEMESTER_MONTHS = 6;

export const getSemesterPrice = (monthlyRent) => {
  if (!monthlyRent) return null;
  return monthlyRent * SEMESTER_MONTHS;
};

export const formatSemesterPrice = (monthlyRent) => {
  const sem = getSemesterPrice(monthlyRent);
  if (!sem) return null;
  return `₹${sem.toLocaleString()}`;
};

export const getSemesterBreakdown = (monthlyRent, deposit = 0) => {
  const semester = getSemesterPrice(monthlyRent);
  return {
    monthly: monthlyRent,
    semester,
    deposit,
    firstPayment: semester + deposit,  // semester rent + deposit
    perDay: Math.round(monthlyRent / 30),
  };
};

// ── Owner Response Rate ───────────────────────────────────────
export const getResponseLabel = (avgMinutes) => {
  if (avgMinutes === null || avgMinutes === undefined) return null;
  if (avgMinutes < 60) return { label: `⚡ Responds in ~${avgMinutes}m`, color: 'var(--green)', bg: 'var(--green-muted)' };
  if (avgMinutes < 360) return { label: `✅ Responds in ~${Math.round(avgMinutes/60)}h`, color: 'var(--green)', bg: 'var(--green-muted)' };
  if (avgMinutes < 1440) return { label: `🕐 Responds same day`, color: 'var(--yellow)', bg: 'var(--yellow-muted)' };
  return { label: `📬 Responds in 1-2 days`, color: 'var(--text-2)', bg: 'rgba(148,163,200,0.1)' };
};

// ── "New this week" helper ────────────────────────────────────
export const isNewRoom = (createdAt) => {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt) < 7 * 24 * 60 * 60 * 1000;
};

// ── Recently added: within last 3 days ───────────────────────
export const isRecentlyAdded = (createdAt) => {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt) < 3 * 24 * 60 * 60 * 1000;
};
