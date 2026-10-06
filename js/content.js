// Editable content: starter cards and brands, caption and pitch templates, carousel ideas, offline caption lines.

// Example captions shown on first load so the grid isn't empty — real entries replace these naturally as you add your own.
const SEED_CLIPS = [
  {
    desc: "my cat has main character energy and i'm just the guy who buys the food",
    status: 'posted',
    selectedTones: ['Funny'],
    platform: 'Both',
    scheduledDate: '',
    captions: null
  },
  {
    desc: "there's no version of working from home where my cat isn't somehow involved in the meeting",
    status: 'posted',
    selectedTones: ['Relatable'],
    platform: 'Instagram',
    scheduledDate: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
    captions: null
  },
  {
    desc: "i've never had a relationship this codependent where only one of us is emotionally available",
    status: 'captioned',
    selectedTones: ['Meme-style'],
    platform: 'Both',
    scheduledDate: '',
    captions: {
      captions: [
        "i've never had a relationship this codependent where only one of us is emotionally available",
        'he needs me for food, warmth, and emotional labor. i need him for nothing. this is the dynamic.',
        "we're in this together. by which i mean i'm in it and he's supervising."
      ],
      hashtagsInstagram: '#catsofig #catsofinstagram #catlife',
      hashtagsTiktok: '#catsoftiktok #bengalsoftiktok #catlife'
    }
  },
  {
    desc: "some people have alarm clocks, i have a cat who's decided breakfast is non-negotiable",
    status: 'posted',
    selectedTones: ['Relatable'],
    platform: 'Both',
    scheduledDate: '',
    captions: null
  },
  {
    desc: 'upstairs judges downstairs for existing. downstairs has never once looked upstairs in the eye. this is the divide',
    status: 'idea',
    selectedTones: ['Multi-cat tie-in'],
    platform: 'Both',
    scheduledDate: '',
    captions: null
  },
  {
    desc: 'day 14 of my cat supervising every keystroke like he bills by the hour',
    status: 'filmed',
    selectedTones: ['Deadpan nature-doc'],
    platform: 'TikTok',
    scheduledDate: '',
    captions: null
  }
];

// Pulled from actual Amazon order history (Rufus purchase summary) — used to power
// the Quick-add panel with real product + order-date context instead of a blank brand.
const AMAZON_PURCHASE_HISTORY = [
  { brand: 'ARM & HAMMER', category: 'Litter', product: 'Clump & Seal Cloud Control Litter (6.35 kg)', orders: 'ordered Aug 2024' },
  { brand: 'Precious Cat', category: 'Litter', product: 'Cat Attract Training Litter (40 lb)', orders: 'ordered Dec 2024' },
  { brand: 'Boxie', category: 'Litter', product: 'Unscented Clumping Clay Cat Litter (16 lb)', orders: 'ordered 3x — Dec 2025, Jan 2026, Feb 2026' },
  { brand: 'ZuHucpts', category: 'Litter box / enclosures', product: 'Stainless Steel Litter Box (Large)', orders: 'ordered Aug 2024' },
  { brand: 'IKITCHEN', category: 'Litter', product: 'Stainless Steel Cat Litter Tray', orders: 'ordered Jul 2024' },
  { brand: 'Feandrea', category: 'Litter furniture', product: 'Double Cat Litter Box Enclosure/Furniture', orders: 'ordered Jan 2025' },
  { brand: 'HCY&WLD', category: 'Litter mats', product: 'Extra Large Cat Litter Mat (45"×26")', orders: 'ordered Sep 2024' },
  { brand: "Hill's Science Diet", category: 'Food', product: 'Dry Cat Food, Urinary & Hairball Control (15.5 lb)', orders: 'ordered 2x — Nov 2023, Jan 2024' },
  { brand: 'Purina Pro Plan', category: 'Food', product: 'Urinary Tract Health Cat Food (24-pack)', orders: 'ordered Mar 2024' },
  { brand: 'Feline Greenies', category: 'Dental treats', product: 'Dental Treats, Chicken & Salmon flavours', orders: '4 orders — May 2024, Jul 2024, Jul 2025, Mar 2024' },
  { brand: 'N-Bone', category: 'Treats', product: 'Get Naked Furball Relief + Urinary Health Treats', orders: 'ordered Jul 2024' },
  { brand: 'kin+Kind', category: 'Supplements', product: 'Organic Pumpkin Powder for cats & dogs', orders: 'ordered Jan 2025' },
  { brand: "Vet's Best", category: 'Supplements', product: 'Feline Urinary Tract Support Tablets (60ct)', orders: 'ordered Jan 2025' },
  { brand: 'Silverquine', category: 'Wound / itch care', product: 'Pet Wound & Itch Care Hydrogel', orders: 'ordered Feb 2024' },
  { brand: 'C.E.T.', category: 'Dental', product: 'Enzymatic Toothpaste for Dogs & Cats, Beef', orders: 'ordered Dec 2025' },
  { brand: 'beQ', category: 'Water fountains', product: 'Cat Water Fountain (2.5L)', orders: 'ordered Feb 2024' },
  { brand: 'DOOOB', category: 'Water fountains', product: 'Stainless Steel Cat Water Fountain (3.2L)', orders: 'ordered Mar 2024' },
  { brand: 'FEELNEEDY', category: 'Water fountains / toys', product: 'Stainless Steel Wireless Cat Water Fountain; Electric Interactive Cat Toys Set (9-pc, LED)', orders: 'ordered May 2026' },
  { brand: 'HoneyGuaridan', category: 'Feeders', product: 'Automatic Cat Feeder for Two Cats (3.5L)', orders: 'ordered May 2024' },
  { brand: 'NON-SQUARE', category: 'Toys', product: 'Silvervine Catnip Chew Sticks (20-pack)', orders: 'ordered Feb 2024' },
  { brand: 'PAWZ Road', category: 'Toys', product: 'Cat Tunnel Bed with Hanging Balls', orders: 'ordered Oct 2025' },
  { brand: 'WEOK', category: 'Toys', product: 'Puppy & Cat Heartbeat Stuffed Toy', orders: 'ordered Nov 2025' },
  { brand: 'Lukito', category: 'Grooming / enrichment', product: 'Licking Mat for Dogs & Cats (3-pack)', orders: 'ordered Jan 2025' },
  { brand: 'ACE2ACE', category: 'Grooming', product: 'Self-Cleaning Cat Grooming Slicker Brush', orders: 'ordered Mar 2024' },
  { brand: 'Petsters', category: 'Dental / grooming', product: 'Silicone 360° Pet Finger Toothbrush (3-pack)', orders: 'ordered Nov 2025' },
  { brand: 'VIVO', category: 'Carriers', product: 'Four Wheel Pet Stroller (Blue)', orders: 'ordered Apr 2024' },
  { brand: 'Jagahaha', category: 'Enclosures', product: 'Portable Outdoor Cat Enclosure (5-panel)', orders: 'ordered Aug 2024' },
  { brand: 'BFNN', category: 'Screen doors', product: 'Extra Tall Cat Screen Door (32"×80", Black)', orders: 'ordered Jul 2025' },
  { brand: 'FELIWAY', category: 'Calming / behavior', product: 'Optimum 30-Day Starter Kit', orders: 'ordered 2x — Nov 2023, Jan 2024' }
];

const SEED_STRATEGY_NOTE = {
  name: '★ Strategy reminders',
  category: 'Pinned',
  status: 'researching',
  contact: '',
  product: '',
  date: '',
  notes: 'Tag brands organically in regular posts BEFORE pitching — gives you something to reference in the outreach email. Use a weekly round-up slot for "what\'s actually in our lineup," it reads as authentic recs. Pitch = who you are + stats + why their product fits + the ask (affiliate code / ambassador program / product-for-content).'
};

const SEED_BRANDS = [
  { name: 'Amazon Associates', category: 'Affiliate program', status: 'applied', contact: 'affiliate-program.amazon.com',
    product: "Everything you've bought & reviewed", date: '',
    notes: "Apply first, but only once you're ready to post — 3 qualifying sales needed within 180 days or they close the account. Start with repeat-purchase items: Boxie litter (x3), Feline Greenies (x2), Hill's Science Diet (x2)." },
  { name: 'FELIWAY', category: 'Calming / behavior', status: 'researching', contact: '',
    product: 'Optimum 30-Day Starter Kit', date: '',
    notes: 'Repeat-adjacent, established brand — check IG bio / site footer for ambassador form first.' },
  { name: 'kin+Kind', category: 'Supplements', status: 'researching', contact: '',
    product: 'Organic Pumpkin Powder', date: '',
    notes: 'Small-to-mid brand, likely has an active ambassador program — good early target.' },
  { name: 'Boxie', category: 'Litter', status: 'researching', contact: '',
    product: 'Unscented Clumping Clay Litter', date: '',
    notes: 'Ordered 3x (Dec 2025, Jan 2026, Feb 2026) — strong repeat-use angle for the pitch.' },
  { name: 'N-Bone', category: 'Treats', status: 'researching', contact: '',
    product: 'Get Naked Furball Relief + Urinary Health Treats', date: '', notes: '' },
  { name: 'Feline Greenies', category: 'Dental treats', status: 'researching', contact: '',
    product: 'Dental Treats, Chicken & Salmon', date: '',
    notes: "Bigger brand — go through their marketing/PR team or 'pet influencer partnerships' page, not a cold DM." },
  { name: "Hill's Science Diet", category: 'Food', status: 'researching', contact: '',
    product: 'Dry Cat Food, Urinary & Hairball Control', date: '',
    notes: "Big brand — email PR team directly, cold DMs likely ignored at this size." },
  { name: 'Purina Pro Plan', category: 'Food', status: 'researching', contact: '',
    product: 'Urinary Tract Health Cat Food', date: '',
    notes: "Big brand — same approach as Hill's, look up their partnerships contact page." },
  { name: 'Silverquine', category: 'Wound / itch care', status: 'researching', contact: '', product: 'Pet Wound & Itch Care Hydrogel', date: '', notes: '' },
  { name: 'Petsters', category: 'Dental / grooming', status: 'researching', contact: '', product: 'Silicone 360° Pet Finger Toothbrush', date: '', notes: '' },
  { name: 'ZuHucpts', category: 'Litter box / enclosures', status: 'researching', contact: '', product: 'Stainless Steel Litter Box, Foldable Playpen', date: '', notes: '' },
  { name: 'C.E.T.', category: 'Dental', status: 'researching', contact: '', product: 'Enzymatic Toothpaste, Beef', date: '', notes: '' }
];

const CAPTION_TEMPLATES = [
  {
    format: 'Format A — Meme/Relatable (primary, most plug-friendly)',
    lines: [
      'POV: your cat discovers [PRODUCT] and now acts like you personally invented joy 💀 @[BRAND]',
      "the way [CAT] sprints across the house the second she hears the [PRODUCT] bag crinkle 😭",
      "we don't do mornings without [PRODUCT]. @[BRAND] said 'make the chaos more manageable' and they meant it",
      'not [CAT] treating [PRODUCT] like it\'s a personality trait now',
      "[CAT] really said 'this is mine now' about the [PRODUCT] and honestly, fair"
    ]
  },
  {
    format: 'Format B — Inner monologue',
    lines: [
      'they upgraded me to [PRODUCT]. honestly? i respect the effort. — [CAT], probably (@[BRAND])',
      'day 47 of guarding the [PRODUCT] like it\'s mine. because it is.',
      'new [PRODUCT] just dropped. i have not left its side since. @[BRAND]'
    ]
  },
  {
    format: 'Format C — Two-floor contrast',
    lines: [
      "upstairs: [CAT] destroying the [PRODUCT] like it personally wronged him. downstairs: [CAT] refusing to acknowledge it exists. @[BRAND] really said 'something for everyone'",
      "one floor is obsessed with [PRODUCT]. the other floor doesn't know what a [PRODUCT] is. this is the divide @[BRAND] built"
    ]
  },
  {
    format: 'Format D — CTA / question (great for reach + tags)',
    lines: [
      "[CAT] has been staring at the [PRODUCT] for ten minutes deciding if it's a threat or a gift. does your cat overthink everything too? (ps @[BRAND] sent us this one)",
      "we've been using [PRODUCT] for [X weeks] and [CAT] is a changed man. anyone else's cat get weirdly attached to something new?"
    ]
  },
  {
    format: 'Format E — Nature doc (rare, use sparingly)',
    lines: [
      'the [CATEGORY] approaches the [PRODUCT] with caution. he has learned that new objects require a full investigation before enjoyment can begin. @[BRAND]'
    ]
  }
];

const CAROUSEL_IDEAS = [
  { pillar: 'Litter & hygiene', ideas: [
    'things nobody tells you about owning 2 litter boxes vs 4',
    'why your cat is side-eyeing their new litter (and what actually changes their mind)',
    'litter mat vs no mat: the tracking experiment',
    "how often you actually need to scoop (it's more than you think)",
    "signs your litter box setup is stressing your cat out",
    'covered vs uncovered litter boxes: what our 4 cats taught us',
    'the "one box per cat plus one" rule, explained',
    "what litter tracking says about your cat's paw sensitivity"
  ]},
  { pillar: 'Grooming', ideas: [
    'brushing tools ranked by how much our cats tolerated them',
    'why your exotic cat sheds differently than your domestic shorthair',
    'self-cleaning brushes: worth it or gimmick?',
    'dental care for cats nobody actually does (until now)',
    'how to introduce toothbrushing without losing a finger',
    "signs your cat needs a grooming routine upgrade",
    'matting 101: what causes it and how to prevent it'
  ]},
  { pillar: 'Diet, food & treats', ideas: [
    'why we switched to urinary health food (and what changed)',
    'wet vs dry food: what our 4 cats each prefer and why',
    'treat rotation: how we keep 4 cats from getting bored',
    'reading a cat food label like you actually know what it means',
    'hairball control food: does it really work?',
    "how much water your cat should actually be drinking",
    'dental treats vs actual brushing: the real difference',
    'why Ramses and Diego eat differently than Cali and Neo'
  ]},
  { pillar: 'Enrichment & play', ideas: [
    'toy rotation schedule that actually keeps cats engaged',
    'why your cat ignores the $40 toy and loves the box it came in',
    'enrichment ideas for high-energy breeds (Savannah/Bengal edition)',
    'window perches: the most underrated cat purchase',
    'cat tunnels ranked by chaos-per-dollar',
    'interactive feeders: do they actually slow down eating?',
    "signs your cat is understimulated (and what to do about it)",
    'heartbeat toys and separation anxiety: what actually helps'
  ]},
  { pillar: 'Health & wellness', ideas: [
    'supplements we actually give our cats and why',
    "how to tell if your cat's \"being dramatic\" is actually pain",
    'salmon oil, pumpkin powder, and other add-ins explained',
    'wound care basics every cat owner should have on hand',
    'urinary tract health: what every cat owner should watch for',
    'the vet visit checklist we wish we had before owning 4 cats',
    'hydration tricks for cats who ignore their water bowl'
  ]},
  { pillar: 'Home setup & gear', ideas: [
    'carrier vs backpack vs stroller: which one for which situation',
    'cat-proofing a two-story home, room by room',
    'screen doors and enclosures: how we gave our indoor cats "outside"',
    'litter furniture that actually hides the box',
    'setting up a multi-cat household without the turf wars',
    "our full gear list by category (and what we'd actually rebuy)"
  ]},
  { pillar: 'Exotic cat specific (Savannah / Bengal)', ideas: [
    'things we wish we knew before getting an F2 Savannah',
    'Bengal cat energy levels: what to expect before you get one',
    'exotic breed vs domestic shorthair: real differences in care, not just looks',
    'why Ramses and Diego need more vertical space than Cali and Neo',
    'hybrid cat myths we get asked about constantly'
  ]},
  { pillar: 'General cat parenting', ideas: [
    'loot our cats would drop in a video game (gear breakdown, meme format but ties every product back to a slide)'
  ]}
];

const PITCH_TEMPLATES = {
  smallMid: {
    label: 'Small/Mid brand (casual DM or email)',
    subject: null,
    body: "Hi [BRAND]! We run TwoStoryTails on Instagram/TikTok, a cat account following our 4 cats (2 domestic shorthairs downstairs, a Savannah and Bengal upstairs). We've been using [PRODUCT] with [CAT] for [X months] and it's genuinely one of the only [CATEGORY] products all 4 of them will actually use, so we wanted to reach out. We post daily with a bonus carousel M/W/F and would love to know if you have an ambassador or affiliate program we could be part of. Happy to send examples of past content!\n\n— [NAME], @twostorytails"
  },
  bigBrand: {
    label: 'Big brand (formal email to PR/Partnerships)',
    subject: 'TwoStoryTails x [BRAND] — partnership inquiry',
    body: 'Hi [Name/Team],\n\nMy name is [NAME] and I run TwoStoryTails, a multi-platform cat content account following 4 cats across two breeds — domestic shorthairs and exotic Savannah/Bengal cats — with a two-floor "two worlds, one house" format that\'s become our core hook.\n\nWe post [frequency] across Instagram and TikTok, with [follower/view stats if strong]. We\'ve used [PRODUCT] regularly with [CAT] and it\'s held up as one of the more reliable products in our routine.\n\nI\'d love to learn more about any influencer, ambassador, or affiliate partnerships [BRAND] currently runs. Happy to share our media kit and past content examples.\n\nThanks for your time,\n[NAME]\n@twostorytails · [IG link] · [TikTok link]'
  },
  followUp: {
    label: 'Follow-up (after 1–2 weeks of silence)',
    subject: 'Re: TwoStoryTails x [BRAND] — partnership inquiry',
    body: "Hi again! Just following up on my note below in case it got buried — still would love to connect on a potential partnership with [BRAND]. Let me know if there's someone else I should reach out to instead!\n\n— [NAME], @twostorytails"
  }
};

const SEED_TASKS = [
  'Apply to Amazon Associates (affiliate-program.amazon.com)',
  "Reminder: 3 qualifying sales needed within 180 days of signup or Amazon closes the account — don't apply until ready to actually post links",
  "Generate Amazon affiliate links for repeat-purchase items (Boxie, Feline Greenies, Hill's Science Diet) and add to bio/linktree",
  'Set up a linktree (or equivalent) for affiliate + partner links',
  'Tag small/mid brands organically in regular posts for 1–2 weeks before pitching (FELIWAY, Boxie, kin+Kind, N-Bone, ZuHucpts, Silverquine, Petsters)',
  "Check each small/mid brand's IG bio / website footer for an ambassador or affiliate application form",
  'Look up "[brand] pet influencer partnerships" contact pages for big brands (Hill\'s, Purina, Greenies) — email PR/marketing, not a cold DM',
  'Send first batch of outreach pitches — one ask per email (ambassador program, product-for-content, or affiliate code)',
  'Set up M/W/F carousel content tying products into "what\'s actually in our lineup" round-ups',
  'Follow up on any pitch that\'s gone quiet for 1–2 weeks using the follow-up template'
];

// Offline caption drafts: a few lines per tone, with the tagged cat dropped in.
// Shuffling picks different lines each time so "Shuffle" actually gives you something new.
const OFFLINE_CAPTIONS = {
  'Deadpan nature-doc': [
    'Observed: [CAT] pauses mid-task, assesses the room, and resumes as if nothing occurred.',
    'Here we see [CAT] in the natural habitat, conserving energy for reasons science cannot explain.',
    'A rare sighting. [CAT] has chosen violence, and the household must adapt.'
  ],
  'Funny': [
    'The audacity. The confidence. The complete lack of remorse from [CAT].',
    '[CAT] said "trust the process" and the process was chaos.',
    'nobody asked [CAT] to do this. [CAT] did it anyway.'
  ],
  'Educational': [
    'Cats do this to reset their sense of territory. [CAT] is not being dramatic, just thorough.',
    'Fun fact: slow blinks are a sign of trust. [CAT] has blinked at us zero times today.',
    'Cats spend up to half their waking hours grooming. [CAT] is clearly going for a record.'
  ],
  'Meme-style': [
    'no thoughts. just vibes. and [CAT].',
    '[CAT] when the food bowl is 3% empty:',
    'me: we have a calm evening planned. [CAT]: we do not.'
  ],
  'Relatable': [
    'when you do something unhinged and immediately act like it never happened (ft. [CAT])',
    'pov: you sat down for one second and [CAT] has decided you are furniture now',
    'anyone else\'s cat have a full schedule of nonsense or just [CAT]?'
  ],
  'Multi-cat tie-in': [
    'Upstairs causes the chaos. Downstairs watches from a safe distance, judging silently.',
    'Two floors, four cats, zero agreement on anything.',
    'One floor is thriving. The other floor is [CAT].'
  ],
  'Wholesome': [
    'Just a small, ordinary moment with [CAT] that made the whole day better.',
    '[CAT] doesn\'t know it, but this is the best part of our day.',
    'Soft paws, loud heart. Thank you, [CAT].'
  ]
};

// Prompt for writing new on-screen lines with any AI chat (Templates > AI caption prompt).
// Built from our Instagram history: voice, formats, cat personalities and best performers.
// {{CLIP}}, {{CATS}} and {{VIBE}} are filled in from the panel.
const AI_CAPTION_PROMPT = `You write on-screen text for short cat videos for @twostorytails, a small but growing Instagram/TikTok account. Your job: write witty, original one-liners in our exact voice.

THE CATS (two floors, four cats)
- Downstairs:
  - Cali: calico, white with orange and black eye patches. The only girl. Sassy, judgy, quietly "taking notes."
  - Neo: mostly white with grey on top. Lazy, charming, unbothered. "Fat and jobless." Supervises, never helps.
- Upstairs:
  - Ramses: Savannah, dark grey with black stripes. Dramatic, anxious, always hungry. Takes everything personally.
  - Diego: Bengal, light brown with black stripes. Affectionate, cuddly, a "mama" to Ramses despite being a boy. Food-motivated.
- Ramses and Diego are "brothers" who annoy, copy and cuddle each other.
- The humans: the cats call one of us "Dad" (sometimes "daddy" or "the spare human") and treat us as staff.

OUR VOICE
- Deadpan, dry, self-aware. The owner is an exasperated but devoted servant; the cats are entitled roommates with no bills.
- Short: one line, two at most. Under 20 words is best; never over 30.
- Casual internet phrasing. Lowercase is fine. A little pet-speak is OK ("hooman", "wittle", "thawts") but no more than one per line.
- The joke lands at the end. Never explain it.
- Relatable first: any multi-cat owner should feel seen, even if they've never seen our cats.
- Canadian spelling (favourite, neighbourhood).

FORMATS WE USE (mix them)
1. POV: "POV: you've never paid a bill in your life and it shows"
2. When X, but/and Y: "When the hooman says dinner might be slightly late"
3. Me / my cat moment: "Me anytime my cat drinks bc that means he had a thought that he was thirsty & made the conscious choice to walk to his water bowl"
4. Quote then reveal: "\\"Your house must be so calm without kids\\" The house:"
5. Mock-official: "There is currently (1) cat in line for bed. Estimated wait time: 67 minutes"
6. Fake series: "On today's episode of fat and jobless:" / "Day 89 of posting my cat online so he can start paying rent"
7. Repetition: "Give me second breakfast" x4 / "Don't make eye-contact" x3
8. Brutal honesty: "I've been lying to my cat for years. Every time he meows I say \\"I know\\". But I don't know. I don't even have a clue."
9. Sibling drama: "When your brother HATES being touched but your only purpose in life is to annoy him"

THEMES THAT WORK FOR US
- Food obsession: being fed "ten minutes ago", second breakfast, the treats dealer
- Cats as unemployed: no bills, wifi password, paying rent, gruelling 12-hour shifts of napping
- Cats as our kids, child-free millennial edition: "our male son"
- Codependency, and being chosen by a cat
- Multi-cat chaos and sibling rivalry
- 3am zoomies and 6am breakfast demands
- Innocent face right after something insane
- Rotting in bed, cozy days, "stay toxic"

OUR BEST PERFORMERS, FOR REFERENCE (don't copy them)
- "Having a girl cat"
- "nothing humbles you like being loudly meowed at for food you just gave them ten minutes ago"
- "When my cat finds out we're spending the day rotting in bed"
- "no one warns you that personal space becomes a completely foreign concept once you're a cat owner"
- "My cats acting like they just worked a gruelling 12 hour shift"
- "when dad starts complaining about his job but you literally only know your own name and the sound of food being opened"

What they have in common: a universal owner truth, a specific detail, and a twist at the end. Our names only appear when the joke doesn't depend on knowing them.

AVOID
- Cat puns ("purrfect", "cattitude", "meow-nday", "pawsome")
- Hashtags, emojis (one at most, and only if it adds something), and our account name
- Anything mean-spirited or sad, inspirational-quote energy, and "Live, laugh, love"-style lines
- Reworded versions of the lines above
- Generic "cats are weird" jokes with no specific detail

TODAY'S REQUEST
- Clip / idea: {{CLIP}}
- Cats in it: {{CATS}}
- Vibe: {{VIBE}}

Write 10 options using at least 5 different formats from the list. For each, give:
- the line (exactly as it should appear on screen)
- [format name]
- a 1-to-5 rating for how universally relatable it is

Then pick your top 2 and say in one short sentence why each works.`;
