// src/app/archive/[id]/page.tsx
import { supabase } from '@/lib/supabase';
import ExhibitClient from './ExhibitClient';
import { notFound } from 'next/navigation';
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabase
    .from('exhibits')
    .select('*')
    .eq('catalog_id', id.toUpperCase())
    .eq('is_approved', true)
    .single();
  if (!data) return { title: 'Archive of Almost' };
  return {
    title: "${data.title}" — ${data.catalog_id} | Archive of Almost,
    description: data.description?.slice(0, 160),
    openGraph: {
      title: "${data.title}" — Archive of Almost,
      description: data.description?.slice(0, 160),
      images: [{ url: data.image_url, width: 1200, height: 1200 }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: "${data.title}" — Archive of Almost,
      description: data.description?.slice(0, 160),
      images: [data.image_url],
    },
  };
}
export default async function ExhibitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabase
    .from('exhibits')
    .select('*')
    .eq('catalog_id', id.toUpperCase())
    .eq('is_approved', true)
    .single();
  if (!data) notFound();
  return <ExhibitClient exhibit={data} />;
}
