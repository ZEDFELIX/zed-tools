export const CATEGORY_META: Record<
  string,
  { name: string; icon: string; description: string; emoji: string }
> = {
  design: {
    name: 'Design & Creative',
    icon: 'palette',
    description: 'Branding, visuals and creative design tools.',
    emoji: '',
  },
  qr: {
    name: 'QR & Barcode',
    icon: 'qr-code',
    description: 'Generate, scan and manage QR codes.',
    emoji: '',
  },
  image: {
    name: 'Image Tools',
    icon: 'image',
    description: 'Compress, resize, convert and enhance images.',
    emoji: '',
  },
  pdf: {
    name: 'PDF & Documents',
    icon: 'file-text',
    description: 'Merge, split, compress and convert PDFs.',
    emoji: '',
  },
  business: {
    name: 'Business Tools',
    icon: 'briefcase',
    description: 'Invoices, quotes, receipts, CVs and business cards.',
    emoji: '',
  },
  developer: {
    name: 'Developer Tools',
    icon: 'code',
    description: 'JSON, encoding, regex and developer utilities.',
    emoji: '',
  },
  web: {
    name: 'Web Tools',
    icon: 'globe',
    description: 'Meta tags, favicons, sitemaps and web utilities.',
    emoji: '',
  },
  text: {
    name: 'Text Tools',
    icon: 'type',
    description: 'Counters, converters, formatting and text utilities.',
    emoji: '',
  },
  productivity: {
    name: 'Productivity',
    icon: 'timer',
    description: 'Timers, calculators, converters and organization tools.',
    emoji: '',
  },
}

export type CategoryKey = keyof typeof CATEGORY_META