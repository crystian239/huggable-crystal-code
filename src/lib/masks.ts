// Input mask/format utilities

/** (00) 00000-0000 */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** 000.000.000-00 */
export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/** 00.000.000/0000-00 */
export function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

/** 00000-000 */
export function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/** CRP 00/00000 or CRFa 0-0000 — keeps prefix, formats digits */
export function maskCRP(value: string): string {
  // Allow free-form text like "CRP 06/123456" or "CRFa 2-12345"
  // Just ensure digits after prefix are formatted
  const upper = value.toUpperCase();
  const match = upper.match(/^(CRP|CRFA|CRM|CREFONO|COFFITO)?\s*/i);
  const prefix = match?.[1] || "";
  const rest = value.slice(match?.[0]?.length || 0).replace(/[^0-9/\-]/g, "");
  
  if (!prefix && !rest) return value;
  
  // If user typed a prefix, format nicely
  if (prefix) {
    const digits = rest.replace(/\D/g, "").slice(0, 10);
    if (prefix.toUpperCase() === "CRP" || prefix.toUpperCase() === "CRM") {
      // CRP 00/00000
      if (digits.length <= 2) return `${prefix} ${digits}`;
      return `${prefix} ${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    // CRFa, others: X-XXXXX
    if (digits.length <= 1) return `${prefix} ${digits}`;
    return `${prefix} ${digits.slice(0, 1)}-${digits.slice(1)}`;
  }

  return value;
}
