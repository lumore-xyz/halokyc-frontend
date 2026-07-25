import { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

const siteUrl = publicEnv.siteUrl;

const marketingRoutes = [
  "/",
  "/product",
  "/workflow",
  "/security",
  "/pricing",
  "/credits",
  "/privacy",
  "/terms",
  "/data-retention",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: marketingRoutes,
      disallow: [
        "/admin/",
        "/dashboard/",
        "/login/",
        "/select-account/",
        "/verify/",
        "/privacy/dashboard/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}