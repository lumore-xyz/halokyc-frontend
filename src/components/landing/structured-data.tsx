"use client";

import { organizationSchema, softwareApplicationSchema, faqPageSchema, breadcrumbListSchema, webPageSchema } from "@/lib/structured-data";

interface StructuredDataProps {
  schemas: object[];
}

export function StructuredData({ schemas }: StructuredDataProps) {
  if (schemas.length === 0) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas.length === 1 ? schemas[0] : schemas),
      }}
    />
  );
}

export function OrganizationSchema() {
  return <StructuredData schemas={[organizationSchema()]} />;
}

export function ProductSchema() {
  return <StructuredData schemas={[organizationSchema(), softwareApplicationSchema()]} />;
}

export function FAQSchema(faqs: { question: string; answer: string }[]) {
  return <StructuredData schemas={[faqPageSchema(faqs)]} />;
}

export function BreadcrumbSchema(items: { name: string; url: string }[]) {
  return <StructuredData schemas={[breadcrumbListSchema(items)]} />;
}

export function WebPageSchemaComponent(
  name: string,
  description: string,
  url: string,
) {
  return <StructuredData schemas={[webPageSchema(name, description, url)]} />;
}