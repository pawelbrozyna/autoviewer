import type { Metadata } from "next";
import { ComingSoonHome } from "@/components/home/ComingSoonHome";

export const metadata: Metadata = {
  title: "AutoViewer is coming soon",
  description: "AutoViewer is currently connecting live vehicle data services.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return <ComingSoonHome />;
}
