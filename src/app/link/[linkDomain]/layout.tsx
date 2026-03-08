import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_HOST_NAME;

type PartyroomOG = {
  title: string;
  introduction: string;
};

async function fetchPartyroomByLink(linkDomain: string): Promise<PartyroomOG | null> {
  try {
    const res = await fetch(`${API_BASE}v1/partyrooms/link/${linkDomain}/enter`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

type Props = {
  params: { linkDomain: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const partyroom = await fetchPartyroomByLink(params.linkDomain);

  return {
    title: partyroom?.title ?? 'PFPlay',
    description: partyroom?.introduction ?? 'PFP Playground for music',
    openGraph: {
      title: partyroom?.title ?? 'PFPlay',
      description: partyroom?.introduction ?? 'PFP Playground for music',
      type: 'website',
      images: [`/api/og?linkDomain=${params.linkDomain}`],
    },
  };
}

export default function LinkLayout({ children }: PropsWithChildren) {
  return <>{children}</>;
}
