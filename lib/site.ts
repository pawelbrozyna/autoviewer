export const navLinks = [
  { href: "/check-a-vehicle", label: "Car Reg Check" },
  { href: "/mot-history", label: "MOT History" },
  { href: "/mileage-check", label: "Mileage Check" },
  { href: "/compare-cars", label: "Compare Cars" },
  { href: "/running-costs", label: "Running Costs" },
  { href: "/guides", label: "Guides" },
] as const;

export const footerTools = [
  { href: "/check-a-vehicle", label: "Car Reg Check" },
  { href: "/mot-history", label: "MOT History Check" },
  { href: "/mileage-check", label: "Car Mileage Check" },
  { href: "/car-tax-check", label: "Car Tax Check" },
  { href: "/recall-check", label: "Car Recall Check" },
  { href: "/vehicle-details", label: "Car Details by Registration" },
  { href: "/compare-cars", label: "Compare Cars" },
  { href: "/running-costs", label: "Running Costs" },
  { href: "/guides", label: "Guides" },
] as const;

export const footerCompany = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

type RelatedTool = { href: string; label: string; description: string };

const related = {
  carRegCheck: {
    href: "/check-a-vehicle",
    label: "Car reg check",
    description: "MOT, tax, mileage, recalls and more in one free check.",
  },
  motHistory: {
    href: "/mot-history",
    label: "MOT history check",
    description: "Review past MOT results and advisories.",
  },
  mileageCheck: {
    href: "/mileage-check",
    label: "Car mileage check",
    description: "Review mileage recorded at each MOT.",
  },
  carTaxCheck: {
    href: "/car-tax-check",
    label: "Car tax check",
    description: "Check tax and SORN status by registration.",
  },
  recallCheck: {
    href: "/recall-check",
    label: "Car recall check",
    description: "See available safety recall information.",
  },
  carDetails: {
    href: "/vehicle-details",
    label: "Car details by registration",
    description: "Look up make, model, fuel and year by registration.",
  },
  compareCars: {
    href: "/compare-cars",
    label: "Compare cars by registration",
    description: "Compare two registrations side by side.",
  },
  runningCosts: {
    href: "/running-costs",
    label: "Running costs calculator",
    description: "Estimate fuel, tax and ownership costs.",
  },
  motAdvisories: {
    href: "/guides/mot-advisories-explained",
    label: "MOT advisories explained",
    description: "Understand advisory, major and dangerous defects.",
  },
  buyingChecklist: {
    href: "/guides/used-car-buying-checklist",
    label: "Used car buying checklist",
    description: "What to check before you buy.",
  },
} satisfies Record<string, RelatedTool>;

export const relatedToolsMap: Record<string, RelatedTool[]> = {
  "check-a-vehicle": [
    related.motHistory,
    related.recallCheck,
    related.compareCars,
  ],
  "mot-history": [
    related.mileageCheck,
    related.motAdvisories,
    related.carRegCheck,
  ],
  "mileage-check": [
    related.motHistory,
    related.carRegCheck,
    related.buyingChecklist,
    related.carTaxCheck,
  ],
  "car-tax-check": [
    related.runningCosts,
    related.motHistory,
    related.mileageCheck,
  ],
  "recall-check": [
    related.motHistory,
    related.carRegCheck,
    related.buyingChecklist,
  ],
  "vehicle-details": [
    related.carRegCheck,
    related.compareCars,
    related.runningCosts,
  ],
  "compare-cars": [
    related.carRegCheck,
    related.carDetails,
    related.runningCosts,
  ],
  "running-costs": [
    related.carTaxCheck,
    related.compareCars,
    related.carRegCheck,
  ],
};
