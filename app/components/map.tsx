// src/components/Map.tsx

import { useEffect, useRef, useState } from "react";
import { LatLon, Stats } from "../types";

const concatMarker = (url: string, color = "blue", latlon?: LatLon) =>
  latlon ? `${url}&markers=color:${color}%7C${latlon.lat},${latlon.lon}` : url;
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
  addLogs,
}: {
  userLocation?: LatLon;
  voidStats?: Stats;
  addLogs: (log: string | string[]) => void;
}) => {
  const [mapUrl, setMapUrl] = useState("");
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mapRef.current === null || !userLocation) {
      return;
    }
    const convertedSizes = convertSizes(
      mapRef.current.offsetWidth,
      mapRef.current.offsetHeight
    );
    const size = `${convertedSizes[0]}x${convertedSizes[1]}`;
    let url = `https://maps.googleapis.com/maps/api/staticmap?&maptype=satellite&key=${process.env.NEXT_PUBLIC_GMAPS_API_KEY}&size=${size}&scale=2`;
    url = concatMarker(url, "blue", userLocation);
    url = concatMarker(url, "red", voidStats?.coordinate);
    setMapUrl(url);
  }, [userLocation, voidStats?.coordinate]);

  return (
    <div
      className="absolute top-0 left-0 w-full h-[80%] bg-center bg-cover bg-zinc-700"
      style={{ backgroundImage: `url(${mapUrl})` }}
      ref={mapRef}
    ></div>
  );
};

export default Map;
