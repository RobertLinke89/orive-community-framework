// Sample facilitators - properly linked to sessionsData
// First 15 facilitators match exactly with session facilitators

const facilitatorImages = [
  '/facilitators/facilitator-1.jpg',
  '/facilitators/facilitator-2.jpg',
  '/facilitators/facilitator-3.jpg',
  '/facilitators/facilitator-4.jpg',
  '/facilitators/facilitator-5.jpg',
  '/facilitators/facilitator-6.jpg',
  '/facilitators/facilitator-7.jpg',
  '/facilitators/facilitator-8.jpg',
  '/facilitators/facilitator-9.jpg',
  '/facilitators/facilitator-10.jpg',
  '/facilitators/facilitator-11.jpg',
  '/facilitators/facilitator-12.jpg',
  '/facilitators/facilitator-13.jpg',
  '/facilitators/facilitator-14.jpg',
  '/facilitators/facilitator-15.jpg',
  '/facilitators/wellness-facilitator-1.jpg',
  '/facilitators/wellness-facilitator-2.jpg',
  '/facilitators/wellness-facilitator-3.jpg',
  '/facilitators/wellness-facilitator-4.jpg',
  '/facilitators/wellness-facilitator-5.jpg',
  '/facilitators/wellness-facilitator-6.jpg',
  '/facilitators/wellness-facilitator-7.jpg',
  '/facilitators/wellness-facilitator-8.jpg',
  '/facilitators/wellness-facilitator-9.jpg',
];

export interface Facilitator {
  id: string;
  username?: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  views: number;
  tags: string[];
  hourlyRate: string;
  location: string;
  bio?: string;
  professionalTitle?: string;
  source_platform?: string;
  source_url?: string;
  isClaimed?: boolean;
}

// Core facilitators that match sessions exactly (IDs 1-15)
// These facilitators are referenced in sessionsData.ts
const coreFacilitators: Facilitator[] = [
  {
    id: '1',
    username: 'emma-berg',
    name: 'Emma van der Berg',
    avatar: '/facilitators/facilitator-1.jpg',
    isVerified: true,
    rating: 5.0,
    reviewCount: 183,
    views: 777,
    tags: ['Breathwork', 'Nervous System Regulation', 'Transformation'],
    hourlyRate: '€95 /hr',
    location: 'Amsterdam, Netherlands',
    bio: "Emma is a certified breathwork specialist dedicated to helping individuals unlock their inner potential through deep somatic practices and nervous system regulation. With over 8 years of experience in the wellness space, she guides her clients with compassion and professional expertise.",
    professionalTitle: "Somatic Breathwork Expert",
  },
  {
    id: '2',
    username: 'marcus-hoffmann',
    name: 'Marcus Hoffmann',
    avatar: '/facilitators/facilitator-2.jpg',
    isVerified: true,
    rating: 4.9,
    reviewCount: 89,
    views: 654,
    tags: ['Life Coaching', 'Performance Mindset', 'Executive Growth'],
    hourlyRate: '€110 /hr',
    location: 'Berlin, Germany',
    bio: "Marcus specializes in high-performance coaching and mindset optimization for leaders and visionaries. His approach combines modern psychology with practical leadership strategies to drive meaningful personal and professional growth.",
    professionalTitle: "Executive Performance Coach",
  },
  {
    id: '3',
    username: 'mei-chen',
    name: 'Mei Chen',
    avatar: '/facilitators/facilitator-3.jpg',
    isVerified: true,
    rating: 5.0,
    reviewCount: 156,
    views: 892,
    tags: ['Meditation', 'Mindfulness', 'Stress Management'],
    hourlyRate: '€85 /hr',
    location: 'Utrecht, Netherlands',
    bio: "Mei is a mindfulness mentor who bridges ancient wisdom with modern daily life. Her sessions focus on practical techniques to reduce stress and cultivate a lasting sense of inner peace and mental clarity.",
    professionalTitle: "Mindfulness & Zen Consultant",
  },
  {
    id: '4',
    username: 'david-morrison',
    name: 'David Morrison',
    avatar: '/facilitators/facilitator-4.jpg',
    isVerified: true,
    rating: 4.9,
    reviewCount: 203,
    views: 1023,
    tags: ['Spiritual Growth', 'Guidance', 'Self-Discovery'],
    hourlyRate: '€120 /hr',
    location: 'Lisbon, Portugal',
    bio: "David is a spiritual guide who helps seekers navigate their path toward self-discovery and purpose. His intuitive approach and deep understanding of spiritual traditions offer a unique container for personal transformation.",
    professionalTitle: "Spiritual Guide & Transformation Mentor",
  },
  {
    id: '5',
    username: 'sophie-laurent',
    name: 'Sophie Laurent',
    avatar: '/facilitators/facilitator-5.jpg',
    isVerified: true,
    rating: 4.8,
    reviewCount: 94,
    views: 567,
    tags: ['Yoga', 'Movement', 'Flexibility'],
    hourlyRate: '€75 /hr',
    location: 'Paris, France',
    bio: "Sophie is an elite yoga instructor focusing on anatomical precision and fluid movement. Her classes are designed to build both physical strength and mental resilience, making yoga accessible yet challenging.",
    professionalTitle: "Precision Vinyasa Master",
  },
  {
    id: '6',
    username: 'thomas-schneider',
    name: 'Thomas Schneider',
    avatar: '/facilitators/facilitator-6.jpg',
    isVerified: true,
    rating: 4.9,
    reviewCount: 112,
    views: 689,
    tags: ['Massage', 'Pain Relief', 'Relaxation'],
    hourlyRate: '€130 /hr',
    location: 'Vienna, Austria',
    bio: "Thomas is a master of therapeutic bodywork, specializing in sports recovery and chronic pain management. His holistic approach ensures that both the symptoms and root causes of physical tension are addressed.",
    professionalTitle: "Advanced Therapeutic Bodyworker",
  },
  {
    id: '7',
    username: 'isabella-romano',
    name: 'Isabella Romano',
    avatar: '/facilitators/facilitator-7.jpg',
    isVerified: true,
    rating: 4.9,
    reviewCount: 145,
    views: 743,
    tags: ['Nutrition', 'Health', 'Wellness'],
    hourlyRate: '€100 /hr',
    location: 'Rome, Italy',
    bio: "Isabella is a clinical nutritionist dedicated to the science of vibrant living. She empowers her clients to achieve optimal health through personalized nutritional strategies that are both sustainable and evidence-based.",
    professionalTitle: "Clinical Nutrition Specialist",
  },
  {
    id: '8',
    username: 'lucas-mendes',
    name: 'Lucas Mendes',
    avatar: '/facilitators/facilitator-8.jpg',
    isVerified: true,
    rating: 4.7,
    reviewCount: 78,
    views: 456,
    tags: ['Business', 'Career', 'Strategy'],
    hourlyRate: '€90 /hr',
    location: 'Barcelona, Spain',
    bio: "Lucas is a strategic career advisor supporting creative professionals in scaling their impact. He combines business acumen with holistic principles to help clients build fulfilling and prosperous careers.",
    professionalTitle: "Creative Business Strategist",
  },
  {
    id: '9',
    username: 'gabriella-rossi',
    name: 'Gabriella Rossi',
    avatar: '/facilitators/facilitator-9.jpg',
    isVerified: true,
    rating: 4.8,
    reviewCount: 134,
    views: 612,
    tags: ['Holistic Health', 'Energy Work', 'Healing'],
    hourlyRate: '€95 /hr',
    location: 'Milan, Italy',
    bio: "Gabriella is a holistic health pioneer in Milan, integrating ancient energy healing traditions with contemporary wellness coaching for a complete mind-body-spirit transformation.",
    professionalTitle: "Holistic Health Architect",
  },
  {
    id: '10',
    username: 'alex-rivera',
    name: 'Alex Rivera',
    avatar: '/facilitators/facilitator-10.jpg',
    isVerified: true,
    rating: 4.9,
    reviewCount: 167,
    views: 789,
    tags: ['Movement', 'Dance', 'Expression'],
    hourlyRate: '€85 /hr',
    location: 'Madrid, Spain',
    bio: "Alex uses the power of movement and conscious dance to help individuals reconnect with their authentic expression and release stored physical tension through creative flow.",
    professionalTitle: "Conscious Movement Facilitator",
  },
  {
    id: '11',
    username: 'nina-petersen',
    name: 'Nina Petersen',
    avatar: '/facilitators/facilitator-11.jpg',
    isVerified: true,
    rating: 4.9,
    reviewCount: 168,
    views: 834,
    tags: ['Sound Healing', 'Energy Work', 'Relaxation'],
    hourlyRate: '€95 /hr',
    location: 'Copenhagen, Denmark',
    bio: "Nina is a sound medicine practitioner who uses frequency and vibration to facilitate deep states of cellular relaxation and emotional processing in the heart of Copenhagen.",
    professionalTitle: "Vibrational Medicine Specialist",
  },
  {
    id: '12',
    username: 'henrik-larsson',
    name: 'Henrik Larsson',
    avatar: '/facilitators/facilitator-12.jpg',
    isVerified: true,
    rating: 4.8,
    reviewCount: 98,
    views: 534,
    tags: ['Fitness', 'Movement', 'Lifestyle'],
    hourlyRate: '€80 /hr',
    location: 'Stockholm, Sweden',
    bio: "Henrik's approach to fitness is rooted in longevity and functional integrity. He coaches high-performance individuals to build resilient bodies that support their complex professional lives.",
    professionalTitle: "Longevity & Performance Coach",
  },
  {
    id: '13',
    username: 'olivia-walsh',
    name: 'Olivia Walsh',
    avatar: '/facilitators/facilitator-13.jpg',
    isVerified: true,
    rating: 4.9,
    reviewCount: 149,
    views: 721,
    tags: ['Energy Work', 'Reiki', 'Healing'],
    hourlyRate: '€80 /hr',
    location: 'Dublin, Ireland',
    bio: "Olivia is a master Reiki practitioner who provides a serene space for energetic rebalancing and spiritual alignment, helping clients find clarity amidst the chaos of modern life.",
    professionalTitle: "Master Energy Practitioner",
  },
  {
    id: '14',
    username: 'sebastian-mueller',
    name: 'Sebastian Mueller',
    avatar: '/facilitators/facilitator-14.jpg',
    isVerified: true,
    rating: 4.8,
    reviewCount: 122,
    views: 678,
    tags: ['Somatic', 'Trauma Release', 'Bodywork'],
    hourlyRate: '€125 /hr',
    location: 'Zurich, Switzerland',
    bio: "Sebastian's somatic trauma release work is highly sought after for its efficacy and gentle, compassionate approach to healing complex emotional patterns stored in the physical body.",
    professionalTitle: "Somatic Trauma Specialist",
  },
  {
    id: '15',
    username: 'victoria-chen',
    name: 'Victoria Chen',
    avatar: '/facilitators/facilitator-15.jpg',
    isVerified: true,
    rating: 5.0,
    reviewCount: 178,
    views: 945,
    tags: ['Leadership', 'Transformation', 'Coaching'],
    hourlyRate: '€150 /hr',
    location: 'Brussels, Belgium',
    bio: "Victoria is a transformational leadership coach who empowers female executives to lead with emotional intelligence, authenticity, and profound impact on their organizations.",
    professionalTitle: "Executive Transformation Strategist",
  },
  {
    id: '16',
    username: 'clara-santos',
    name: 'Clara Santos',
    avatar: '/facilitators/wellness-facilitator-1.jpg',
    isVerified: true,
    rating: 5.0,
    reviewCount: 245,
    views: 1205,
    tags: ['Somatic Healing', 'Breathwork', 'Holistic Wealth'],
    hourlyRate: '€120 /hr',
    location: 'São Paulo, Brazil',
    bio: "Clara is a world-renowned somatic healer and breathwork facilitator. Her work focuses on the intersection of physical release and emotional intelligence, providing a safe container for deep transformational journeys.",
    professionalTitle: "Master Somatic Healer",
  },
];

// Additional specialty sets for generated facilitators
const specialtySets = [
  ['Life Coaching', 'Mindfulness', 'Leadership'],
  ['Wellness Coaching', 'Nutrition', 'Lifestyle'],
  ['Breathwork', 'Meditation', 'Stress Management'],
  ['Meditation', 'Spiritual Growth', 'Mindfulness'],
  ['Yoga', 'Movement', 'Fitness'],
  ['BodyWork', 'Massage Therapy', 'Pain Relief'],
  ['Holistic Health', 'Nutrition', 'Wellness'],
  ['Ceremony', 'Ritual', 'Spiritual Guidance'],
  ['Sound Healing', 'Energy Work', 'Relaxation'],
  ['Movement', 'Dance', 'Expression'],
  ['Energy Work', 'Reiki', 'Healing'],
  ['Somatic Therapy', 'Trauma Release', 'BodyWork'],
  ['Transformation', 'Personal Growth', 'Coaching'],
  ['Yoga', 'Breathwork', 'Meditation'],
  ['Mindfulness', 'Stress Management', 'Wellness'],
  ['Leadership', 'Career', 'Motivation'],
  ['Holistic Health', 'Ceremony', 'Healing'],
  ['Fitness', 'Movement', 'Lifestyle'],
  ['Spiritual Growth', 'Meditation', 'Mindfulness'],
  ['Nutrition', 'Wellness Coaching', 'Lifestyle'],
];

const additionalFirstNames = [
  'Aisha', 'Raj', 'Yuki', 'Carlos', 'Fatima', 'Liam', 'Anya', 'Mohammed',
  'Maria', 'James', 'Sofia', 'Kenji', 'Priya', 'Omar', 'Elena',
  'Kofi', 'Amara', 'Viktor', 'Ingrid', 'Andrei', 'Nadia', 'Paulo', 'Leila',
  'Sven', 'Thabo', 'Yara', 'Diego', 'Valentina', 'Hiroshi', 'Zara', 'Ivan',
  'Astrid', 'Malik', 'Hana', 'Ravi', 'Chloe', 'Tariq', 'Ines', 'Akira',
  'Freya', 'Ahmad', 'Luna', 'Mateo', 'Amina', 'Felix', 'Rosa', 'Leo',
  'Jade', 'Kwame', 'Vera', 'Ali', 'Mia', 'Erik', 'Naomi', 'Pierre',
];

const additionalLastNames = [
  'Patel', 'Nakamura', 'Garcia', 'Hassan', "O'Brien", 'Petrova', 'Al-Hassan',
  'Zhang', 'Silva', 'Brown', 'Fernandez', 'Tanaka', 'Sharma', 'Ibrahim', 'Volkov',
  'Mensah', 'Diallo', 'Novak', 'Andersen', 'Popov', 'Kowalski', 'Santos', 'Farah',
  'Johansson', 'Mbeki', 'El-Amin', 'Martinez', 'Lombardi', 'Sato', 'Ahmed', 'Kozlov',
  'Eriksen', 'Okonkwo', 'Cohen', 'Singh', 'Dubois', 'Rashid', 'Costa', 'Yamamoto',
  'Nielsen', 'Kareem', 'Fischer', 'Torres', 'Kone', 'Wagner', 'Cruz', 'Lee',
];

// Additional countries for generated facilitators
const additionalCountryData: { country: string; city: string }[] = [
  { country: 'Poland', city: 'Warsaw' },
  { country: 'Czech Republic', city: 'Prague' },
  { country: 'Greece', city: 'Athens' },
  { country: 'Hungary', city: 'Budapest' },
  { country: 'Norway', city: 'Oslo' },
  { country: 'Finland', city: 'Helsinki' },
  { country: 'Japan', city: 'Tokyo' },
  { country: 'South Korea', city: 'Seoul' },
  { country: 'Australia', city: 'Sydney' },
  { country: 'Canada', city: 'Toronto' },
  { country: 'Brazil', city: 'São Paulo' },
  { country: 'Mexico', city: 'Mexico City' },
  { country: 'Argentina', city: 'Buenos Aires' },
  { country: 'India', city: 'Mumbai' },
  { country: 'Thailand', city: 'Bangkok' },
  { country: 'Singapore', city: 'Singapore' },
  { country: 'United Arab Emirates', city: 'Dubai' },
  { country: 'South Africa', city: 'Cape Town' },
  { country: 'New Zealand', city: 'Auckland' },
  { country: 'Indonesia', city: 'Bali' },
  { country: 'Morocco', city: 'Marrakech' },
  { country: 'Egypt', city: 'Cairo' },
  { country: 'Croatia', city: 'Zagreb' },
  { country: 'Romania', city: 'Bucharest' },
  { country: 'Turkey', city: 'Istanbul' },
  { country: 'Israel', city: 'Tel Aviv' },
  { country: 'Kenya', city: 'Nairobi' },
  { country: 'Ghana', city: 'Accra' },
  { country: 'Chile', city: 'Santiago' },
  { country: 'Colombia', city: 'Bogotá' },
  { country: 'Peru', city: 'Lima' },
  { country: 'Vietnam', city: 'Ho Chi Minh City' },
  { country: 'Philippines', city: 'Manila' },
  { country: 'Malaysia', city: 'Kuala Lumpur' },
  { country: 'Taiwan', city: 'Taipei' },
];

// Generate additional facilitators (IDs 16+)
const generatedFacilitators: Facilitator[] = additionalCountryData.map((location, index) => {
  const firstName = additionalFirstNames[index % additionalFirstNames.length];
  const lastName = additionalLastNames[index % additionalLastNames.length];
  const avatar = facilitatorImages[(index + 15) % facilitatorImages.length];
  const specialties = specialtySets[index % specialtySets.length];
  
  // Generate varied but realistic data
  const rating = Number((4.5 + Math.random() * 0.5).toFixed(1));
  const reviewCount = 50 + Math.floor(Math.random() * 200);
  const views = 100 + Math.floor(Math.random() * 500);
  const hourlyRate = 60 + Math.floor(Math.random() * 100);
  
  return {
    id: String(index + 17), // Start from 17 since core facilitators are 1-16
    username: `${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
    name: `${firstName} ${lastName}`,
    avatar,
    isVerified: Math.random() > 0.2, // 80% verified
    rating,
    reviewCount,
    views,
    tags: specialties,
    hourlyRate: `€${hourlyRate} /hr`,
    location: `${location.city}, ${location.country}`,
  };
});

import { crawledFacilitators } from './crawledOfferings';

// Combine crawled facilitators, core facilitators with generated ones
export const facilitators: Facilitator[] = [
  ...crawledFacilitators,
  ...coreFacilitators,
  ...generatedFacilitators,
];

// Helper to get a facilitator by ID or username
export const getFacilitatorById = (id: string): Facilitator | undefined => {
  return facilitators.find(f => f.id === id || f.username === id);
};

// Helper to get facilitators by location (country)
export const getFacilitatorsByCountry = (country: string): Facilitator[] => {
  return facilitators.filter(f => f.location.toLowerCase().includes(country.toLowerCase()));
};

export default facilitators;
