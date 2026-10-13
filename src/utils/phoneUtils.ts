/**
 * Phone dialing utility for Daily Work App
 * Safely triggers the system dialer on mobile devices, Android WebViews, Capacitor and mobile browsers
 */

/**
 * Converts a phone number to standard RFC 3966 / E.164 tel: URI (e.g. tel:+919840998877)
 * Android dialers, iOS, and WebViews require the '+' and country code format to populate
 * the dial pad input field correctly; without it, many Android dialers open a blank dial pad.
 */
export function formatDialerUrl(phone?: string, defaultCountryCode = '91'): string {
  if (!phone) return '';
  const raw = String(phone).trim();
  const digitsOnly = raw.replace(/[^0-9]/g, '');
  if (!digitsOnly) return '';

  // If already starts with '+', keep as is
  if (raw.startsWith('+')) {
    return `tel:+${digitsOnly}`;
  }

  // If already has 91 country code (12 digits like 919840998877)
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return `tel:+${digitsOnly}`;
  }

  // Standard 10-digit Indian mobile number -> +91XXXXXXXXXX
  if (digitsOnly.length === 10) {
    return `tel:+${defaultCountryCode}${digitsOnly}`;
  }

  // 11-digit starting with 0 (e.g. 09840998877)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return `tel:+${defaultCountryCode}${digitsOnly.slice(1)}`;
  }

  return `tel:${digitsOnly}`;
}

export function getCleanPhoneNumber(phone?: string): string {
  if (!phone) return '';
  const raw = String(phone).trim();
  return raw.replace(/[^0-9]/g, '');
}

/**
 * Trigger phone dialer directly and reliably
 */
export function handleDirectDial(
  phone?: string,
  e?: { preventDefault?: () => void; stopPropagation?: () => void }
): void {
  if (e) {
    if (typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    // CRITICAL: Call preventDefault so the browser DOES NOT trigger a duplicate navigation
    // that cancels Android's dialer intent or causes a race condition!
    if (typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
  }

  const dialUrl = formatDialerUrl(phone);
  if (!dialUrl) return;

  try {
    // Standard user-gesture navigation to tel: protocol
    window.location.href = dialUrl;
  } catch (err) {
    try {
      const anchor = document.createElement('a');
      anchor.href = dialUrl;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        if (document.body.contains(anchor)) {
          document.body.removeChild(anchor);
        }
      }, 300);
    } catch (e2) {
      console.error('Failed to trigger phone dialer', e2);
    }
  }
}
