import type { CustomerRow } from "../types/ReportsAPI";

export type CustomerWithContact = CustomerRow & {
  email: string;
  phone: string;
};

export const CUSTOMER_NAMES = [
  "Sophia K",
  "Michael O",
  "Amy T",
  "David R",
  "Grace I",
  "James M",
  "Emma L",
  "Robert N",
  "Olivia P",
  "William Q",
  "Isabella S",
  "Benjamin T",
  "Mia U",
  "Daniel V",
  "Charlotte W",
  "Matthew X",
  "Amelia Y",
  "Joseph Z",
  "Harper A",
  "Samuel B",
  "Evelyn C",
  "Henry D",
  "Abigail E",
  "Alexander F",
  "Emily G",
];

export const CUSTOMER_SEGMENTS = [
  "Champions",
  "Loyalists",
  "Potential Loyalists",
  "At-Risk",
  "Reactivated",
];

export const CUSTOMER_CHANNELS: Array<CustomerRow["preferredChannel"]> = [
  "Email",
  "SMS",
  "Push",
];

export const CUSTOMER_LOCATIONS = [
  "Nairobi, KE",
  "Kampala, UG",
  "Lagos, NG",
  "Accra, GH",
  "Dar es Salaam, TZ",
  "Kigali, RW",
  "Addis Ababa, ET",
];

const DEVICE_TYPES = ["iOS", "Android", "Web"];

const deterministicValue = (index: number, base: number, modifier: number) =>
  base + (index % modifier);

export const generateMockCustomers = (): CustomerWithContact[] => {
  return Array.from({ length: CUSTOMER_NAMES.length }).map((_, index) => {
    const id = `CUST-${String(35000 + index).padStart(5, "0")}`;
    const name = CUSTOMER_NAMES[index % CUSTOMER_NAMES.length];
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
    const phone = `+2547${(1000000 + index * 37).toString().slice(-7)}`;

    const segment = CUSTOMER_SEGMENTS[index % CUSTOMER_SEGMENTS.length];
    const segments =
      index % 5 === 0
        ? [segment, CUSTOMER_SEGMENTS[(index + 2) % CUSTOMER_SEGMENTS.length]]
        : index % 7 === 0
        ? [segment, CUSTOMER_SEGMENTS[(index + 3) % CUSTOMER_SEGMENTS.length]]
        : [segment];
    const preferredChannel =
      CUSTOMER_CHANNELS[index % CUSTOMER_CHANNELS.length];
    const location = CUSTOMER_LOCATIONS[index % CUSTOMER_LOCATIONS.length];

    const lifetimeValue = 1500 + (index % 25) * 220;
    const orders = 5 + (index % 20);
    const aov = Math.round(lifetimeValue / Math.max(orders, 1));
    const engagementScore = deterministicValue(index, 45, 50);
    const churnRisk = deterministicValue(index, 25, 75);
    const clv = Math.round(lifetimeValue * 1.15);

    const daysSinceInteraction = deterministicValue(index, 2, 30);
    const lastInteractionDate = new Date();
    lastInteractionDate.setDate(
      lastInteractionDate.getDate() - daysSinceInteraction
    );

    const lastPurchase =
      daysSinceInteraction === 0
        ? "Today"
        : `${daysSinceInteraction} day${
            daysSinceInteraction === 1 ? "" : "s"
          } ago`;

    const deviceType = DEVICE_TYPES[index % DEVICE_TYPES.length];

    return {
      id,
      name,
      segment,
      segments,
      lifetimeValue,
      clv,
      orders,
      aov,
      lastPurchase,
      lastInteractionDate: lastInteractionDate.toISOString(),
      engagementScore,
      churnRisk,
      preferredChannel,
      location,
      email,
      phone,
      deviceType,
    } as CustomerWithContact;
  });
};
