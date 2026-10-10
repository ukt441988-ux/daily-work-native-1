/**
 * Phone dialing utility for Lucky App
 * Safely triggers the system dialer on mobile devices and WebViews
 */
export function getCleanPhoneNumber(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '');
}

export function handleDirectDial(phone?: string, e?: { stopPropagation?: () => void }): void {
  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation();
  }
  const clean = getCleanPhoneNumber(phone);
  if (!clean) return;
  // Trigger mobile dial pad directly
  try {
    window.location.href = `tel:${clean}`;
  } catch (err) {
    // Fallback
    window.open(`tel:${clean}`, '_self');
  }
}
