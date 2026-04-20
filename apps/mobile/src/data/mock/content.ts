export const watchCategories = [
  'Leadership',
  'Financial Mastery',
  'Business',
  'Faith',
  'Discipline',
] as const;

export const watchFeedItems = [
  { id: '1', title: 'Morning mindset reset', duration: '12:04', live: false },
  {
    id: '2',
    title: 'Live Q&A: scaling your vision',
    duration: 'LIVE',
    live: true,
  },
  { id: '3', title: 'Weekly strategy session', duration: '48:22', live: false },
  { id: '4', title: 'Asset protection basics', duration: '19:15', live: false },
  { id: '5', title: 'Community wins spotlight', duration: '8:30', live: false },
  { id: '6', title: 'Executive roundtable', duration: '1:02:10', live: false },
] as const;

export const vaultResources = [
  {
    id: '1',
    title: 'Weekly Asset Planner',
    imageUrl:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: '2',
    title: '30 Day Discipline Map',
    imageUrl:
      'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: '3',
    title: 'Vision Builder',
    imageUrl:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: '4',
    title: 'Success Templates',
    imageUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
] as const;

export const communityPillars = [
  {
    id: '1',
    title: 'Discipline',
    subtitle: 'Habits, focus, accountability',
    icon: 'bubble.left.and.bubble.right.fill' as const,
  },
  {
    id: '2',
    title: 'Business & Wealth',
    subtitle: 'Strategy, income, legacy',
    icon: 'map.fill' as const,
  },
  {
    id: '3',
    title: 'Faith & Purpose',
    subtitle: 'Calling, values, impact',
    icon: 'mountain.2.fill' as const,
  },
] as const;

export const communityActivity = [
  {
    id: '1',
    name: 'Jordan M.',
    snippet: 'Shared a win on this week’s focus challenge…',
    time: '2h ago',
  },
  {
    id: '2',
    name: 'Alex T.',
    snippet: 'Does anyone have the link to the asset planner?',
    time: '5h ago',
  },
  {
    id: '3',
    name: 'Sam R.',
    snippet: 'Grateful for the Monday mentoring moment today.',
    time: '1d ago',
  },
] as const;
