/** Server-side price list (EUR, net). Mirrors TIERS/ADD_ONS in src/views/FormationCheckout.tsx. */
export const FORMATION_TIERS: Record<string, number> = { basic: 299, professional: 599, premium: 999 };
export const FORMATION_ADDONS: Record<string, number> = { eucc: 149, poa: 99, express_bris: 199, seat_address: 360, vat_oss: 249 };

/** S7: total is computed on the server; the client "amount" is ignored. */
export function formationTotalCents(input: { tier: string; addons?: Record<string, boolean>; isReverseCharge?: boolean }) {
  const tierPrice = FORMATION_TIERS[input.tier];
  if (tierPrice === undefined) return null;
  const addons = Object.entries(input.addons || {})
    .filter(([id, on]) => on === true && FORMATION_ADDONS[id] !== undefined)
    .reduce((sum, [id]) => sum + FORMATION_ADDONS[id], 0);
  const subtotal = tierPrice + addons;
  const tax = input.isReverseCharge ? 0 : Math.round(subtotal * 0.19);
  return (subtotal + tax) * 100;
}

