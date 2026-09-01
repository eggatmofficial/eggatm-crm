/**
 * Shared helpers for the "visit reminder" feature on Customers & Contacts.
 *
 * We treat `updatedAt` as the customer's "last visit" timestamp (it changes
 * whenever the customer record is touched, e.g. points added/redeemed on a
 * visit). If `updatedAt` isn't present for some reason we fall back to
 * `createdAt` so the UI never breaks.
 */

/** Returns the ISO date string to use as "last visit". */
export function getLastVisitDate(customer) {
  return customer?.updatedAt || customer?.createdAt || null;
}

/** Whole number of days between the last visit date and now. */
export function daysSinceLastVisit(customer) {
  const dateStr = getLastVisitDate(customer);
  if (!dateStr) return null;
  const last = new Date(dateStr).getTime();
  if (Number.isNaN(last)) return null;
  const diffMs = Date.now() - last;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * 🥚 Egg! ATM "comeback" message tiers.
 * Ordered smallest -> largest `minDays`. `pickTier()` walks this list and
 * returns the LAST (i.e. highest) tier the customer qualifies for.
 *
 * NOTE ON EMOJI: the "astral plane" emoji (👋 🥚 🔥 😋 — anything outside the
 * Basic Multilingual Plane) are written here as \u{...} escape sequences
 * instead of raw characters. This is deliberate: some environments (older
 * WebViews, certain build/encoding steps, some copy/paste tools) silently
 * corrupt 4-byte UTF-8 characters while leaving 3-byte characters (like
 * Tamil script) and BMP emoji (like ❤️) untouched — which is exactly the
 * symptom of emoji turning into "�" while everything else looks fine.
 * Using \u{...} escapes means the JS engine reconstructs the correct
 * character at parse time regardless of how the file itself got encoded/
 * re-saved along the way, so this is safe everywhere.
 *
 * Edit the `text` on any tier to change what gets sent for that gap — no
 * other code needs to change.
 */
const WAVE = "\u{1F44B}"; // 👋
const EGG = "\u{1F95A}"; // 🥚
const FIRE = "\u{1F525}"; // 🔥
const YUM = "\u{1F60B}"; // 😋
const HEART = "\u{2764}\u{FE0F}"; // ❤️ (BMP + variation selector — kept for consistency)

export const REMINDER_TIERS = [
  {
    minDays: 7,
    label: "7+ Days",
    text:
      `*${WAVE} We Miss You!*\n` +
      "─────────────────────\n" +
      "ரொம்ப நாளாச்சே...\n" +
      `Egg! ATM வரலையே! ${EGG}${HEART}\n\n` +
      `Come back and enjoy your favourite snacks! ${FIRE}\n` +
      "─────────────────────\n" +
      `*${EGG} Egg! ATM — Any Time Muttai*`,
  },
  {
    minDays: 15,
    label: "15+ Days",
    text:
      `*${WAVE} Missing You!*\n` +
      "─────────────────────\n" +
      `Egg! ATM பக்கம் வந்து ரொம்ப நாளாச்சு! ${EGG}\n\n` +
      `ஒரு Egg! ATM visit போகலாமே? ${YUM}${FIRE}\n` +
      "─────────────────────\n" +
      `*${EGG} Egg! ATM — Any Time Muttai*`,
  },
  {
    minDays: 20,
    label: "20+ Days",
    text:
      `*${HEART} Special Treat Waiting!*\n` +
      "─────────────────────\n" +
      `Egg! ATM-ல் உங்களுக்காக delicious dishes காத்திருக்கு! ${EGG}${FIRE}\n\n` +
      `Come visit us today! ${YUM}\n` +
      "─────────────────────\n" +
      `*${EGG} Egg! ATM — Any Time Muttai*`,
  },
  {
    minDays: 30,
    label: "30+ Days",
    text:
      `*${HEART} We Miss You!*\n` +
      "─────────────────────\n" +
      "ஒரு மாதம் ஆகிடுச்சே...\n" +
      `Egg! ATM-க்கு வாங்க! ${EGG}${FIRE}\n\n` +
      `உங்க favourite snacks காத்திருக்குது! ${YUM}\n` +
      "─────────────────────\n" +
      `*${EGG} Egg! ATM — Any Time Muttai*`,
  },
  {
    minDays: 40,
    label: "40+ Days",
    text:
      `*${EGG} Long Time No See!*\n` +
      "─────────────────────\n" +
      `Egg! ATM பக்கம் வந்து 40 நாட்களுக்கு மேலாச்சு! ${HEART}\n\n` +
      `இன்னைக்கே ஒரு visit பண்ணுங்க! ${YUM}${FIRE}\n` +
      "─────────────────────\n" +
      `*${EGG} Egg! ATM — Any Time Muttai*`,
  },
  {
    minDays: 50,
    label: "50+ Days",
    text:
      `*${WAVE} Hey Friend!*\n` +
      "─────────────────────\n" +
      `Egg! ATM-க்கு ஒரு சின்ன comeback பண்ணலாமே? \u{1F604}\n\n` +
      `Tasty egg varieties are ready for you! ${EGG}${FIRE}\n` +
      "─────────────────────\n" +
      `*${EGG} Egg! ATM — Any Time Muttai*`,
  },
  {
    minDays: 75,
    label: "75+ Days",
    text:
      `*${HEART} We Still Remember You!*\n` +
      "─────────────────────\n" +
      `Egg! ATM வந்து ரொம்ப நாளாச்சு! ${EGG}${FIRE}\n\n` +
      `உங்க favourite snacks miss பண்ணாதீங்க!\n` +
      "─────────────────────\n" +
      `*${EGG} Egg! ATM — Any Time Muttai*`,
  },
  {
    minDays: 90,
    label: "90+ Days",
    text:
      `*${WAVE} 3 Months Milestone!*\n` +
      "─────────────────────\n" +
      `ரொம்ப நாளா Egg! ATM வரலையே...\n\n` +
      `இந்த முறை கண்டிப்பா வாங்க! ${EGG}${HEART}\n` +
      "─────────────────────\n" +
      `*${EGG} Egg! ATM — Any Time Muttai*`,
  },
  {
    minDays: 100,
    label: "100+ Days Above",
    text:
      `*${HEART} Welcome Back Gift!*\n` +
      "─────────────────────\n" +
      `Egg! ATM வந்து 100+ நாட்கள் ஆகிவிட்டது! ${EGG}\n\n` +
      `உங்களுக்காக special loyalty rewards காத்திருக்குது! ${FIRE}\n` +
      "─────────────────────\n" +
      `*${EGG} Egg! ATM — Any Time Muttai*`,
  },
];

export const REMINDER_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "7", label: "7+ Days Inactive" },
  { value: "15", label: "15+ Days Inactive" },
  { value: "20", label: "20+ Days Inactive" },
  { value: "30", label: "30+ Days Inactive" },
  { value: "40", label: "40+ Days Inactive" },
  { value: "50", label: "50+ Days Inactive" },
  { value: "75", label: "75+ Days Inactive" },
  { value: "90", label: "90+ Days Inactive" },
  { value: "100", label: "100+ Days Above" },
];

/** Lowest gap (in days) that counts as "due for a reminder" — the first tier. */
export const REMINDER_THRESHOLD_DAYS = REMINDER_TIERS[0].minDays;

/** Returns the matching tier object for a given day-count, or null if under 7 days. */
export function pickReminderTier(days) {
  if (days === null || days < REMINDER_TIERS[0].minDays) return null;
  let tier = null;
  for (const t of REMINDER_TIERS) {
    if (days >= t.minDays) tier = t;
    else break;
  }
  return tier;
}

export function isReminderDue(customer) {
  const days = daysSinceLastVisit(customer);
  return pickReminderTier(days) !== null;
}

/** Filter list of customers by minimum last-visit days. */
export function filterCustomersByDays(customers, daysFilter) {
  if (!daysFilter || daysFilter === "all") return customers;
  const min = Number(daysFilter);
  if (isNaN(min)) return customers;
  return customers.filter((c) => {
    const days = daysSinceLastVisit(c);
    return days !== null && days >= min;
  });
}

/** Normalizes a 10-digit Indian number to E.164-ish digits for wa.me (91XXXXXXXXXX). */
export function normalizePhoneForWhatsapp(phone) {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/** Builds reminder WhatsApp text with personalized greeting. */
export function buildReminderMessage(customer) {
  const days = daysSinceLastVisit(customer);
  const tier = pickReminderTier(days) || REMINDER_TIERS[0];
  const firstName = customer?.name ? customer.name.trim().split(" ")[0] : null;
  const greeting = firstName ? `Hello ${firstName}! ${WAVE}\n\n` : "";
  return greeting + tier.text;
}

/** wa.me link for WhatsApp pre-filled reminder message. */
export function getWhatsappReminderLink(customer) {
  const phone = normalizePhoneForWhatsapp(customer?.phone);
  const message = buildReminderMessage(customer);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/** tel: link for Call button. */
export function getCallLink(customer) {
  const digits = String(customer?.phone || "").replace(/\D/g, "");
  return `tel:${digits}`;
}

/** Download customer list as formatted Excel CSV spreadsheet with UTF-8 BOM. */
export function exportCustomersToExcel(customers, filename = "customers.csv") {
  const headers = [
    "Customer Name",
    "Phone Number",
    "Franchise Name",
    "Franchise Code",
    "Loyalty Points",
    "Status",
    "Last Visit (Days)",
    "Last Visit Date",
    "Reminder Tier",
    "Nexocard Status",
    "Digital Card URL",
  ];

  const rows = customers.map((c) => {
    const days = daysSinceLastVisit(c);
    const tier = pickReminderTier(days);
    const dateStr = getLastVisitDate(c);
    return [
      `"${(c.name || "Customer").replace(/"/g, '""')}"`,
      `"${c.phone || ""}"`,
      `"${(c.franchiseName || "").replace(/"/g, '""')}"`,
      `"${c.franchiseCode || ""}"`,
      c.loyaltyPoints || 0,
      c.rewardEligible ? "Reward Eligible" : "Active",
      days === null ? "—" : days === 0 ? "Today" : `${days} days ago`,
      dateStr ? new Date(dateStr).toLocaleDateString() : "—",
      tier ? tier.label : "Recent (Under 7d)",
      c.nexocardSynced ? "Synced" : "Pending",
      `"${c.cardUrl || ""}"`,
    ];
  });

  const csvContent =
    "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename.endsWith(".csv") ? filename : `${filename}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
