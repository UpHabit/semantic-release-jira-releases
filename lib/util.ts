export function escapeRegExp(strIn: string): string {
  return strIn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
