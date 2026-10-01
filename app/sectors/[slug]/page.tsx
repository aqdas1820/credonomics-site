import { notFound } from 'next/navigation';
import { SECTORS } from '../../data/sectors';
import { SectorIntelligenceService } from '../../../src/services/research/SectorIntelligenceService';
import SectorClient from './SectorClient';

export async function generateStaticParams() {
  return SECTORS.map(s => ({ slug: s.slug }));
}

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  if (!SECTORS.find(s => s.slug === slug)) {
    notFound();
  }

  // Generate metadata / fetch initial data server side
  const sectorIntelligence = await SectorIntelligenceService.getSectorIntelligence(slug);
  
  if (!sectorIntelligence) {
    notFound();
  }

  return <SectorClient data={sectorIntelligence} />;
}
