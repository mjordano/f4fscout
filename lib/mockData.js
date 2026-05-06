/**
 * Realistic mock data generator for demo mode.
 * Produces believable Instagram profiles with varied characteristics.
 */

const NICHES = [
  'cats', 'kittens', 'meow', 'catlovers', 'catlady', 'catsofinstagram',
  'photography', 'travel', 'fitness', 'food', 'art', 'fashion',
  'lifestyle', 'nature', 'dogs', 'petlovers', 'animals', 'wildlife',
];

const BIOS_CATS = [
  '🐱 Cat mom of 3 | Sharing daily paw-some moments',
  '😸 Professional cat whisperer | #CatsOfInstagram',
  '🐾 My cats run my life and I love it | DM for collabs',
  '😻 Rescuing one kitty at a time 🐱 | Foster fail x4',
  '🐈 Cat photography | Fluffy moments every day',
  '🐈‍⬛ Black cat appreciation society | RTs ≠ endorsements',
  '😺 Cat lover, coffee addict, introvert | She/Her',
  '🐱 Documenting my fur babies | Maine Coon enthusiast',
  '🐾 Persian cat breeder & lover | 10+ years experience',
  '😸 Spreading cat joy since 2018 | @mainecoonclub admin',
  '🐈 Cat cafe owner | Come visit us in [city]',
  '💕 Crazy cat lady & proud | Follow for daily fluffs',
  '🐱 Cat nutritionist & advocate | Premium pet care tips',
  '😻 Amateur cat photographer | Capturing purr-fect moments',
  '🐾 5 cats 1 human | Chaos manager & paw servant',
];

const BIOS_GENERIC = [
  '📸 Content creator | Life is beautiful',
  '✨ Just living my best life | Follow for daily inspo',
  '🌍 Wanderlust photographer | DM for features',
  '💪 Fitness coach | Helping you reach your goals',
  '🎨 Digital artist | Commissions open',
  '🌸 Beauty & lifestyle | Collab inquiries: dm me',
  '📱 Tech reviewer | Gadgets & games',
  '🍕 Food blogger | Eating my way through life',
  '🏋️ Personal trainer | Custom programs available',
  '🎵 Music producer | Beats that hit different',
];

const FIRST_NAMES = ['Alex','Jordan','Taylor','Morgan','Riley','Casey','Avery','Quinn','Blake','Skylar','Emma','Noah','Liam','Olivia','Ava','Isabella','Lucas','Mason','Sophia','Mia','Sofia','Ella','Oliver','Ethan','Aiden','Luna','Zoe','Chloe','Charlotte','Layla'];
const LAST_NAMES  = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Robinson','Clark','Lewis'];
const SUFFIXES    = ['', '', '', '_', '.', '__', '123', '99', '_official', '.ig', '_real', '.photography'];
const CATEGORIES  = ['Personal', 'Creator', 'Business', 'Pet', 'Photographer', 'Influencer', ''];

function rand(arr)       { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(a, b)   { return Math.floor(Math.random() * (b - a + 1)) + a; }
function randFloat(a, b) { return +(Math.random() * (b - a) + a).toFixed(3); }
function seededRand(seed, arr) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return arr[Math.abs(h) % arr.length];
}

/**
 * Generate a single mock profile, optionally seeded by username.
 */
export function generateMockProfile(username = '') {
  const seed    = username || Math.random().toString(36).slice(2);
  const isNiche = Math.random() < 0.55;

  // Varied follower/following distributions
  const archetype = randInt(0, 5);
  let followers, following;

  switch (archetype) {
    case 0: // micro influencer — good ratio target
      followers = randInt(800,  8000);
      following = randInt(1000, 15000);
      break;
    case 1: // heavy follower — great f4f target (follows much more than followers)
      followers = randInt(200,  2000);
      following = randInt(2000, 20000);
      break;
    case 2: // balanced — moderate target
      followers = randInt(500,  5000);
      following = randInt(400,  5500);
      break;
    case 3: // established — bad target
      followers = randInt(10000, 500000);
      following = randInt(500,   3000);
      break;
    case 4: // celebrity — very bad target
      followers = randInt(500000, 10000000);
      following = randInt(100,    1000);
      break;
    default: // new user
      followers = randInt(10,  600);
      following = randInt(50, 1200);
  }

  const firstName = rand(FIRST_NAMES);
  const lastName  = rand(LAST_NAMES);
  const suffix    = rand(SUFFIXES);
  const genUsername = username || `${firstName.toLowerCase()}${lastName.toLowerCase()}${suffix}`;

  const postCount   = randInt(5, 2200);
  const isVerified  = Math.random() < 0.04;
  const isPrivate   = Math.random() < 0.25;
  const isBusiness  = Math.random() < 0.2;
  const bio         = isNiche ? rand(BIOS_CATS) : rand(BIOS_GENERIC);
  const category    = rand(CATEGORIES);

  const daysAgo     = randInt(0, 120);
  const lastPostDate = new Date(Date.now() - daysAgo * 86400000).toISOString();

  const avatarColors = ['833AB4', 'FD1D1D', 'F77737', '6366f1', '22c55e', 'ec4899', 'f59e0b'];
  const profilePicUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=${rand(avatarColors)}&color=fff&size=150&bold=true`;

  return {
    id:            `mock_${genUsername}`,
    username:      genUsername,
    displayName:   `${firstName} ${lastName}`,
    bio,
    profilePicUrl,
    followers,
    following,
    postCount,
    isVerified,
    isPrivate,
    isBusiness,
    category,
    externalUrl:   '',
    lastPostDate,
    profileUrl:    `https://instagram.com/${genUsername}`,
    isMock:        true,
    nicheRelevance: isNiche ? randFloat(0.5, 1.0) : randFloat(0.0, 0.4),
    engagementRate: randFloat(0.5, 12.0),
    avgLikesPerPost: Math.floor(followers * randFloat(0.01, 0.08)),
    avgCommentsPerPost: Math.floor(followers * randFloat(0.001, 0.01)),
  };
}

/**
 * Generate count mock profiles, varied by context.
 */
export function generateMockProfiles(count = 60, context = '', type = 'followers') {
  const profiles = [];
  const seen = new Set();

  for (let i = 0; i < count; i++) {
    const p = generateMockProfile();
    // Make 30-60% niche-relevant when context is given
    if (context && Math.random() < 0.45) {
      const nicheKeywords = ['cat', 'kitten', 'meow', 'feline', 'paw', 'fluff', 'persian', 'tabby'];
      if (Math.random() < 0.5) {
        p.bio = rand(BIOS_CATS);
        p.nicheRelevance = randFloat(0.55, 1.0);
        // Inject niche keyword into username sometimes
        if (Math.random() < 0.35) {
          const kw = rand(nicheKeywords);
          p.username = `${kw}${p.username.slice(0, 8)}`;
        }
      }
    }
    if (!seen.has(p.username)) {
      seen.add(p.username);
      p.profileUrl = `https://instagram.com/${p.username}`;
      profiles.push(p);
    }
  }
  return profiles;
}

/**
 * Generate mock niche top profiles.
 */
export function generateNicheProfiles(niche, count = 80) {
  const NICHE_MAP = {
    cats:        { bios: BIOS_CATS,    keywords: ['cat','kitten','feline','meow','paw'] },
    photography: { bios: BIOS_GENERIC, keywords: ['photo','lens','shot','camera','capture'] },
    fitness:     { bios: BIOS_GENERIC, keywords: ['fit','gym','workout','health','gains'] },
    food:        { bios: BIOS_GENERIC, keywords: ['food','eat','chef','recipe','cook'] },
    travel:      { bios: BIOS_GENERIC, keywords: ['travel','wander','explore','adventure','journey'] },
  };
  const nicheData = NICHE_MAP[niche.toLowerCase()] || NICHE_MAP.cats;

  return Array.from({ length: count }, (_, i) => {
    const p = generateMockProfile();
    p.bio = rand(nicheData.bios);
    p.nicheRelevance = randFloat(0.4, 1.0);
    if (Math.random() < 0.4) {
      const kw = rand(nicheData.keywords);
      p.username = `${kw}${p.username.slice(0, 8)}`;
      p.profileUrl = `https://instagram.com/${p.username}`;
    }
    return p;
  });
}
