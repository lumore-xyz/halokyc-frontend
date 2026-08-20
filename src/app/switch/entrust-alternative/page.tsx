import type { Metadata } from "next";

import OnfidoAlternativePage from "@/app/switch/onfido-alternative/page";
import { publicEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Entrust Identity Verification alternative",
  description:
    "Compare HaloKYC and Entrust Identity Verification across pricing visibility, workflows, global coverage, duplicate controls, and integration.",
  metadataBase: new URL(publicEnv.siteUrl),
  alternates: { canonical: "/switch/entrust-alternative" },
  openGraph: {
    title: "A focused Entrust IDV alternative for startup KYC | HaloKYC",
    description:
      "An honest comparison of HaloKYC and Entrust Identity Verification for product teams choosing a KYC stack.",
    type: "website",
    url: "/switch/entrust-alternative",
    siteName: "HaloKYC",
  },
};

export default OnfidoAlternativePage;
