import type Client from "@/classes/client";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

export interface ParsedBirthday {
  day: number;
  month: number; // 1-12
  year?: number;
  date: Date;
  hasYear: boolean;
}

export function parseBirthdayInput(input: string): ParsedBirthday | null {
  const trimmed = input.trim().replaceAll(",", " ").replaceAll("-", "/").replaceAll(".", "/");
  const currentYear = new Date().getFullYear();

  const parts = trimmed.split("/").map((p) => p.trim());

  if (parts.length === 3) {
    const p1 = parseInt(parts[0]!, 10);
    const p2 = parseInt(parts[1]!, 10);
    const p3 = parseInt(parts[2]!, 10);

    if (isNaN(p1) || isNaN(p2) || isNaN(p3)) return null;

    let year: number, month: number, day: number;

    if (p1 > 1000) {
      // YYYY/MM/DD
      year = p1;
      month = p2;
      day = p3;
    } else if (p3 > 1000) {
      // MM/DD/YYYY
      year = p3;
      if (p1 <= 12 && p2 <= 31) {
        month = p1;
        day = p2;
      } else {
        month = p2;
        day = p1;
      }
    } else {
      return null;
    }

    return createParsedBirthday(day, month, year, true);
  }

  if (parts.length === 2 && !isNaN(parseInt(parts[0]!, 10)) && !isNaN(parseInt(parts[1]!, 10))) {
    // MM/DD — no year
    const p1 = parseInt(parts[0]!, 10);
    const p2 = parseInt(parts[1]!, 10);

    let month: number, day: number;
    if (p1 <= 12 && p2 <= 31) {
      month = p1;
      day = p2;
    } else if (p2 <= 12 && p1 <= 31) {
      month = p2;
      day = p1;
    } else {
      return null;
    }

    return createParsedBirthday(day, month, undefined, false);
  }

  // Text month: "May 15", "15 May", "May 15 2000", etc.
  const words = trimmed.split(/\s+/);
  let foundMonth: number | undefined;
  let foundDay: number | undefined;
  let foundYear: number | undefined;

  for (const word of words) {
    const lower = word.toLowerCase();
    if (MONTH_MAP[lower]) {
      foundMonth = MONTH_MAP[lower];
    } else {
      const num = parseInt(word, 10);
      if (!isNaN(num)) {
        if (num > 1900 && num <= currentYear) {
          foundYear = num;
        } else if (num >= 1 && num <= 31) {
          foundDay = num;
        }
      }
    }
  }

  if (foundMonth && foundDay) {
    return createParsedBirthday(foundDay, foundMonth, foundYear, foundYear !== undefined);
  }

  return null;
}

function createParsedBirthday(day: number, month: number, year?: number, hasYear = true): ParsedBirthday | null {
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  // Use year 400 (a leap year) as the sentinel for "no year provided".
  // Must be >= 100 so Date.UTC doesn't interpret it as 1900+year.
  const storedYear = hasYear && year ? year : 400;
  const testDate = new Date(Date.UTC(storedYear, month - 1, day));

  if (testDate.getUTCMonth() !== month - 1 || testDate.getUTCDate() !== day) {
    return null;
  }

  return {
    day,
    month,
    year: hasYear ? year : undefined,
    date: testDate,
    hasYear,
  };
}

export function getOrdinalSuffix(day: number): string {
  const j = day % 10;
  const k = day % 100;
  if (j === 1 && k !== 11) return `${day}st`;
  if (j === 2 && k !== 12) return `${day}nd`;
  if (j === 3 && k !== 13) return `${day}rd`;
  return `${day}th`;
}

export interface BirthdayInfo {
  month: number;
  day: number;
  year?: number;
  hasYear: boolean;
  formattedDate: string;
  mmddyyyy: string;
  /** Unix timestamp (seconds) of the next occurrence of this birthday at midnight UTC */
  nextBirthdayTimestamp: number;
  daysUntil: number;
  age?: number;
}

export function calculateBirthdayInfo(birthdayDate: Date, now = new Date()): BirthdayInfo {
  const month = birthdayDate.getUTCMonth() + 1;
  const day = birthdayDate.getUTCDate();
  const year = birthdayDate.getUTCFullYear();
  const hasYear = year >= 1900;

  // hasYear is true only when the stored year is a real birth year (>= 1900).
  // Years below 1900 are our sentinel for "no year provided".
  const currentYear = now.getUTCFullYear();
  const todayMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  let nextBday = new Date(Date.UTC(currentYear, month - 1, day));
  if (nextBday.getTime() < todayMidnight.getTime()) {
    nextBday = new Date(Date.UTC(currentYear + 1, month - 1, day));
  }

  const diffMs = nextBday.getTime() - todayMidnight.getTime();
  const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));
  // nextBirthday at noon UTC so Discord's LongDate renders the correct calendar day
  // in all timezones (noon UTC is never the day before or after locally).
  const nextBirthdayTimestamp = Math.floor(
    new Date(Date.UTC(nextBday.getUTCFullYear(), month - 1, day, 12, 0, 0)).getTime() / 1000,
  );

  let age: number | undefined;
  if (hasYear) {
    const turningAge = nextBday.getUTCFullYear() - year;
    age = turningAge;
  }

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const mmddyyyy = hasYear ? `${mm}/${dd}/${year}` : `${mm}/${dd}`;

  const monthName = MONTH_NAMES[month - 1];
  const formattedDate = hasYear
    ? `${monthName} ${getOrdinalSuffix(day)}, ${year} (${mmddyyyy})`
    : `${monthName} ${getOrdinalSuffix(day)} (${mmddyyyy})`;

  return {
    month,
    day,
    year: hasYear ? year : undefined,
    hasYear,
    formattedDate,
    mmddyyyy,
    nextBirthdayTimestamp,
    daysUntil,
    age,
  };
}

export async function setBirthday(client: Client, userId: string, dateInput: string) {
  const parsed = parseBirthdayInput(dateInput);

  if (!parsed) {
    throw new Error(
      `Invalid date format: "${dateInput}". Please use MM/DD/YYYY (e.g. \`05/15/2000\`), MM/DD (e.g. \`05/15\`), YYYY-MM-DD, or \`May 15\`.`,
    );
  }

  await client.prisma.user.upsert({
    where: { id: userId },
    update: { birthday: parsed.date },
    create: { id: userId, birthday: parsed.date },
  });

  return calculateBirthdayInfo(parsed.date);
}

export async function getBirthday(client: Client, userId: string) {
  const user = await client.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.birthday) {
    return null;
  }

  return calculateBirthdayInfo(user.birthday);
}

export async function unsetBirthday(client: Client, userId: string) {
  const existing = await client.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existing || !existing.birthday) {
    return false;
  }

  await client.prisma.user.update({
    where: { id: userId },
    data: { birthday: null },
  });

  return true;
}

export async function getUpcomingBirthdays(client: Client, userIds: string[]) {
  if (userIds.length === 0) return [];

  const users = await client.prisma.user.findMany({
    where: {
      id: { in: userIds },
      birthday: { not: null },
    },
  });

  const now = new Date();
  const list = users
    .map((user) => {
      const info = calculateBirthdayInfo(user.birthday!, now);
      return { userId: user.id, ...info };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return list;
}
