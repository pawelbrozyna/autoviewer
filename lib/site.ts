export const navLinks = [
  { href: "/check-a-vehicle", label: "Check a Vehicle" },
  { href: "/mot-history", label: "MOT History" },
  { href: "/tax-mileage", label: "Tax & Mileage" },
  { href: "/compare-cars", label: "Compare Cars" },
  { href: "/running-costs", label: "Running Costs" },
  { href: "/guides", label: "Guides" },
] as const;

export const footerTools = [
  { href: "/check-a-vehicle", label: "Check a Vehicle" },
  { href: "/mot-history", label: "MOT History" },
  { href: "/tax-mileage", label: "Tax & Mileage" },
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

export const relatedToolsMap: Record<
  string,
  Array<{ href: string; label: string; description: string }>
> = {
  "check-a-vehicle": [
    {
      href: "/mot-history",
      label: "MOT History",
      description: "Review past MOT results and advisories.",
    },
    {
      href: "/tax-mileage",
      label: "Tax & Mileage",
      description: "Check tax status and mileage history together.",
    },
    {
      href: "/compare-cars",
      label: "Compare Cars",
      description: "Compare two registrations side by side.",
    },
  ],
  "mot-history": [
    {
      href: "/tax-mileage",
      label: "Tax & Mileage",
      description: "Pair MOT history with tax and mileage.",
    },
    {
      href: "/check-a-vehicle",
      label: "Full Vehicle Check",
      description: "MOT, tax, recalls and more in one view.",
    },
    {
      href: "/guides/mot-advisories-explained",
      label: "MOT Advisories Guide",
      description: "Understand advisory, major and dangerous defects.",
    },
  ],
  "tax-mileage": [
    {
      href: "/car-tax-check",
      label: "Car Tax Check",
      description: "Focused guide to VED and SORN status.",
    },
    {
      href: "/mileage-check",
      label: "Mileage Check",
      description: "Focused guide to MOT mileage history.",
    },
    {
      href: "/mot-history",
      label: "MOT History",
      description: "Review full MOT results and advisories.",
    },
  ],
  "car-tax-check": [
    {
      href: "/tax-mileage",
      label: "Tax & Mileage",
      description: "See tax status and mileage history together.",
    },
    {
      href: "/running-costs",
      label: "Running Costs",
      description: "Estimate yearly ownership costs including tax.",
    },
    {
      href: "/mot-history",
      label: "MOT History",
      description: "Check MOT status alongside tax.",
    },
  ],
  "mileage-check": [
    {
      href: "/tax-mileage",
      label: "Tax & Mileage",
      description: "See mileage history with current tax status.",
    },
    {
      href: "/mot-history",
      label: "MOT History",
      description: "Mileage is recorded at each MOT test.",
    },
    {
      href: "/check-a-vehicle",
      label: "Full Vehicle Check",
      description: "Combine mileage with tax and recalls.",
    },
  ],
  "recall-check": [
    {
      href: "/check-a-vehicle",
      label: "Full Vehicle Check",
      description: "See recalls with MOT and tax status.",
    },
    {
      href: "/mot-history",
      label: "MOT History",
      description: "Review safety-related MOT defects.",
    },
    {
      href: "/guides/used-car-buying-checklist",
      label: "Buying Checklist",
      description: "What to check before you buy.",
    },
  ],
  "vehicle-details": [
    {
      href: "/check-a-vehicle",
      label: "Full Vehicle Check",
      description: "Go beyond specs to history and status.",
    },
    {
      href: "/tax-mileage",
      label: "Tax & Mileage",
      description: "Confirm tax status and mileage history.",
    },
    {
      href: "/running-costs",
      label: "Running Costs",
      description: "Estimate fuel, tax and ownership costs.",
    },
  ],
  "compare-cars": [
    {
      href: "/check-a-vehicle",
      label: "Vehicle Check",
      description: "Deep-dive a single registration.",
    },
    {
      href: "/running-costs",
      label: "Running Costs",
      description: "Estimate yearly costs for either car.",
    },
    {
      href: "/mot-history",
      label: "MOT History",
      description: "Compare MOT outcomes in detail.",
    },
  ],
  "running-costs": [
    {
      href: "/tax-mileage",
      label: "Tax & Mileage",
      description: "Check tax status and mileage together.",
    },
    {
      href: "/check-a-vehicle",
      label: "Check a Vehicle",
      description: "MOT, tax, recalls and more in one place.",
    },
    {
      href: "/compare-cars",
      label: "Compare Cars",
      description: "Compare two cars before you decide.",
    },
  ],
};
