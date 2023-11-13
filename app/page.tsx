"use client";

import { getVoid } from "./utils";
import { useEffect, useState } from "react";
import { Stats, LatLon } from "./types";
import Map from "./components/map";

declare global {
  interface Window {
    DeviceOrientationEvent: {
      prototype: DeviceOrientationEvent;
      new (
        type: string,
        eventInitDict?: DeviceOrientationEventInit
      ): DeviceOrientationEvent;
      requestPermission?: () => Promise<string>;
    };
  }
}

const Home = () => {
  const [userLocation, setUserLocation] = useState<LatLon | undefined>();
  const [voidStats, setVoidStats] = useState<Stats | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setLoading(true);
      // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
      navigator.geolocation.watchPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;
          setUserLocation({ lat: latitude, lon: longitude });
          console.log(coords);
          setLoading(false);
        },
        (e: any) => console.error(e),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  const handleSubmit = async (radius = 1000) => {
    setLoading(true);
    const newVoid = await getVoid(userLocation as LatLon, radius);
    setVoidStats(newVoid);
    setLoading(false);
  };

  const buttonStyle =
    "py-1 px-2 border border-white rounded-md bg-black pointer-events-auto";

  return (
    <main className="w-full h-full fixed">
      <Map userLocation={userLocation} voidStats={voidStats} />
      <div className="flex gap-1 absolute top-0 w-full z-[1000] justify-center py-2 pointer-events-none">
        <button
          onClick={() => handleSubmit(1000)}
          disabled={loading || !userLocation}
          className={buttonStyle}
        >
          ⦰1000m
        </button>
        <button
          onClick={() => handleSubmit(2000)}
          disabled={loading || !userLocation}
          className={buttonStyle}
        >
          ⦰2000m
        </button>
        <button
          onClick={() =>
            window.location.assign(
              `https://www.google.com/maps/search/?api=1&query=${voidStats?.coordinate.lat},${voidStats?.coordinate.lon}`
            )
          }
          disabled={loading || !voidStats?.coordinate}
          className={buttonStyle}
        >
          Open
        </button>
      </div>
    </main>
  );
};

export default Home;
