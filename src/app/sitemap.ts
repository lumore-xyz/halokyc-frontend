import { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

const siteUrl = publicEnv.siteUrl;

const marketingRoutes = [
  { path: "/", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  { path: "/product", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { path: "/workflow", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { path: "/security", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { path: "/pricing", lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { path: "/switch", lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { path: "/switch/didit-alternative", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { path: "/switch/persona-alternative", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { path: "/switch/sumsub-alternative", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { path: "/switch/veriff-alternative", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { path: "/switch/jumio-alternative", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { path: "/switch/onfido-alternative", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { path: "/switch/entrust-alternative", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { path: "/switch/idenfy-alternative", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { path: "/credits", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacy", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { path: "/terms", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { path: "/data-retention", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return marketingRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
