/**
 * Shared helpers for the "visit reminder" feature on Customers & Contacts.
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
 * Emojis written as UTF-16 surrogate pairs to guarantee safe rendering
 * across all JS engines, WebViews, and build environments.
 */
const WAVE = "\uD83D\uDC4B"; // 👋
const EGG = "\uD83E\uDD5A";  // 🥚
const FIRE = "\uD83D\uDD25"; // 🔥
const YUM = "\uD83D\uDE0B";  // 😋
const HEART = "\u2764\uFE0F"; // ❤️
const SMILE = "\uD83D\uDE04"; // 😄

export const REMINDER_TIERS = [
  {
    minDays: 7,
    label: "7+ Days",
    headline: `${WAVE} We Miss You`,
    subtext: "ரொம்ப நாளாச்சு...\nEgg! ATM வரலையே!",
    callToAction: `Come back and enjoy your favourite snacks! ${FIRE}`,
  },
  {
    minDays: 15,
    label: "15+ Days",
    headline: `${WAVE} Missing You`,
    subtext: "Egg! ATM பக்கம் வந்து ரொம்ப நாளாச்சு!",
    callToAction: `ஒரு Egg! ATM visit வரலாமே? ${YUM}${FIRE}`,
  },
  {
    minDays: 20,
    label: "20+ Days",
    headline: `${HEART} Special Treat Waiting`,
    subtext: "உங்களுக்காக delicious dishes காத்திருக்கு!",
    callToAction: `Come visit us today! ${YUM}${FIRE}`,
  },
  {
    minDays: 30,
    label: "30+ Days",
    headline: `${HEART} We Miss You`,
    subtext: "ஒரு மாசத்துக்கு மேல ஆச்சு நீங்க இங்க வந்து...\nEgg! ATM-க்கு வாங்க!",
    callToAction: `உங்க favourite snacks காத்திருக்குது! ${YUM}`,
  },
  {
    minDays: 45,
    label: "45+ Days",
    headline: `${EGG} Hey, Remember Us`,
    subtext: "Egg! ATM-க்கு வந்து ரொம்ப நாளாச்சு!",
    callToAction: `ஒரு சின்ன comeback குடுக்கலாமே? ${YUM}${FIRE}`,
  },
  {
    minDays: 60,
    label: "60+ Days",
    headline: `${WAVE} Long Time`,
    subtext: `எங்கே போயிட்டீங்க? ${SMILE}\nEgg! ATM-க்கு ஒரு visit கொடுங்க!`,
    callToAction: `Any Time Muttai ${FIRE}`,
  },
  {
    minDays: 75,
    label: "75+ Days",
    headline: `${HEART} We Miss You`,
    subtext: "ரொம்ப நாளாச்சு... Egg! ATM வரலையே...",
    callToAction: `Come back and enjoy your favourite snacks! ${EGG}${FIRE}`,
  },
  {
    minDays: 90,
    label: "90+ Days",
    headline: `${HEART} We Still Remember You`,
    subtext: "ரொம்ப நாளா Egg! ATM வரலையே...",
    callToAction: `இந்த முறை கண்டிப்பாக வாங்க🥚🔥`,
  },
  {
    minDays: 100,
    label: "100+ Days Above",
    headline: `${HEART} Welcome Back Gift`,
    subtext: "Egg! ATM வந்து 100+ நாட்கள் ஆகிவிட்டது!",
    callToAction: `உங்களுக்காக special loyalty rewards காத்திருக்குது! ${FIRE}`,
  },
];

export const REMINDER_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "7", label: "7+ Days Inactive" },
  { value: "15", label: "15+ Days Inactive" },
  { value: "20", label: "20+ Days Inactive" },
  { value: "30", label: "30+ Days Inactive" },
  { value: "45", label: "45+ Days Inactive" },
  { value: "60", label: "60+ Days Inactive" },
  { value: "75", label: "75+ Days Inactive" },
  { value: "90", label: "90+ Days Inactive" },
  { value: "100", label: "100+ Days Above" },
];

export const REMINDER_THRESHOLD_DAYS = REMINDER_TIERS[0].minDays;

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

export function filterCustomersByDays(customers, daysFilter) {
  if (!daysFilter || daysFilter === "all") return customers;
  const min = Number(daysFilter);
  if (isNaN(min)) return customers;
  return customers.filter((c) => {
    const days = daysSinceLastVisit(c);
    return days !== null && days >= min;
  });
}

export function normalizePhoneForWhatsapp(phone) {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/** Builds reminder WhatsApp text with dynamic customer name and franchise name in brackets. */
export function buildReminderMessage(customer) {
  const days = daysSinceLastVisit(customer);
  const tier = pickReminderTier(days) || REMINDER_TIERS[0];

  const customerName = customer?.name?.trim() || "Customer";

  // Resolve franchise name with robust fallback; empty if unavailable
  let franchiseName = "";
  if (customer?.franchiseName?.trim()) {
    franchiseName = customer.franchiseName.trim();
  } else if (customer?.franchise?.name?.trim()) {
    franchiseName = customer.franchise.name.trim();
  } else if (typeof customer?.franchise === "string" && customer.franchise.trim()) {
    franchiseName = customer.franchise.trim();
  } else if (customer?.franchiseId?.name?.trim()) {
    // Added fallback for populated franchiseId name
    franchiseName = customer.franchiseId.name.trim();
  }

  console.log("customer", customer);
  const franchiseLabel = franchiseName ? ` – ${franchiseName}` : "";

  return (
    `${tier.headline}, ${customerName}!\n\n` +
    `${tier.subtext}\n\n` +
    `${tier.callToAction}\n\n` +
    `Any Time Muttai\n\n` +
    `Egg! ATM${franchiseLabel}`
  );
}


// Existing helper – unchanged usage (no override)
export function getWhatsappReminderLink(customer) {
  const phone = normalizePhoneForWhatsapp(customer?.phone);
  const message = buildReminderMessage(customer);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// Helper that currently mirrors getWhatsappReminderLink (uses dynamic franchise name)
export function getWhatsappReminderLinkMainBranch(customer) {
  const phone = normalizePhoneForWhatsapp(customer?.phone);
  const message = buildReminderMessage(customer);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildWelcomeMessage(customer) {
  const customerName = customer?.name?.trim() || "Customer";
  const franchiseName = customer?.franchiseName?.trim() || customer?.franchise?.name?.trim() || "";
  const totalPoints = customer?.loyaltyPoints ?? 0;
  const franchiseLabel = franchiseName ? ` – ${franchiseName}` : "";

  console.log("franchiseLabel", franchiseLabel);

  return (
    `Hi ${customerName}! 👋❤️\n\n` +
    `Thank you for visiting Egg! ATM${franchiseLabel}! 🥚🔥\n\n` +
    `Today you earned +5 Reward Points! 🎉\n\n` +
    `⭐ Your Total Points: ${totalPoints}\n\n` +
    `🎁 Reach 100 Points and enjoy ANY ONE DISH FREE from our menu! 🍽️🔥\n\n` +
    `See you again soon! ❤️\n` +
    `Egg! ATM – Any Time Muttai 🥚`
  );
}

export function getWhatsappWelcomeLink(customer) {
  const phone = normalizePhoneForWhatsapp(customer?.phone);
  const message = buildWelcomeMessage(customer);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function getCallLink(customer) {
  const digits = String(customer?.phone || "").replace(/\D/g, "");
  return `tel:${digits}`;
}

export function exportCustomersToExcel(customers, filename = "customers.csv") {
  const headers = [
    "Customer Name",
    "Phone Number",
  ];

  const rows = customers.map((c) => {
    return [
      `"${(c.name || "Customer").replace(/"/g, '""')}"`,
      `"${c.phone || ""}"`
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