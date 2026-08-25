export function getBrowserIcon(browserName: string): string {
  if (!browserName) return '/assets/icons/browser-default.svg';
  
  const normalized = browserName.toLowerCase();

  if (normalized.includes('firefox')) return '/assets/icons/browser/firefox.svg';
  if (normalized.includes('chrome')) return '/assets/icons/browser/chrome.svg';
  if (normalized.includes('safari')) return '/assets/icons/browser/safari.svg';
  if (normalized.includes('edge')) return '/assets/icons/browser/edge.svg';
  if (normalized.includes('opera')) return '/assets/icons/browser/opera.svg';
  if (normalized.includes('brave')) return '/assets/icons/browser/brave.svg'

  return '/assets/icons/browser/browser-default.svg';
}