export function parseHex(c: string): number {
  return parseInt(c.replace("#", ""), 16);
}

export function luminance(hex: string): number {
  const rgb = parseHex(hex);
  const r = ((rgb >> 16) & 0xff) / 255;
  const g = ((rgb >> 8) & 0xff) / 255;
  const b = (rgb & 0xff) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function getContrastText(bg: string, text: string): string {
  if (bg.toLowerCase() !== text.toLowerCase()) return text;
  return luminance(bg) > 0.5 ? "#000000" : "#ffffff";
}
