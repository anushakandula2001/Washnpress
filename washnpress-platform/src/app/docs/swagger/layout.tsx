import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Docs — Wash N Press",
  description: "Interactive Swagger documentation for the Wash N Press REST API.",
};

export default function SwaggerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
