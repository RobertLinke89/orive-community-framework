// Centralized experiences data with proper facilitator connections
// Using public folder URLs for smaller bundle size
const leadershipWorkshop = '/experiences/leadership-workshop.jpg';
const womenLeadership = '/experiences/women-leadership.jpg';
const careerRetreat = '/experiences/career-retreat.jpg';
const nutritionWorkshop = '/experiences/nutrition-workshop.jpg';
const cookingClass = '/experiences/cooking-class.jpg';
const wellnessWeekend = '/experiences/wellness-weekend.jpg';
const breathingCircle = '/experiences/breathing-circle.jpg';
const wimHofWorkshop = '/experiences/wim-hof-workshop.jpg';
const breathworkRetreat = '/experiences/breathwork-retreat.jpg';
const meditationGroup = '/experiences/meditation-group.jpg';
const silentRetreat = '/experiences/silent-retreat.jpg';
const buddhistWorkshop = '/experiences/buddhist-workshop.jpg';
const vinyasaClass = '/experiences/vinyasa-class.jpg';
const yogaMeditation = '/experiences/yoga-meditation.jpg';
const yogaRetreat = '/experiences/yoga-retreat.jpg';
const selfMassage = '/experiences/self-massage.jpg';
const somaticMovement = '/experiences/somatic-movement.jpg';
const bodyworkIntensive = '/experiences/bodywork-intensive.jpg';
const herbalWorkshop = '/experiences/herbal-workshop.jpg';
const healingCircle = '/experiences/healing-circle.jpg';
const holisticRetreat = '/experiences/holistic-retreat.jpg';
const soundBath = '/experiences/sound-bath.jpg';
const ecstaticDance = '/experiences/ecstatic-dance.jpg';
const shadowWork = '/experiences/shadow-work.jpg';
const traumaRetreat = '/experiences/trauma-retreat.jpg';
const cacaoCeremony = '/experiences/cacao-ceremony.jpg';
const fireCeremony = '/experiences/fire-ceremony.jpg';
const reikiCircle = '/experiences/reiki-circle.jpg';
const movementExpression = '/experiences/movement-expression.jpg';
const successSeminar = '/experiences/success-seminar.jpg';
const consciousLeadership = '/experiences/conscious-leadership.jpg';
const yinYoga = '/experiences/yin-yoga.jpg';
const nervousSystem = '/experiences/nervous-system.jpg';

// Facilitator avatars - using public folder paths
const facilitator1 = '/facilitators/facilitator-1.jpg';
const facilitator2 = '/facilitators/facilitator-2.jpg';
const facilitator3 = '/facilitators/facilitator-3.jpg';
const facilitator4 = '/facilitators/facilitator-4.jpg';
const facilitator5 = '/facilitators/facilitator-5.jpg';
const facilitator6 = '/facilitators/facilitator-6.jpg';
const facilitator7 = '/facilitators/facilitator-7.jpg';
const facilitator8 = '/facilitators/facilitator-8.jpg';
const facilitator9 = '/facilitators/facilitator-9.jpg';
const facilitator10 = '/facilitators/facilitator-10.jpg';
const facilitator11 = '/facilitators/facilitator-11.jpg';
const facilitator12 = '/facilitators/facilitator-12.jpg';
const facilitator13 = '/facilitators/facilitator-13.jpg';
const facilitator14 = '/facilitators/facilitator-14.jpg';
const facilitator15 = '/facilitators/facilitator-15.jpg';

export interface Experience {
  id: string;
  title: string;
  facilitatorId: string;
  facilitatorName: string;
  facilitatorAvatar: string;
  rating?: number;
  reviewCount?: number;
  location: string;
  price: number;
  image: string;
  category: string;
  duration: string;
  groupSize: string;
  language?: string;
  type?: 'individual' | 'group' | 'event';
  is_online?: boolean;
  description: string;
  tags: string[];
  whatToExpect?: string[];
  whatToBring?: string[];
  dates?: Array<{
    date: string;
    time: string;
    spots?: number;
  }>;
  reviews?: Array<{
    author: string;
    rating: number;
    date: string;
    text: string;
  }>;
  source_platform?: string;
  source_url?: string;
  fulfillment?: 'orive' | 'external' | 'unlisted';
}

// All experiences mapped by unique IDs
export const experiencesData: Record<string, Experience> = {
  // Facilitator 1 - Emma van der Berg (Leadership)
  'exp-1-1': {
    id: 'exp-1-1',
    title: 'Mindful Leadership Workshop',
    facilitatorId: '1',
    facilitatorName: 'Emma van der Berg',
    facilitatorAvatar: facilitator1,
    rating: 4.9,
    reviewCount: 56,
    location: 'Amsterdam, Netherlands',
    price: 75,
    image: leadershipWorkshop,
    category: 'Leadership',
    duration: '3 hours',
    groupSize: '8-15 participants',
    language: 'English, Dutch',
    description: 'Transform your leadership approach through mindfulness practices. This workshop combines ancient wisdom with modern leadership techniques to help you lead with clarity, presence, and authenticity.',
    tags: ['Mindfulness', 'Leadership', 'Authenticity'],
    whatToExpect: [
      'Introduction to mindful leadership principles',
      'Practical meditation and breathing exercises',
      'Group discussions on leadership challenges',
      'Personalized action planning',
      'Connection with like-minded leaders',
    ],
    whatToBring: [
      'Comfortable clothing',
      'Notebook and pen',
      'Open mind and willingness to share',
      'Water bottle',
    ],
    dates: [
      { date: 'Sat, Jan 15, 2025', time: '10:00 - 13:00', spots: 5 },
      { date: 'Sat, Jan 29, 2025', time: '10:00 - 13:00', spots: 8 },
      { date: 'Sat, Feb 12, 2025', time: '10:00 - 13:00', spots: 12 },
    ],
    reviews: [
      {
        author: 'Sarah M.',
        rating: 5,
        date: 'Dec 2024',
        text: 'Life-changing experience! Picard creates a safe space for vulnerability and growth. The mindfulness techniques have transformed how I lead my team.',
      },
      {
        author: 'Michael K.',
        rating: 5,
        date: 'Nov 2024',
        text: 'Highly recommend! The perfect blend of theory and practice. Left with actionable insights I could implement immediately.',
      },
    ],
  },
  'exp-1-2': {
    id: 'exp-1-2',
    title: 'Women in Leadership Circle',
    facilitatorId: '1',
    facilitatorName: 'Emma van der Berg',
    facilitatorAvatar: facilitator1,
    rating: 5.0,
    reviewCount: 43,
    location: 'Amsterdam, Netherlands',
    price: 45,
    image: womenLeadership,
    category: 'Leadership',
    duration: '2 hours',
    groupSize: '6-12 participants',
    language: 'English',
    description: 'A sacred circle for women in leadership to connect, share, and support each other. Explore the unique challenges and opportunities of feminine leadership in today\'s world.',
    tags: ['Feminine Leadership', 'Community', 'Empowerment'],
    whatToExpect: [
      'Opening circle and intention setting',
      'Facilitated discussion on women\'s leadership',
      'Peer coaching and support',
      'Empowerment exercises',
      'Closing ritual and integration',
    ],
    whatToBring: [
      'Comfortable clothing',
      'Journal (optional)',
      'Open heart',
    ],
    dates: [
      { date: 'Thu, Jan 18, 2025', time: '19:00 - 21:00', spots: 3 },
      { date: 'Thu, Feb 1, 2025', time: '19:00 - 21:00', spots: 6 },
      { date: 'Thu, Feb 15, 2025', time: '19:00 - 21:00', spots: 8 },
    ],
    reviews: [
      {
        author: 'Emma L.',
        rating: 5,
        date: 'Jan 2025',
        text: 'The most powerful circle I\'ve attended. Meeting other women leaders and sharing our stories was incredibly healing and inspiring.',
      },
    ],
  },
  'exp-1-3': {
    id: 'exp-1-3',
    title: 'Career Transition Retreat',
    facilitatorId: '1',
    facilitatorName: 'Emma van der Berg',
    facilitatorAvatar: facilitator1,
    rating: 4.8,
    reviewCount: 28,
    location: 'Amsterdam, Netherlands',
    price: 450,
    image: careerRetreat,
    category: 'Leadership',
    duration: '2 days',
    groupSize: '8-12 participants',
    language: 'English',
    description: 'Navigate your career transition with clarity and confidence in this transformative weekend retreat.',
    tags: ['Career', 'Transition', 'Strategy'],
    whatToExpect: [
      'Career vision and values clarification',
      'Strategic planning sessions',
      'Networking with fellow professionals',
      'Mindfulness practices for decision-making',
    ],
    whatToBring: [
      'Comfortable clothing',
      'Laptop or tablet',
      'Career documents',
    ],
    dates: [
      { date: 'Sat-Sun, Feb 3-4, 2025', time: '09:00 - 17:00', spots: 6 },
    ],
    reviews: [],
  },

  // Facilitator 3 - Marcus Steele (Breathwork)
  'exp-3-2': {
    id: 'exp-3-2',
    title: 'Wim Hof Breathing Workshop',
    facilitatorId: '3',
    facilitatorName: 'Mei Chen',
    facilitatorAvatar: facilitator3,
    rating: 4.9,
    reviewCount: 89,
    location: 'Utrecht, Netherlands',
    price: 55,
    image: wimHofWorkshop,
    category: 'Breathwork',
    duration: '2.5 hours',
    groupSize: '10-20 participants',
    language: 'English, Dutch',
    description: 'Master the power of your breath with the Wim Hof Method. This intensive workshop teaches you breathing techniques that boost energy, reduce stress, and strengthen your immune system.',
    tags: ['Wim Hof', 'Energy', 'Immunity'],
    whatToExpect: [
      'Introduction to Wim Hof Method',
      'Guided breathing rounds',
      'Cold exposure theory (ice bath demonstration)',
      'Group breathing session',
      'Q&A and personal guidance',
    ],
    whatToBring: [
      'Comfortable, loose clothing',
      'Yoga mat or blanket',
      'Water bottle',
      'Empty stomach (light breakfast only)',
    ],
    dates: [
      { date: 'Sun, Jan 21, 2025', time: '09:00 - 11:30', spots: 7 },
      { date: 'Sun, Feb 4, 2025', time: '09:00 - 11:30', spots: 12 },
      { date: 'Sun, Feb 18, 2025', time: '09:00 - 11:30', spots: 15 },
    ],
    reviews: [
      {
        author: 'Tom R.',
        rating: 5,
        date: 'Dec 2024',
        text: 'Marcus is an incredible facilitator! The breathing techniques are powerful and the workshop structure is perfect for beginners.',
      },
      {
        author: 'Lisa V.',
        rating: 5,
        date: 'Nov 2024',
        text: 'Mind-blowing experience! I felt energized and clear-headed for days after. Can\'t wait to attend again.',
      },
    ],
  },

  // Facilitator 4 - Luna Martinez (Sound Healing)
  'exp-4-1': {
    id: 'exp-4-1',
    title: 'Sound Bath Meditation',
    facilitatorId: '4',
    facilitatorName: 'David Morrison',
    facilitatorAvatar: facilitator4,
    rating: 5.0,
    reviewCount: 72,
    location: 'Lisbon, Portugal',
    price: 35,
    image: soundBath,
    category: 'Sound Healing',
    duration: '90 minutes',
    groupSize: '8-20 participants',
    language: 'English',
    description: 'Immerse yourself in healing sound vibrations. Experience deep relaxation and meditation through crystal singing bowls, gongs, and other sacred instruments.',
    tags: ['Sound Bath', 'Relaxation', 'Gong'],
    whatToExpect: [
      'Gentle yoga or stretching warm-up',
      'Guided relaxation and meditation',
      '60-minute sound bath immersion',
      'Integration time',
      'Tea and sharing circle',
    ],
    whatToBring: [
      'Yoga mat',
      'Blanket and pillow',
      'Eye mask (optional)',
      'Comfortable clothing',
    ],
    dates: [
      { date: 'Fri, Jan 19, 2025', time: '19:30 - 21:00', spots: 4 },
      { date: 'Fri, Feb 2, 2025', time: '19:30 - 21:00', spots: 9 },
      { date: 'Fri, Feb 16, 2025', time: '19:30 - 21:00', spots: 14 },
    ],
    reviews: [
      {
        author: 'Nina S.',
        rating: 5,
        date: 'Jan 2025',
        text: 'The most relaxing experience of my life. Luna\'s sound healing is pure magic. I slept better than I have in years.',
      },
    ],
  },

  // Facilitator 5 - Kai Rivers (Movement)
  'exp-5-1': {
    id: 'exp-5-1',
    title: 'Ecstatic Dance Journey',
    facilitatorId: '5',
    facilitatorName: 'Sophie Laurent',
    facilitatorAvatar: facilitator5,
    rating: 4.8,
    reviewCount: 94,
    location: 'Paris, France',
    price: 20,
    image: ecstaticDance,
    category: 'Movement',
    duration: '2 hours',
    groupSize: '15-40 participants',
    language: 'Non-verbal (instructions in English)',
    description: 'Free your body and spirit through conscious dance. No steps, no judgment, just pure authentic movement to carefully curated music in a safe, supportive space.',
    tags: ['Dance', 'Authenticity', 'Expression'],
    whatToExpect: [
      'Opening circle and group grounding',
      'Guided warm-up movement',
      '90 minutes of free-form ecstatic dance',
      'Cool-down and stretching',
      'Closing integration circle',
    ],
    whatToBring: [
      'Comfortable, breathable clothing',
      'Water bottle',
      'Barefoot or dance shoes',
      'Towel',
      'Open heart',
    ],
    dates: [
      { date: 'Wed, Jan 17, 2025', time: '20:00 - 22:00', spots: 12 },
      { date: 'Wed, Jan 31, 2025', time: '20:00 - 22:00', spots: 18 },
      { date: 'Wed, Feb 14, 2025', time: '20:00 - 22:00', spots: 25 },
    ],
    reviews: [
      {
        author: 'Sophie D.',
        rating: 5,
        date: 'Dec 2024',
        text: 'Pure joy! Kai creates such a welcoming environment. I felt completely free to express myself. Left feeling energized and connected.',
      },
      {
        author: 'David P.',
        rating: 4,
        date: 'Nov 2024',
        text: 'Amazing experience! Great music selection and wonderful community. A bit crowded but still enjoyed every minute.',
      },
    ],
  },

  // Facilitator 6 - Thomas Schneider (BodyWork)
  'exp-6-1': {
    id: 'exp-6-1',
    title: 'Myofascial Release Workshop',
    facilitatorId: '6',
    facilitatorName: 'Thomas Schneider',
    facilitatorAvatar: facilitator6,
    rating: 4.9,
    reviewCount: 67,
    location: 'Vienna, Austria',
    price: 95,
    image: bodyworkIntensive,
    category: 'BodyWork',
    duration: '4 hours',
    groupSize: '6-12 participants',
    language: 'English, German',
    description: 'Learn powerful self-massage techniques to release tension, improve mobility, and reduce chronic pain. This hands-on workshop teaches you how to work with your fascia system.',
    tags: ['Myofascial', 'Mobility', 'Pain Relief'],
    whatToExpect: [
      'Introduction to fascia and myofascial release',
      'Self-massage techniques for major muscle groups',
      'Partner-assisted release work',
      'Pain management strategies',
      'Take-home practice routine',
    ],
    whatToBring: [
      'Comfortable athletic clothing',
      'Yoga mat',
      'Massage ball (provided if needed)',
      'Water bottle',
    ],
    dates: [
      { date: 'Sat, Jan 20, 2025', time: '14:00 - 18:00', spots: 3 },
      { date: 'Sat, Feb 3, 2025', time: '14:00 - 18:00', spots: 7 },
      { date: 'Sat, Feb 17, 2025', time: '14:00 - 18:00', spots: 10 },
    ],
    reviews: [
      {
        author: 'Martin K.',
        rating: 5,
        date: 'Dec 2024',
        text: 'Incredible relief from chronic back pain. Thomas is a master at what he does. Highly recommend!',
      },
    ],
  },

  // Facilitator 7 - Isabella Romano (Holistic Health)
  'exp-7-1': {
    id: 'exp-7-1',
    title: 'Plant Medicine Integration Circle',
    facilitatorId: '7',
    facilitatorName: 'Isabella Romano',
    facilitatorAvatar: facilitator7,
    rating: 5.0,
    reviewCount: 89,
    location: 'Rome, Italy',
    price: 45,
    image: herbalWorkshop,
    category: 'Wellness',
    duration: '2.5 hours',
    groupSize: '8-16 participants',
    language: 'English, Italian',
    description: 'A supportive space to integrate insights from plant medicine journeys. Share experiences, process emotions, and ground wisdom into daily life.',
    tags: ['Plant Medicine', 'Integration', 'Support'],
    whatToExpect: [
      'Opening circle and intention setting',
      'Guided integration practices',
      'Sharing and witnessing',
      'Journaling and reflection time',
      'Practical integration techniques',
    ],
    whatToBring: [
      'Journal and pen',
      'Comfortable clothing',
      'Open heart',
      'Water',
    ],
    dates: [
      { date: 'Sun, Jan 21, 2025', time: '16:00 - 18:30', spots: 6 },
      { date: 'Sun, Feb 4, 2025', time: '16:00 - 18:30', spots: 11 },
      { date: 'Sun, Feb 18, 2025', time: '16:00 - 18:30', spots: 14 },
    ],
    reviews: [
      {
        author: 'Elena R.',
        rating: 5,
        date: 'Jan 2025',
        text: 'Isabella holds such beautiful space. This circle helped me make sense of my ayahuasca journey. Deeply grateful.',
      },
    ],
  },

  // Facilitator 8 - Lucas Mendes (Mindfulness)
  'exp-8-1': {
    id: 'exp-8-1',
    title: 'Nervous System Regulation Workshop',
    facilitatorId: '8',
    facilitatorName: 'Lucas Mendes',
    facilitatorAvatar: facilitator8,
    rating: 4.8,
    reviewCount: 54,
    location: 'Barcelona, Spain',
    price: 65,
    image: nervousSystem,
    category: 'Wellness',
    duration: '3 hours',
    groupSize: '10-20 participants',
    language: 'English, Spanish, Portuguese',
    description: 'Learn to regulate your nervous system and move from stress to calm. Practical tools for managing anxiety, improving sleep, and building resilience.',
    tags: ['Polyvagal', 'Calm', 'Resilience'],
    whatToExpect: [
      'Understanding your nervous system',
      'Polyvagal theory basics',
      'Breathwork and somatic practices',
      'Co-regulation exercises',
      'Daily regulation toolkit',
    ],
    whatToBring: [
      'Comfortable clothing',
      'Notebook',
      'Yoga mat or cushion',
      'Water bottle',
    ],
    dates: [
      { date: 'Sat, Jan 27, 2025', time: '10:00 - 13:00', spots: 8 },
      { date: 'Sat, Feb 10, 2025', time: '10:00 - 13:00', spots: 15 },
      { date: 'Sat, Feb 24, 2025', time: '10:00 - 13:00', spots: 18 },
    ],
    reviews: [
      {
        author: 'Carlos M.',
        rating: 5,
        date: 'Dec 2024',
        text: 'Life-changing information presented in an accessible way. Lucas is brilliant and compassionate.',
      },
    ],
  },

  // Facilitator 9 - Gabriella Rossi (Ceremony)
  'exp-9-1': {
    id: 'exp-9-1',
    title: 'Sacred Cacao Ceremony',
    facilitatorId: '9',
    facilitatorName: 'Gabriella Rossi',
    facilitatorAvatar: facilitator9,
    rating: 5.0,
    reviewCount: 143,
    location: 'Florence, Italy',
    price: 55,
    image: cacaoCeremony,
    category: 'Ceremony',
    duration: '3 hours',
    groupSize: '12-25 participants',
    language: 'English, Italian',
    description: 'Open your heart with ceremonial cacao in a sacred space. Connect deeply with yourself and the community through meditation, sound, and intentional sharing.',
    tags: ['Cacao', 'Heart Opening', 'Ceremony'],
    whatToExpect: [
      'Sacred space opening and blessing',
      'Ceremonial grade cacao preparation',
      'Guided heart-opening meditation',
      'Sound journey with live music',
      'Sharing circle and integration',
    ],
    whatToBring: [
      'Comfortable white clothing (optional)',
      'Journal',
      'Cushion or meditation seat',
      'Open heart and intention',
    ],
    dates: [
      { date: 'Fri, Jan 19, 2025', time: '18:00 - 21:00', spots: 5 },
      { date: 'Fri, Feb 2, 2025', time: '18:00 - 21:00', spots: 12 },
      { date: 'Fri, Feb 16, 2025', time: '18:00 - 21:00', spots: 20 },
    ],
    reviews: [
      {
        author: 'Maria G.',
        rating: 5,
        date: 'Jan 2025',
        text: 'Pure magic. Gabriella creates the most beautiful ceremonial space. The cacao opened my heart in ways I didn\'t expect.',
      },
    ],
  },

  'exp-9-2': {
    id: 'exp-9-2',
    title: 'Fire Ceremony & Release Ritual',
    facilitatorId: '9',
    facilitatorName: 'Gabriella Rossi',
    facilitatorAvatar: facilitator9,
    rating: 5.0,
    reviewCount: 98,
    location: 'Florence, Italy',
    price: 40,
    image: fireCeremony,
    category: 'Ceremony',
    duration: '2 hours',
    groupSize: '8-20 participants',
    language: 'English, Italian',
    description: 'Release what no longer serves you in a powerful fire ceremony. Connect with the transformative element of fire and the supportive energy of community.',
    tags: ['Fire Ceremony', 'Release', 'Ritual'],
    whatToExpect: [
      'Circle opening and grounding',
      'Intention setting and writing practice',
      'Sacred fire lighting ceremony',
      'Individual release ritual',
      'Closing integration circle',
    ],
    whatToBring: [
      'Something to burn (letter, photo, symbolic object)',
      'Warm clothing for outdoor ceremony',
      'Journal and pen',
      'Water bottle',
    ],
    dates: [
      { date: 'Sat, Jan 13, 2025', time: '19:00 - 21:00', spots: 7 },
      { date: 'Sat, Jan 27, 2025', time: '19:00 - 21:00', spots: 15 },
      { date: 'Sat, Feb 10, 2025', time: '19:00 - 21:00', spots: 18 },
    ],
    reviews: [
      {
        author: 'Alessandro B.',
        rating: 5,
        date: 'Dec 2024',
        text: 'Profound experience. The fire ceremony helped me let go of years of pain. Gabriella is an incredible guide.',
      },
    ],
  },

  // Facilitator 10 - Alex Rivera (Life Coaching)
  'exp-10-1': {
    id: 'exp-10-1',
    title: 'Success Mindset Seminar',
    facilitatorId: '10',
    facilitatorName: 'Alex Rivera',
    facilitatorAvatar: facilitator10,
    rating: 4.9,
    reviewCount: 112,
    location: 'Madrid, Spain',
    price: 85,
    image: successSeminar,
    category: 'Leadership',
    duration: '4 hours',
    groupSize: '15-30 participants',
    language: 'English, Spanish',
    description: 'Transform your mindset and unlock your potential. Learn proven strategies for goal achievement, overcoming limiting beliefs, and creating lasting success.',
    tags: ['Mindset', 'Success', 'Goals'],
    whatToExpect: [
      'Success psychology fundamentals',
      'Goal-setting framework',
      'Limiting belief breakthrough exercises',
      'Action planning workshop',
      'Accountability partnership setup',
    ],
    whatToBring: [
      'Notebook and pen',
      'Your biggest goals and dreams',
      'Open mind',
      'Water bottle',
    ],
    dates: [
      { date: 'Sun, Jan 14, 2025', time: '13:00 - 17:00', spots: 10 },
      { date: 'Sun, Jan 28, 2025', time: '13:00 - 17:00', spots: 22 },
      { date: 'Sun, Feb 11, 2025', time: '13:00 - 17:00', spots: 28 },
    ],
    reviews: [
      {
        author: 'Pedro S.',
        rating: 5,
        date: 'Jan 2025',
        text: 'Alex is motivating and practical. I left with concrete steps and renewed confidence. Already seeing results!',
      },
    ],
  },

  // Facilitator 12 - Henrik Larsson (Movement Therapy)
  'exp-12-1': {
    id: 'exp-12-1',
    title: 'Authentic Movement Expression',
    facilitatorId: '12',
    facilitatorName: 'Henrik Larsson',
    facilitatorAvatar: facilitator12,
    rating: 4.7,
    reviewCount: 71,
    location: 'Stockholm, Sweden',
    price: 50,
    image: movementExpression,
    category: 'Movement',
    duration: '2.5 hours',
    groupSize: '10-18 participants',
    language: 'English, Swedish',
    description: 'Discover your authentic movement and expression. A gentle exploration of somatic awareness, spontaneous movement, and creative expression.',
    tags: ['Authentic Movement', 'Somatic', 'Expression'],
    whatToExpect: [
      'Body awareness warm-up',
      'Guided movement exploration',
      'Solo authentic movement practice',
      'Partner mirroring exercises',
      'Integration and sharing',
    ],
    whatToBring: [
      'Comfortable, loose clothing',
      'Bare feet or soft shoes',
      'Water bottle',
      'Curiosity and playfulness',
    ],
    dates: [
      { date: 'Thu, Jan 18, 2025', time: '18:30 - 21:00', spots: 6 },
      { date: 'Thu, Feb 1, 2025', time: '18:30 - 21:00', spots: 12 },
      { date: 'Thu, Feb 15, 2025', time: '18:30 - 21:00', spots: 16 },
    ],
    reviews: [
      {
        author: 'Anna L.',
        rating: 5,
        date: 'Dec 2024',
        text: 'So freeing! Henrik creates a safe space to explore movement without judgment. Left feeling alive and embodied.',
      },
    ],
  },

  // Facilitator 13 - Olivia Walsh (Energy Work)
  'exp-13-1': {
    id: 'exp-13-1',
    title: 'Reiki Healing Circle',
    facilitatorId: '13',
    facilitatorName: 'Olivia Walsh',
    facilitatorAvatar: facilitator13,
    rating: 4.9,
    reviewCount: 86,
    location: 'Dublin, Ireland',
    price: 35,
    image: reikiCircle,
    category: 'Energy Work',
    duration: '2 hours',
    groupSize: '8-12 participants',
    language: 'English',
    description: 'Experience the healing power of Reiki in a supportive group setting. Receive energy healing while surrounded by the collective healing energy of the circle.',
    tags: ['Reiki', 'Healing Circle', 'Energy'],
    whatToExpect: [
      'Introduction to Reiki energy',
      'Group energy clearing and grounding',
      'Individual Reiki healing sessions',
      'Guided meditation',
      'Integration time and tea',
    ],
    whatToBring: [
      'Yoga mat or cushion',
      'Blanket',
      'Eye mask (optional)',
      'Water bottle',
    ],
    dates: [
      { date: 'Tue, Jan 16, 2025', time: '19:00 - 21:00', spots: 4 },
      { date: 'Tue, Jan 30, 2025', time: '19:00 - 21:00', spots: 8 },
      { date: 'Tue, Feb 13, 2025', time: '19:00 - 21:00', spots: 11 },
    ],
    reviews: [
      {
        author: 'Claire O.',
        rating: 5,
        date: 'Jan 2025',
        text: 'Olivia\'s Reiki is so powerful. I felt deeply relaxed and experienced profound healing. Beautiful energy!',
      },
    ],
  },

  // Facilitator 14 - Sebastian Mueller (Somatic Therapy)
  'exp-14-1': {
    id: 'exp-14-1',
    title: 'Trauma Release & Shadow Work',
    facilitatorId: '14',
    facilitatorName: 'Sebastian Mueller',
    facilitatorAvatar: facilitator14,
    rating: 4.8,
    reviewCount: 79,
    location: 'Zurich, Switzerland',
    price: 120,
    image: shadowWork,
    category: 'Healing',
    duration: '5 hours',
    groupSize: '6-10 participants',
    language: 'English, German',
    description: 'A deep dive into shadow work and somatic trauma release. Work with repressed emotions and stored trauma in a safe, professionally guided container.',
    tags: ['Shadow Work', 'Trauma', 'Deep Dive'],
    whatToExpect: [
      'Introduction to shadow work concepts',
      'Somatic experiencing techniques',
      'Guided shadow exploration',
      'Trauma release exercises',
      'Integration and resources',
    ],
    whatToBring: [
      'Journal and pen',
      'Comfortable clothing',
      'Blanket',
      'Water and snacks',
      'Courage and self-compassion',
    ],
    dates: [
      { date: 'Sat, Jan 20, 2025', time: '10:00 - 15:00', spots: 2 },
      { date: 'Sat, Feb 3, 2025', time: '10:00 - 15:00', spots: 5 },
      { date: 'Sat, Feb 17, 2025', time: '10:00 - 15:00', spots: 8 },
    ],
    reviews: [
      {
        author: 'Michael R.',
        rating: 5,
        date: 'Dec 2024',
        text: 'Intense but transformative. Sebastian is incredibly skilled and compassionate. This work changed my life.',
      },
    ],
  },

  'exp-14-2': {
    id: 'exp-14-2',
    title: 'Healing Trauma Retreat',
    facilitatorId: '14',
    facilitatorName: 'Sebastian Mueller',
    facilitatorAvatar: facilitator14,
    rating: 5.0,
    reviewCount: 45,
    location: 'Zurich, Switzerland',
    price: 450,
    image: traumaRetreat,
    category: 'Healing',
    duration: '3 days',
    groupSize: '8-12 participants',
    language: 'English, German',
    description: 'A comprehensive 3-day retreat for deep trauma healing and nervous system restoration. Work with complex trauma in a residential setting with 24/7 support.',
    tags: ['Trauma Retreat', 'Healing', 'Intensive'],
    whatToExpect: [
      'Daily somatic therapy sessions',
      'Breathwork and bodywork practices',
      'Group processing and support',
      'Nature immersion and grounding',
      'Integration planning',
    ],
    whatToBring: [
      'Personal items for 3-day stay',
      'Journal',
      'Comfortable clothing',
      'Any medications',
      'Commitment to healing',
    ],
    dates: [
      { date: 'Fri-Sun, Feb 9-11, 2025', time: 'Fri 14:00 - Sun 16:00', spots: 3 },
      { date: 'Fri-Sun, Mar 7-9, 2025', time: 'Fri 14:00 - Sun 16:00', spots: 7 },
    ],
    reviews: [
      {
        author: 'Sarah K.',
        rating: 5,
        date: 'Jan 2025',
        text: 'The most profound healing experience of my life. Sebastian and his team created such a safe container. Forever grateful.',
      },
    ],
  },

  // Facilitator 15 - Victoria Chen (Transformation & Leadership)
  'exp-15-1': {
    id: 'exp-15-1',
    title: 'Conscious Leadership Intensive',
    facilitatorId: '15',
    facilitatorName: 'Victoria Chen',
    facilitatorAvatar: facilitator15,
    rating: 5.0,
    reviewCount: 134,
    location: 'Brussels, Belgium',
    price: 180,
    image: consciousLeadership,
    category: 'Leadership',
    duration: '6 hours',
    groupSize: '8-15 participants',
    language: 'English, French, Mandarin',
    description: 'An intensive for leaders ready to elevate their impact. Integrate personal development with professional leadership skills for authentic, conscious leadership.',
    tags: ['Conscious Leadership', 'Intensive', 'Impact'],
    whatToExpect: [
      'Conscious leadership framework',
      'Shadow work for leaders',
      'Communication mastery exercises',
      'Vision and strategy alignment',
      'Peer coaching and accountability',
    ],
    whatToBring: [
      'Laptop or tablet',
      'Journal and pen',
      'Current leadership challenges',
      'Lunch (provided)',
    ],
    dates: [
      { date: 'Sat, Jan 27, 2025', time: '09:00 - 15:00', spots: 4 },
      { date: 'Sat, Feb 10, 2025', time: '09:00 - 15:00', spots: 9 },
      { date: 'Sat, Feb 24, 2025', time: '09:00 - 15:00', spots: 13 },
    ],
    reviews: [
      {
        author: 'James L.',
        rating: 5,
        date: 'Jan 2025',
        text: 'Victoria is a phenomenal facilitator. This intensive gave me tools I use every day. My team has noticed the difference.',
      },
    ],
  },

  // Facilitator 5 - Sophie Laurent (Yoga) - Additional experience
  'exp-5-2': {
    id: 'exp-5-2',
    title: 'Yin Yoga & Meditation',
    facilitatorId: '5',
    facilitatorName: 'Sophie Laurent',
    facilitatorAvatar: facilitator5,
    rating: 4.8,
    reviewCount: 102,
    location: 'Paris, France',
    price: 30,
    image: yinYoga,
    category: 'Yoga',
    duration: '90 minutes',
    groupSize: '12-20 participants',
    language: 'English, French',
    description: 'Slow down and restore with Yin Yoga. Hold passive poses to release deep tension, followed by guided meditation for complete relaxation.',
    tags: ['Yin Yoga', 'Restorative', 'Meditation'],
    whatToExpect: [
      'Gentle Yin yoga sequence',
      'Long-held passive stretches',
      'Fascia and meridian work',
      'Guided meditation',
      'Deep relaxation',
    ],
    whatToBring: [
      'Yoga mat',
      'Blocks and bolster (provided if needed)',
      'Comfortable clothing',
      'Water bottle',
    ],
    dates: [
      { date: 'Sun, Jan 14, 2025', time: '17:00 - 18:30', spots: 8 },
      { date: 'Sun, Jan 28, 2025', time: '17:00 - 18:30', spots: 14 },
      { date: 'Sun, Feb 11, 2025', time: '17:00 - 18:30', spots: 18 },
    ],
    reviews: [
      {
        author: 'Marie D.',
        rating: 5,
        date: 'Dec 2024',
        text: 'Perfect Sunday evening practice. Sophie\'s guidance is so soothing. I always leave feeling restored.',
      },
    ],
  },
};

// Helper function to get experiences by facilitator ID
export const getExperiencesByFacilitator = (facilitatorId: string): Experience[] => {
  return Object.values(experiencesData).filter(exp => exp.facilitatorId === facilitatorId);
};

import { getCrawledOfferingById, isAuthenticCrawledOffering } from './crawledOfferings';
import { getCatalogOfferingById } from './catalogOfferings';
import { resolveFulfillment } from '@/lib/fulfillment';
import { formatOfferingLength, offeringSpan } from '@/lib/offeringSpan';
import { isListableOfferingImage } from '@/lib/imageUrl';
import { ensureOfferingDescription } from '@/lib/offeringDescription';

export const getExperienceById = (id: string): Experience | undefined => {
  const catalog = getCatalogOfferingById(id);
  const crawled = getCrawledOfferingById(id);
  const listing = catalog || crawled;
  if (listing && (catalog || isAuthenticCrawledOffering(listing) || isListableOfferingImage(listing.image_url))) {
    const priceDigits = String(listing.price ?? '').replace(/[^0-9]/g, '');
    const span = offeringSpan(listing);
    const hasValidDate = Boolean(span.start);
    const durationLabel = span.multiDay && span.days
      ? formatOfferingLength(span, false)
      : typeof listing.duration === 'number'
        ? `${listing.duration} min`
        : String(listing.duration || '');
    return {
      id: listing.id,
      title: listing.title,
      facilitatorId: listing.facilitator_id,
      facilitatorName: listing.facilitator_name || 'Facilitator',
      facilitatorAvatar: listing.facilitator_avatar || crawled?.facilitator_avatar || '',
      rating: listing.rating,
      reviewCount: listing.reviewCount,
      price: priceDigits ? parseInt(priceDigits, 10) : 0,
      duration: durationLabel,
      location: listing.location || '',
      category: listing.tags?.[0] || listing.source_platform || '',
      image: listing.image_url || '',
      type: listing.type,
      is_online: Boolean(listing.is_online),
      groupSize: listing.capacity ? `Up to ${listing.capacity} people` : '',
      tags: listing.tags || [],
      description: ensureOfferingDescription({
        title: listing.title,
        description: listing.description || crawled?.description || '',
        tags: listing.tags || [],
        category: listing.tags?.[0] || listing.source_platform || '',
        location: listing.location || '',
        facilitatorName: listing.facilitator_name || 'Facilitator',
        type: listing.type,
      }),
      whatToExpect: [],
      whatToBring: [],
      dates: hasValidDate && span.start
        ? [{
            date: span.start.toISOString(),
            time: span.end && span.multiDay ? span.end.toISOString() : '',
          }]
        : [],
      reviews: [],
      source_platform: listing.source_platform,
      source_url: listing.source_url,
      fulfillment: resolveFulfillment(listing),
    };
  }
  return undefined;
};
