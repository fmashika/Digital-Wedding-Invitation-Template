import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import type {
  GiftContribution,
  GuestbookWish,
  MealChoice,
  PaymentMethod,
  RegistryItem,
  RsvpRecord,
  WeddingDatabase,
} from './src/types.ts';

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'wedding-state.json');

const SEED_REGISTRY_ITEMS: RegistryItem[] = [
  {
    id: 'honeymoon-amalfi',
    title: 'Amalfi Coast Honeymoon Suite',
    category: 'Honeymoon',
    description:
      'Four cliffside nights in Ravello, private coastal ferries, and celebratory sunset dinners.',
    goalAmount: 3200,
    raisedAmount: 1850,
    imageUrl: '/src/assets/images/gallery_opal_venue_1794819812741.jpg',
    featured: true,
  },
  {
    id: 'espresso-micra',
    title: 'Artisan Stainless Espresso Machine',
    category: 'Home & Kitchen',
    description:
      'A dual-boiler espresso station for quiet Sunday mornings together in Tucson.',
    goalAmount: 1600,
    raisedAmount: 1120,
    imageUrl: '/src/assets/images/gallery_rings_keepsake_1794819813262.jpg',
    featured: true,
  },
  {
    id: 'sonoran-stoneware',
    title: 'Hand-Thrown Desert Stoneware (Set of 8)',
    category: 'Dining',
    description:
      'Wheel-thrown ceramic dinnerware finished in matte alabaster and slate glaze by a Tucson studio.',
    goalAmount: 640,
    raisedAmount: 480,
    imageUrl: '/src/assets/images/gallery_reception_table_1794819812328.jpg',
    featured: false,
  },
  {
    id: 'belgian-linen',
    title: 'Belgian Flax Linen Bedding Suite',
    category: 'Home & Kitchen',
    description:
      'Stonewashed heirloom linen duvet cover and shams in soft coastal slate and ivory.',
    goalAmount: 420,
    raisedAmount: 420,
    imageUrl: '/src/assets/images/gallery_rings_keepsake_1794819813262.jpg',
    featured: false,
  },
  {
    id: 'sunset-sail',
    title: 'Private Mediterranean Sail & Picnic',
    category: 'Experiences',
    description:
      'A full-day wooden sailboat charter with local vintages and a coastal lunch for two.',
    goalAmount: 550,
    raisedAmount: 200,
    imageUrl: '/src/assets/images/gallery_engagement_walk_1794819812035.jpg',
    featured: false,
  },
  {
    id: 'desert-print',
    title: 'Framed Archival Sonoran Print',
    category: 'Home & Kitchen',
    description:
      'Large-format museum glass framing for our favorite engagement portrait.',
    goalAmount: 380,
    raisedAmount: 150,
    imageUrl: '/src/assets/images/hero_couple_retreat_1794819811766.jpg',
    featured: false,
  },
];

const SEED_RSVPS: RsvpRecord[] = [
  {
    id: 'rsvp-101',
    passCode: 'PASS-101',
    guestName: 'Elena Martinez',
    email: 'elena.martinez@example.com',
    attending: true,
    partySize: 2,
    additionalGuests: 'Carlos Martinez',
    mealChoice: 'Sonoran Herb-Crusted Sea Bass',
    dietaryNotes: 'No shellfish',
    songRequest: 'Beyond — Leon Bridges',
    tableAssignment: 'Table 3 · Olive Grove',
    checkInStatus: 'pending',
    checkedInAt: null,
    createdAt: '2026-10-12T18:30:00.000Z',
  },
  {
    id: 'rsvp-102',
    passCode: 'PASS-102',
    guestName: 'Mateo & Sofia Alvarez',
    email: 'mateo.alvarez@example.com',
    attending: true,
    partySize: 2,
    additionalGuests: 'Sofia Alvarez',
    mealChoice: 'Braised Beef Short Rib',
    dietaryNotes: 'None',
    songRequest: 'La Vie En Rose',
    tableAssignment: 'Table 1 · Family Terrace',
    checkInStatus: 'checked_in',
    checkedInAt: '2027-12-11T20:42:00.000Z',
    createdAt: '2027-10-08T14:15:00.000Z',
  },
  {
    id: 'rsvp-103',
    passCode: 'PASS-103',
    guestName: 'Julian Vance',
    email: 'julian.vance@example.com',
    attending: true,
    partySize: 1,
    additionalGuests: '',
    mealChoice: 'Charred Cauliflower Steak',
    dietaryNotes: 'Plant-based',
    songRequest: 'September — Earth, Wind & Fire',
    tableAssignment: 'Table 5 · Saguaro Courtyard',
    checkInStatus: 'pending',
    checkedInAt: null,
    createdAt: '2026-10-19T11:20:00.000Z',
  },
];

const SEED_CONTRIBUTIONS: GiftContribution[] = [
  {
    id: 'contrib-1',
    referenceCode: 'PAY-8412',
    itemId: 'honeymoon-amalfi',
    itemTitle: 'Amalfi Coast Honeymoon Suite',
    contributorName: 'Mateo & Sofia Alvarez',
    contributorEmail: 'mateo.alvarez@example.com',
    amount: 500,
    paymentMethod: 'Card',
    accountSummary: 'Visa •••• 4242',
    note: 'Wishing you both endless sunlit mornings along the coast.',
    createdAt: '2026-10-20T16:40:00.000Z',
  },
  {
    id: 'contrib-2',
    referenceCode: 'PAY-8499',
    itemId: 'belgian-linen',
    itemTitle: 'Belgian Flax Linen Bedding Suite',
    contributorName: 'Claire & Daniel Park',
    contributorEmail: 'claire.park@example.com',
    amount: 420,
    paymentMethod: 'Apple Pay',
    accountSummary: 'Apple Pay Express',
    note: 'So excited to celebrate with you at Opal Retreat!',
    createdAt: '2026-10-24T09:15:00.000Z',
  },
];

const SEED_GUESTBOOK_WISHES: GuestbookWish[] = [
  {
    id: 'wish-1',
    authorName: 'Mateo & Sofia Alvarez',
    relationship: 'Family Friends · Phoenix',
    message:
      'May your marriage be filled with slow Sunday mornings, warm desert sunsets, and endless laughter together.',
    createdAt: '2026-10-21T15:10:00.000Z',
  },
  {
    id: 'wish-2',
    authorName: 'Elena & Carlos Martinez',
    relationship: 'Bridesmaid & Guest',
    message:
      'Seeing the two of you together has always felt effortless and true. Cannot wait to celebrate at Opal Retreat!',
    createdAt: '2026-10-24T19:45:00.000Z',
  },
  {
    id: 'wish-3',
    authorName: 'Claire & Daniel Park',
    relationship: 'University Friends',
    message:
      'Cheers to Pinniel & Wema! Wishing you a lifetime of adventure from Tucson to the Amalfi Coast and beyond.',
    createdAt: '2026-11-02T12:20:00.000Z',
  },
];

function createInitialDb(): WeddingDatabase {
  return {
    rsvps: SEED_RSVPS,
    registryItems: SEED_REGISTRY_ITEMS,
    contributions: SEED_CONTRIBUTIONS,
    guestbookWishes: SEED_GUESTBOOK_WISHES,
  };
}

function readDb(): WeddingDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = createInitialDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<WeddingDatabase>;
    const normalized: WeddingDatabase = {
      rsvps: Array.isArray(parsed.rsvps) ? parsed.rsvps : SEED_RSVPS,
      registryItems: Array.isArray(parsed.registryItems)
        ? parsed.registryItems
        : SEED_REGISTRY_ITEMS,
      contributions: Array.isArray(parsed.contributions)
        ? parsed.contributions
        : SEED_CONTRIBUTIONS,
      guestbookWishes: Array.isArray(parsed.guestbookWishes)
        ? parsed.guestbookWishes
        : SEED_GUESTBOOK_WISHES,
    };
    return normalized;
  } catch {
    return createInitialDb();
  }
}

function writeDb(db: WeddingDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function generatePassCode(existingCodes: Set<string>): string {
  for (let i = 0; i < 20; i++) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const code = `PW-${num}`;
    if (!existingCodes.has(code)) {
      return code;
    }
  }
  return `PW-${Date.now().toString().slice(-4)}`;
}

function assignTable(index: number, attending: boolean): string {
  if (!attending) return 'Not Seated';
  const tables = [
    'Table 2 · Limestone Arch',
    'Table 4 · Desert Rose',
    'Table 6 · Catalina View',
    'Table 7 · Starlight Pavilion',
    'Table 8 · Arroyo Terrace',
  ];
  return tables[index % tables.length];
}

function normalizePassCode(raw: string): string {
  const trimmed = raw.trim().toUpperCase();
  if (trimmed.startsWith('WEDDING-CHECKIN:')) {
    return trimmed.replace('WEDDING-CHECKIN:', '').trim();
  }
  return trimmed;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/wedding-data', (_req, res) => {
    const db = readDb();
    res.json(db);
  });

  app.post('/api/rsvp', (req, res) => {
    const body = req.body as {
      guestName?: string;
      email?: string;
      attending?: boolean;
      partySize?: number;
      additionalGuests?: string;
      mealChoice?: MealChoice;
      dietaryNotes?: string;
      songRequest?: string;
    };

    const guestName = (body.guestName ?? '').trim();
    const email = (body.email ?? '').trim().toLowerCase();
    const attending = Boolean(body.attending);
    const partySize = attending ? Math.min(6, Math.max(1, Number(body.partySize) || 1)) : 0;

    if (!guestName || !email || !email.includes('@')) {
      res.status(400).json({ error: 'Please provide a valid full name and email address.' });
      return;
    }

    const db = readDb();
    const existingIdx = db.rsvps.findIndex(
      (r) => r.email.toLowerCase() === email || r.guestName.toLowerCase() === guestName.toLowerCase()
    );

    const existingCodes = new Set(db.rsvps.map((r) => r.passCode));

    if (existingIdx >= 0) {
      const existing = db.rsvps[existingIdx];
      const updated: RsvpRecord = {
        ...existing,
        guestName,
        email,
        attending,
        partySize,
        additionalGuests: (body.additionalGuests ?? '').trim(),
        mealChoice: attending ? body.mealChoice ?? 'Sonoran Herb-Crusted Sea Bass' : 'Not Attending',
        dietaryNotes: (body.dietaryNotes ?? '').trim(),
        songRequest: (body.songRequest ?? '').trim(),
        tableAssignment: attending
          ? existing.tableAssignment === 'Not Seated'
            ? assignTable(db.rsvps.length, true)
            : existing.tableAssignment
          : 'Not Seated',
      };
      db.rsvps[existingIdx] = updated;
      writeDb(db);
      res.json({ rsvp: updated, db });
      return;
    }

    const record: RsvpRecord = {
      id: `rsvp-${Date.now()}`,
      passCode: generatePassCode(existingCodes),
      guestName,
      email,
      attending,
      partySize,
      additionalGuests: (body.additionalGuests ?? '').trim(),
      mealChoice: attending ? body.mealChoice ?? 'Sonoran Herb-Crusted Sea Bass' : 'Not Attending',
      dietaryNotes: (body.dietaryNotes ?? '').trim(),
      songRequest: (body.songRequest ?? '').trim(),
      tableAssignment: assignTable(db.rsvps.length, attending),
      checkInStatus: 'pending',
      checkedInAt: null,
      createdAt: new Date().toISOString(),
    };

    db.rsvps.unshift(record);
    writeDb(db);
    res.status(201).json({ rsvp: record, db });
  });

  app.get('/api/rsvp/lookup', (req, res) => {
    const query = String(req.query.query ?? '').trim().toLowerCase();
    if (!query) {
      res.status(400).json({ error: 'Enter a guest name, email, or pass code.' });
      return;
    }
    const db = readDb();
    const match = db.rsvps.find(
      (r) =>
        r.passCode.toLowerCase() === query ||
        r.email.toLowerCase() === query ||
        r.guestName.toLowerCase().includes(query)
    );
    if (!match) {
      res.status(404).json({ error: 'No invitation pass found matching that name, email, or code.' });
      return;
    }
    res.json({ rsvp: match });
  });

  app.post('/api/registry/contribute', (req, res) => {
    const body = req.body as {
      itemId?: string;
      contributorName?: string;
      contributorEmail?: string;
      amount?: number;
      paymentMethod?: PaymentMethod;
      accountSummary?: string;
      note?: string;
    };

    const contributorName = (body.contributorName ?? '').trim();
    const contributorEmail = (body.contributorEmail ?? '').trim();
    const amount = Math.round(Number(body.amount) || 0);
    const itemId = (body.itemId ?? '').trim();

    if (!contributorName || !contributorEmail || !contributorEmail.includes('@')) {
      res.status(400).json({ error: 'Please enter your name and a valid email for your receipt.' });
      return;
    }
    if (amount < 10 || amount > 10000) {
      res.status(400).json({ error: 'Contribution amount must be between $10 and $10,000.' });
      return;
    }

    const db = readDb();
    let itemTitle = 'Honeymoon & Future Home Fund';

    if (itemId !== 'custom-cash-fund') {
      const targetItem = db.registryItems.find((item) => item.id === itemId);
      if (!targetItem) {
        res.status(404).json({ error: 'Registry item not found.' });
        return;
      }
      targetItem.raisedAmount += amount;
      itemTitle = targetItem.title;
    } else {
      const honeymoon = db.registryItems.find((item) => item.id === 'honeymoon-amalfi');
      if (honeymoon) {
        honeymoon.raisedAmount += amount;
      }
    }

    const referenceCode = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;
    const contribution: GiftContribution = {
      id: `contrib-${Date.now()}`,
      referenceCode,
      itemId,
      itemTitle,
      contributorName,
      contributorEmail,
      amount,
      paymentMethod: body.paymentMethod ?? 'Card',
      accountSummary: (body.accountSummary ?? 'Verified Payment').trim(),
      note: (body.note ?? '').trim(),
      createdAt: new Date().toISOString(),
    };

    db.contributions.unshift(contribution);
    writeDb(db);
    res.status(201).json({ contribution, db });
  });

  app.post('/api/checkin/verify', (req, res) => {
    const body = req.body as { code?: string };
    const normalized = normalizePassCode(body.code ?? '');
    if (!normalized) {
      res.status(400).json({ error: 'No QR pass code detected.' });
      return;
    }

    const db = readDb();
    const guest = db.rsvps.find(
      (r) =>
        r.passCode.toUpperCase() === normalized ||
        r.email.toLowerCase() === normalized.toLowerCase()
    );

    if (!guest) {
      res.status(404).json({
        error: `Pass code "${normalized}" was not found in the guest list.`,
      });
      return;
    }

    if (!guest.attending) {
      res.status(400).json({
        error: `${guest.guestName} is currently marked as declined. Please update RSVP before check-in.`,
      });
      return;
    }

    const alreadyCheckedIn = guest.checkInStatus === 'checked_in';
    if (!alreadyCheckedIn) {
      guest.checkInStatus = 'checked_in';
      guest.checkedInAt = new Date().toISOString();
      writeDb(db);
    }

    res.json({
      status: alreadyCheckedIn ? 'already_checked_in' : 'checked_in',
      guest,
      db,
    });
  });

  app.post('/api/checkin/reset', (req, res) => {
    const body = req.body as { passCode?: string };
    const code = normalizePassCode(body.passCode ?? '');
    const db = readDb();
    const guest = db.rsvps.find((r) => r.passCode.toUpperCase() === code);
    if (!guest) {
      res.status(404).json({ error: 'Guest pass not found.' });
      return;
    }
    guest.checkInStatus = 'pending';
    guest.checkedInAt = null;
    writeDb(db);
    res.json({ guest, db });
  });

  app.post('/api/guestbook', (req, res) => {
    const body = req.body as {
      authorName?: string;
      relationship?: string;
      message?: string;
    };

    const authorName = (body.authorName ?? '').trim().slice(0, 80);
    const relationship = (body.relationship ?? '').trim().slice(0, 80);
    const message = (body.message ?? '').trim().slice(0, 320);

    if (!authorName) {
      res.status(400).json({ error: 'Please enter your name to sign the guestbook.' });
      return;
    }
    if (message.length < 3) {
      res.status(400).json({
        error: 'Please write a short congratulatory wish (at least 3 characters).',
      });
      return;
    }

    const db = readDb();
    const wish: GuestbookWish = {
      id: `wish-${Date.now()}`,
      authorName,
      ...(relationship ? { relationship } : {}),
      message,
      createdAt: new Date().toISOString(),
    };

    db.guestbookWishes.unshift(wish);
    writeDb(db);
    res.status(201).json({ wish, db });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(
      express.static(distDir, {
        maxAge: '7d',
        etag: true,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Wedding invitation server running on http://localhost:${PORT}`);
  });
}

startServer();
