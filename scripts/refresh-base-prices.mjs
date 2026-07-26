#!/usr/bin/env node

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOMS = [
  { id: "651695", name: "Oliva" },
  { id: "651696", name: "Uva" }
];
const AVAILABILITY_URL =
  "https://media.xmlcal.com/widget/1.01/scripts/availability.php";
const QUOTE_URL =
  "https://book.bnbdimoraorru.it/api/ajax/getroomprice.php";
const MAX_QUOTE_NIGHTS = 14;
const SNAPSHOT_DAYS = 366;
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(
  SCRIPT_DIR,
  "../assets/data/base-prices-2-guests.json"
);

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function parseDate(value) {
  return new Date(value + "T12:00:00Z");
}

function addDays(value, days) {
  const date = typeof value === "string" ? parseDate(value) : new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  return isoDate(date);
}

function wait(milliseconds) {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, milliseconds);
  });
}

async function fetchJson(url, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          "user-agent": "dimora-orru-price-snapshot/1.0"
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url.origin}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await wait(300 * attempt);
    }
  }

  throw lastError;
}

function availableRuns(availability, startDate, endDate) {
  const dates = Object.keys(availability)
    .filter((date) => {
      const state = Number(availability[date]);
      return date >= startDate && date <= endDate && (state === 1 || state === 2);
    })
    .sort();
  const runs = [];

  dates.forEach((date) => {
    const current = runs[runs.length - 1];
    if (!current || addDays(current[current.length - 1], 1) !== date) {
      runs.push([date]);
    } else {
      current.push(date);
    }
  });

  return runs;
}

async function quoteDates(roomId, dates) {
  if (!dates.length) return {};

  const url = new URL(QUOTE_URL);
  [
    ["ro", roomId],
    ["ci", dates[0]],
    ["co", addDays(dates[dates.length - 1], 1)],
    ["na", "2"],
    ["nc", "0"],
    ["of", "1"],
    ["nr", "1"],
    ["la", "en"],
    ["cu", ""]
  ].forEach(([key, value]) => url.searchParams.set(key, value));

  const payload = await fetchJson(url);
  const quote = Array.isArray(payload) ? payload[0] : null;
  if (!quote || String(quote.roomid) !== roomId) return {};

  return dates.reduce((prices, date) => {
    const value = Number(quote[date]);
    if (Number.isFinite(value) && value > 0) prices[date] = value;
    return prices;
  }, {});
}

async function quoteRun(roomId, dates) {
  if (!dates.length) return {};

  const direct = await quoteDates(roomId, dates);
  const missing = dates.filter((date) => !direct[date]);
  if (!missing.length || dates.length === 1) return direct;

  const midpoint = Math.ceil(dates.length / 2);
  const left = await quoteRun(roomId, dates.slice(0, midpoint));
  const right = await quoteRun(roomId, dates.slice(midpoint));
  return { ...direct, ...left, ...right };
}

async function recoverPrice(roomId, date, availability) {
  const previous = addDays(date, -1);
  const next = addDays(date, 1);
  const previousAvailable = Number(availability[previous]) > 0;
  const nextAvailable = Number(availability[next]) > 0;
  const candidates = [];

  if (previousAvailable) candidates.push([previous, date]);
  if (nextAvailable) candidates.push([date, next]);
  candidates.push([date]);

  for (const dates of candidates) {
    const prices = await quoteDates(roomId, dates);
    if (prices[date]) return prices[date];
  }

  return undefined;
}

async function collectRoom(room, startDate, endDate) {
  const availabilityUrl = new URL(AVAILABILITY_URL);
  availabilityUrl.searchParams.set("roomid", room.id);
  const availability = await fetchJson(availabilityUrl);
  const availabilityEntries =
    availability && typeof availability === "object" && !Array.isArray(availability)
      ? Object.entries(availability).filter(([date]) =>
          /^\d{4}-\d{2}-\d{2}$/.test(date)
        )
      : [];

  if (!availabilityEntries.length ||
      availabilityEntries.some(([, state]) =>
        ![0, 1, 2].includes(Number(state))
      )) {
    throw new Error(`Unexpected availability response for room ${room.id}`);
  }

  const runs = availableRuns(availability, startDate, endDate);
  const prices = {};

  for (const run of runs) {
    for (let offset = 0; offset < run.length; offset += MAX_QUOTE_NIGHTS) {
      const chunk = run.slice(offset, offset + MAX_QUOTE_NIGHTS);
      Object.assign(prices, await quoteRun(room.id, chunk));
    }
  }

  const availableDates = runs.flat();
  for (const date of availableDates) {
    if (prices[date]) continue;
    const recovered = await recoverPrice(room.id, date, availability);
    if (recovered) prices[date] = recovered;
  }

  if (availableDates.length && !Object.keys(prices).length) {
    throw new Error(
      `No two-person prices returned for ${availableDates.length} ` +
      `available nights in room ${room.id}`
    );
  }

  return {
    name: room.name,
    prices: Object.fromEntries(
      Object.entries(prices).sort(([left], [right]) =>
        left.localeCompare(right)
      )
    )
  };
}

async function main() {
  const startDate =
    process.env.DIMORA_PRICE_START_DATE || isoDate(new Date());
  const endDate = addDays(startDate, SNAPSHOT_DAYS);
  const rooms = {};

  for (const room of ROOMS) {
    rooms[room.id] = await collectRoom(room, startDate, endDate);
  }

  const core = {
    version: 1,
    currency: "EUR",
    occupancy: {
      adults: 2,
      children: 0
    },
    coverage: {
      start: startDate,
      end: endDate
    },
    source: "Beds24 standard offer 1",
    rooms
  };

  try {
    const existing = JSON.parse(await readFile(OUTPUT_PATH, "utf8"));
    const { generatedAt: ignored, ...existingCore } = existing;
    if (JSON.stringify(existingCore) === JSON.stringify(core)) {
      console.log("Base-price snapshot is already current.");
      return;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const output = {
    ...core,
    generatedAt: new Date().toISOString()
  };
  const temporaryPath = OUTPUT_PATH + ".tmp";
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(temporaryPath, JSON.stringify(output, null, 2) + "\n");
  await rename(temporaryPath, OUTPUT_PATH);
  console.log(`Updated ${OUTPUT_PATH}`);
}

await main();
