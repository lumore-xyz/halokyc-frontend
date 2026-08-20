import { publicEnv } from "@/lib/env";

interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  sameAs?: string[];
  contactPoint?: {
    "@type": "ContactPoint";
    telephone: string;
    contactType: string;
    availableLanguage: string[];
  }[];
}

export function organizationSchema(): OrganizationSchema {
  const baseUrl = publicEnv.siteUrl;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HaloKYC",
    url: baseUrl,
    logo: `${baseUrl}/assets/logo/halokyc-icon.svg`,
    sameAs: [
      "https://twitter.com/halokyc",
      "https://github.com/halokyc",
      "https://linkedin.com/company/halokyc",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-22-XXXX-XXXX",
        contactType: "customer service",
        availableLanguage: ["English"],
      },
    ],
  };
}

interface SoftwareApplicationSchema {
  "@context": "https://schema.org";
  "@type": "SoftwareApplication";
  name: string;
  applicationCategory: "BusinessApplication";
  operatingSystem: "Cloud";
  offers: {
    "@type": "Offer";
    price: string;
    priceCurrency: "USD";
    availability: "https://schema.org/InStock";
  };
  description: string;
  featureList: string[];
  publisher: {
    "@type": "Organization";
    name: "HaloKYC";
  };
  url: string;
}

export function softwareApplicationSchema(): SoftwareApplicationSchema {
  const baseUrl = publicEnv.siteUrl;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "HaloKYC Identity Verification API",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Cloud",
    offers: {
      "@type": "Offer",
      price: "0.05",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    description:
      "One API for identity verification: selfie capture, document OCR, liveness, face match, age checks, duplicate detection, risk scoring, and a review queue your team controls.",
    featureList: [
      "Selfie and document capture",
      "Document OCR extraction",
      "Liveness detection",
      "Face matching",
      "Age verification",
      "Duplicate detection",
      "Risk scoring",
      "Manual review queue",
      "Signed webhook delivery",
    ],
    publisher: {
      "@type": "Organization",
      name: "HaloKYC",
    },
    url: `${baseUrl}/product`,
  };
}

interface FAQPageSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: {
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }[];
}

export function faqPageSchema(
  faqs: { question: string; answer: string }[],
): FAQPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

interface BreadcrumbListSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }[];
}

export function breadcrumbListSchema(
  items: { name: string; url: string }[],
): BreadcrumbListSchema {
  const baseUrl = publicEnv.siteUrl;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

interface ItemListSchema {
  "@context": "https://schema.org";
  "@type": "ItemList";
  name: string;
  numberOfItems: number;
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    url: string;
  }[];
}

export function itemListSchema(
  name: string,
  items: readonly { name: string; url: string }[],
): ItemListSchema {
  const baseUrl = publicEnv.siteUrl;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${baseUrl}${item.url}`,
    })),
  };
}

interface WebPageSchema {
  "@context": "https://schema.org";
  "@type": "WebPage";
  name: string;
  description: string;
  url: string;
  publisher: {
    "@type": "Organization";
    name: "HaloKYC";
  };
}

export function webPageSchema(
  name: string,
  description: string,
  url: string,
): WebPageSchema {
  const baseUrl = publicEnv.siteUrl;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: `${baseUrl}${url}`,
    publisher: {
      "@type": "Organization",
      name: "HaloKYC",
    },
  };
}

export function productSchema() {
  return [organizationSchema(), softwareApplicationSchema()];
}
