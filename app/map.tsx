// src/components/Map.tsx

import { useEffect, useRef, useState } from 'react';
import { LatLon, Stats } from './types';

const concatMarker = (
  url: string,
  color = 'blue',
  label = 'A',
  latlon?: LatLon,
) =>
  latlon
    ? `${url}&markers=color:${color}%7Clabel:${label}%7C${latlon.lat},${latlon.lon}`
    : url;
const convertRange = (value: number, r1: number, r2: number) => {
  return Math.round((value * r2) / r1);
};
const convertSizes = (width: number, height: number): [number, number] => {
  if (width > height) {
    return [convertRange(width, width, 640), convertRange(height, width, 640)];
  } else {
    return [
      convertRange(width, height, 640),
      convertRange(height, height, 640),
    ];
  }
};

const Map = ({
  userLocation,
  voidStats,
}: {
  userLocation?: LatLon;
  voidStats?: Stats;
}) => {
  const [mapUrl, setMapUrl] = useState('');
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mapRef.current === null || !userLocation) {
      return;
    }
    const convertedSizes = convertSizes(
      mapRef.current.offsetWidth,
      mapRef.current.offsetHeight,
    );
    const size = `${convertedSizes[0]}x${convertedSizes[1]}`;
    let url = `https://maps.googleapis.com/maps/api/staticmap?&maptype=satellite&key=${process.env.NEXT_PUBLIC_GMAPS_API_KEY}&size=${size}&scale=2`;
    url = concatMarker(url, 'blue', 'A', userLocation);
    url = concatMarker(url, 'red', 'B', voidStats?.coordinate);
    setMapUrl(url);
  }, [userLocation, voidStats?.coordinate]);

  return (
    <div
      className="absolute left-0 top-0 h-[80%] w-full bg-zinc-800 bg-cover bg-center"
      style={{ backgroundImage: `url(${mapUrl})` }}
      ref={mapRef}
    ></div>
  );
};

export default Map;
