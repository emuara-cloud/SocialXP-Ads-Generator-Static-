/**
 * Formats social indicator numbers:
 * - Up to 4 digits: formatted with commas if >= 1000, e.g. "4,000", "1,234", "800"
 * - More than 4 digits (5 digits or more): formatted as "40K", "12.5K", "100K", "1M"
 * - Handles custom text / raw digits / formatted strings smoothly.
 */
export function formatSocialNumber(value: string | number): string {
  if (value === undefined || value === null || value === '') return '';
  const str = String(value).trim();
  
  // If it already contains letters (like "40K", "1.2M", "10K"), return as is
  if (/[a-zA-Z]/.test(str)) return str;
  
  // Remove commas, dots, spaces to parse pure digits
  const cleanDigits = str.replace(/[^0-9]/g, '');
  if (!cleanDigits) return str;
  
  const num = parseInt(cleanDigits, 10);
  if (isNaN(num)) return str;
  
  if (num < 1000) {
    return num.toString();
  } else if (num >= 1000 && num <= 9999) {
    // 4 digits: format with comma, e.g. 4000 -> "4,000"
    return num.toLocaleString('en-US');
  } else if (num >= 10000 && num < 1000000) {
    // More than 4 digits: e.g. 40000 -> "40K", 12500 -> "12.5K"
    const inK = num / 1000;
    const formatted = inK % 1 === 0 ? inK.toString() : inK.toFixed(1);
    return `${formatted}K`;
  } else {
    // 1 Million or more: e.g. 1000000 -> "1M", 2500000 -> "2.5M"
    const inM = num / 1000000;
    const formatted = inM % 1 === 0 ? inM.toString() : inM.toFixed(1);
    return `${formatted}M`;
  }
}
