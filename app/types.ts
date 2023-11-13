export type Stats = {
  power: number;
  coordinate: LatLon;
  radius: number;
};

export type LatLon = {
  lat: number;
  lon: number;
};

export type Coord = `${number}:${number}`;
