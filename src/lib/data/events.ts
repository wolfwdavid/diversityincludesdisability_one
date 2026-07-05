// src/lib/data/events.ts — events data. SAMPLE entries are fictional placeholders; replace with real events.
export interface EventItem {
  title: string;
  date: string;        // ISO 'YYYY-MM-DD'
  location: string;
  description: string;
  url?: string;        // optional external link (rel=noopener at render)
}

// NOTE: sample/fictional — confirm/replace with real events before launch.
export const events: EventItem[] = [
  {
    title: 'Intersectional Disability Equity Training (sample)',
    date: '2026-09-15',
    location: 'Online',
    description: 'A sample listing to demonstrate the events layout. Replace with a real event.'
  },
  {
    title: 'Accessible Transit Panel (sample)',
    date: '2026-10-02',
    location: 'New York, NY',
    description: 'A second sample listing. Replace with a real event.'
  }
];
