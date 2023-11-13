import axios from "axios";
import { randomBytes } from "crypto";
import { Coord, LatLon, Stats } from "./types";

const EARTH_RADIUS = 6371000;
const RADN = (EARTH_RADIUS * Math.PI) / 180;
const MIN_P = 100;
const MIN_P_RADIUS = 50;

let rands: number[] = [];

async function guaranteeBuffer() {
  if (rands.length < 300) {
    const res = await axios("api/getRands");
    rands = rands.concat(res.data.rands);
  }
}

const byteIterator = (async function* () {
  while (true) {
    await guaranteeBuffer();
    yield rands.shift();
  }
})();
const Uint8Iterator = (async function* () {
  const buf = new ArrayBuffer(2);
  const view = new DataView(buf);

  while (true) {
    for (let i of [0, 1]) {
      let x = await byteIterator.next();
      if (x.value) {
        view.setUint8(i, x.value);
      }
    }
    yield view.getUint16(0);
  }
})();

export async function getRand(maxVal: number) {
  const bitsNeeded = Math.ceil(Math.log2(maxVal));
  const iter = bitsNeeded <= 8 ? byteIterator : Uint8Iterator;

  let test;
  while (true) {
    test = await iter.next();
    if (test.value && test.value < maxVal && test.value > 0) {
      return test.value;
    }
  }
}

function getDistance(center: LatLon, target: LatLon) {
  const { lat: lat0, lon: lon0 } = center;
  const { lat: lat1, lon: lon1 } = target;
  const dLon = ((lon1 - lon0) * Math.PI) / 180,
    dLat = ((lat1 - lat0) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat0 * Math.PI) / 180) *
      Math.cos((lat1 * Math.PI) / 180) *
      (Math.sin(dLon / 2) * Math.sin(dLon / 2));
  return (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * EARTH_RADIUS) | 0;
}

function getAzimuth(center: LatLon, target: LatLon) {
  const { lat: lat0, lon: lon0 } = center;
  const { lat: lat1, lon: lon1 } = target;
  const dLon = (lon1 - lon0) * RADN,
    dLat = (lat1 - lat0) * RADN;

  let az =
    (180 * Math.atan((dLon * Math.cos((lat0 * Math.PI) / 180)) / dLat)) /
    Math.PI;
  az = az < 0 ? az + 360 : az;

  const rd = getDistance(center, target);
  const rd1 = getDistance(target, {
    lat: center.lat + (rd * Math.cos((az * Math.PI) / 180)) / RADN,
    lon:
      center.lon +
      (rd * Math.sin((az * Math.PI) / 180)) /
        Math.cos((center.lat * Math.PI) / 180) /
        RADN,
  });

  return rd < rd1 ? az + 180 : az;
}

function getAverageCoordinate(pointsBag: Coord[]): LatLon {
  const avg = pointsBag.reduce(
    (a, coord) => {
      const [lat, lon] = coord.split(":");
      return { lat: a.lat + Number(lat), lon: a.lon + Number(lon) };
    },
    { lat: 0, lon: 0 }
  );
  return {
    lat: avg.lat / pointsBag.length,
    lon: avg.lon / pointsBag.length,
  };
}

function getMirrorCoordinate(center: LatLon, target: LatLon): LatLon {
  const distance = getDistance(center, target);
  let az = getAzimuth(center, target);
  az = az < 180 ? az + 180 : az - 180;
  return {
    lat: center.lat + (distance * Math.cos((az * Math.PI) / 180)) / RADN,
    lon:
      center.lon +
      (distance * Math.sin((az * Math.PI) / 180)) /
        Math.cos((center.lat * Math.PI) / 180) /
        RADN,
  };
}

async function fillPointsBag(center: LatLon, radius: number): Promise<Coord[]> {
  const bag: Set<Coord> = new Set();
  let size = Math.round(radius / 10);
  size = size < MIN_P ? MIN_P : size;
  const it = takeCoordinate(center, radius);

  while (bag.size < size) {
    const coord = await it.next();
    if (coord.value) {
      const { lat: plat, lon: plon } = coord.value;
      bag.add(`${plat}:${plon}`);
    }
  }
  return Array.from(bag);
}

function getStats(
  attractor: LatLon,
  pointsBag: Coord[],
  radius: number
): Stats {
  const distances = pointsBag.map((coord) => {
    const [plat, plon] = coord.split(":");
    return getDistance(attractor, { lat: Number(plat), lon: Number(plon) });
  });
  const sorted = distances.slice(0, distances.length).sort((a, b) => a - b);

  const minrad = sorted[0];
  let testpts: number[] = [],
    testrad = 2 * minrad;
  while (testpts.length < 10) {
    testpts = distances.filter((d) => d <= testrad);
    testrad += minrad; // expand the test radius till we nab at least 10 random points
  }

  // average radius of selected points
  const arad = testpts.reduce((a, d) => a + d, 0) / testpts.length;
  // number of points in full set within radius
  const nrad = sorted.filter((d) => d <= arad).length;
  const power =
    (nrad * Math.pow(radius, 2)) / (pointsBag.length * Math.pow(arad, 2));
  console.log(
    `(${nrad} * Math.pow(${radius}, 2)) / (${pointsBag.length} * Math.pow(${arad}, 2))`
  );

  return {
    coordinate: { lat: attractor.lat, lon: attractor.lon },
    radius: Math.round(arad),
    power,
  };
}

export async function getAttractor(
  center: LatLon,
  radius: number
): Promise<Stats> {
  const fullBag = await fillPointsBag(center, radius);
  let avgCoord: LatLon = center,
    rd = radius,
    bag = Array.from(fullBag);

  console.log("get attractor");
  // Step the test radius down 1 meter per iteration
  while (--rd > MIN_P_RADIUS && bag.length > 1) {
    avgCoord = getAverageCoordinate(bag);
    bag = bag.filter((v) => {
      const [plat, plon] = v.split(":");
      return (
        getDistance(avgCoord, { lat: Number(plat), lon: Number(plon) }) <= rd
      );
    });
  }

  return getStats(avgCoord, fullBag, radius);
}

export async function getVoid(center: LatLon, radius: number): Promise<Stats> {
  const fullBag = await fillPointsBag(center, radius);
  console.log(fullBag);
  let mirCoord: LatLon = center,
    rd = radius,
    bag = Array.from(fullBag);

  console.log("get void");
  while (--rd > MIN_P_RADIUS && bag.length > 1) {
    mirCoord = getMirrorCoordinate(center, getAverageCoordinate(bag));
    rd = rd - getDistance(mirCoord, center);

    bag = bag.filter((v) => {
      const [plat, plon] = v.split(":");
      return (
        getDistance(mirCoord, { lat: Number(plat), lon: Number(plon) }) <= rd
      );
    });

    center = mirCoord; // reset "center" for next iteration
  }
  const stats = getStats(mirCoord, fullBag, radius);
  return { ...stats, ...{ power: 1 / stats.power } };
}

export async function* takeCoordinate(
  { lat, lon }: { lat: number; lon: number },
  radius: number
): AsyncGenerator<LatLon> {
  const latBase = lat + (radius * -1) / RADN;
  const dLat = (lat + radius / RADN - latBase) * 1000000;
  const lonBase =
    lon +
    (radius * Math.sin((270 * Math.PI) / 180)) /
      Math.cos((lat * Math.PI) / 180) /
      RADN;
  const dLon =
    (lon +
      (radius * Math.sin((90 * Math.PI) / 180)) /
        Math.cos((lat * Math.PI) / 180) /
        RADN -
      lonBase) *
    1000000;

  while (true) {
    let rLat = await getRand(dLat);
    let rLon = await getRand(dLon);
    rLat = latBase + rLat / 1000000;
    rLon = lonBase + rLon / 1000000;
    if (getDistance({ lat, lon }, { lat: rLat, lon: rLon }) <= radius) {
      yield { lat: rLat, lon: rLon };
    }
  }
}

export function calculateAngle(point1: LatLon, point2: LatLon) {
  let dy = point2.lat - point1.lat;
  let dx = point2.lon - point1.lon;
  let theta = Math.atan2(dy, dx); // Range (-PI, PI]
  theta *= 180 / Math.PI; // Convert to degrees
  return theta;
}
