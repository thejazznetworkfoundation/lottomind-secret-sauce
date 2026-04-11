export interface StoreHours {
  open: number;
  close: number;
  is24h: boolean;
}

export interface StoreOpenStatus {
  isOpen: boolean;
  label: string;
  closesAt: string | null;
  opensAt: string | null;
  urgency: 'open' | 'closing-soon' | 'closed' | 'open-24h';
}

export function parseStoreHours(hoursString: string): StoreHours {
  if (hoursString.toLowerCase().includes('24')) {
    return { open: 0, close: 24, is24h: true };
  }

  const match = hoursString.match(/(\d{1,2})\s*(AM|PM)?\s*[–\-to]+\s*(\d{1,2})\s*(AM|PM)?/i);
  if (!match) {
    return { open: 8, close: 22, is24h: false };
  }

  let openHour = parseInt(match[1], 10);
  const openPeriod = (match[2] || 'AM').toUpperCase();
  let closeHour = parseInt(match[3], 10);
  const closePeriod = (match[4] || 'PM').toUpperCase();

  if (openPeriod === 'PM' && openHour !== 12) openHour += 12;
  if (openPeriod === 'AM' && openHour === 12) openHour = 0;
  if (closePeriod === 'PM' && closeHour !== 12) closeHour += 12;
  if (closePeriod === 'AM' && closeHour === 12) closeHour = 0;
  if (closePeriod === 'AM' && closeHour < openHour) closeHour += 24;

  return { open: openHour, close: closeHour, is24h: false };
}

export function getStoreOpenStatus(hoursString: string): StoreOpenStatus {
  const hours = parseStoreHours(hoursString);

  if (hours.is24h) {
    return {
      isOpen: true,
      label: 'Open 24 Hours',
      closesAt: null,
      opensAt: null,
      urgency: 'open-24h',
    };
  }

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  const isOpen = currentHour >= hours.open && currentHour < hours.close;
  const closingSoon = isOpen && (hours.close - currentHour) <= 1;

  const formatHour = (h: number): string => {
    const normalized = h % 24;
    const period = normalized >= 12 ? 'PM' : 'AM';
    const display = normalized > 12 ? normalized - 12 : normalized === 0 ? 12 : normalized;
    return `${display} ${period}`;
  };

  if (isOpen && closingSoon) {
    const minutesLeft = Math.round((hours.close - currentHour) * 60);
    return {
      isOpen: true,
      label: `Closing in ${minutesLeft}m`,
      closesAt: formatHour(hours.close),
      opensAt: null,
      urgency: 'closing-soon',
    };
  }

  if (isOpen) {
    return {
      isOpen: true,
      label: `Open · Closes ${formatHour(hours.close)}`,
      closesAt: formatHour(hours.close),
      opensAt: null,
      urgency: 'open',
    };
  }

  return {
    isOpen: false,
    label: `Closed · Opens ${formatHour(hours.open)}`,
    closesAt: null,
    opensAt: formatHour(hours.open),
    urgency: 'closed',
  };
}

export function getStatusColor(urgency: StoreOpenStatus['urgency']): string {
  switch (urgency) {
    case 'open':
    case 'open-24h':
      return '#00E676';
    case 'closing-soon':
      return '#FFA726';
    case 'closed':
      return '#EF5350';
  }
}
