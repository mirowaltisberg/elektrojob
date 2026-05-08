import type { Metadata } from "next";
import { RoleHubPage } from "@/app/_components/role-hub-page";
import { findRoleHub } from "@/lib/role-hubs";

const SLUG = "elektroplaner-jobs";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const config = findRoleHub(SLUG)!;
  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: `/${SLUG}` },
    openGraph: {
      title: `${config.title} | elektrojob.ch`,
      description: config.description,
      url: `/${SLUG}`,
      type: "website",
      siteName: "elektrojob.ch",
      locale: "de_CH",
    },
  };
}

export default async function Page() {
  const config = findRoleHub(SLUG)!;
  return <RoleHubPage config={config} />;
}
