"use client";

import { getVoid } from "./utils";
import { useEffect, useRef, useState } from "react";
import { Stats, LatLon } from "./types";
import Map from "./components/map";

const Home = () => {
  const [userLocation, setUserLocation] = useState<LatLon | undefined>();
  const [voidStats, setVoidStats] = useState<Stats | undefined>();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const logsRef = useRef<HTMLDivElement | null>(null);

  const addLogs = (newLogs: string | string[]) => {
    setLogs((state) => [
      ...state,
      ...(Array.isArray(newLogs) ? newLogs : [newLogs]),
    ]);
  };

  useEffect(() => {
    if (!logsRef.current?.firstElementChild) return;
    const resizeObserver = new ResizeObserver(() => {
      logsRef.current?.firstElementChild?.lastElementChild?.scrollIntoView({
        behavior: "instant",
      });
    });
    resizeObserver.observe(logsRef.current.firstElementChild);
    return () => resizeObserver.disconnect(); // clean up
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setLoading(true);
      addLogs(["enableHighAccuracy: false", "timeout: 5000", "maximumAge: 0"]);

      // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;
          addLogs([
            "device acquired",
            `device latlon: ${latitude},${longitude}`,
          ]);
          setUserLocation({ lat: latitude, lon: longitude });
          setLoading(false);
        },
        (e: any) => console.error(e),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  const handleSubmit = async (radius = 1000) => {
    setLoading(true);
    addLogs(["getting void", `radius: ${radius}`]);
    const { stats: newVoid, message } = await getVoid(
      userLocation as LatLon,
      radius
    );
    addLogs([
      message,
      "void acquired",
      `void latlon: ${newVoid.coordinate.lat},${newVoid.coordinate.lon}`,
      `void radius: ${newVoid.radius}`,
      `void power: ${newVoid.power}`,
    ]);
    setVoidStats(newVoid);
    setLoading(false);
  };

  const buttonStyle =
    "py-1 px-2 border border-zinc-400 rounded-md disabled:bg-zinc-500 disabled:border-0 disabled:text-zinc-400";

  return (
    <main className="w-full h-full fixed text-white bg-zinc-700">
      <Map
        userLocation={userLocation}
        voidStats={voidStats}
        addLogs={addLogs}
      />
      <div className="flex absolute bottom-[20%] w-full z-[1000] justify-between items-center py-2 px-4">
        <div>
          {process.env.NEXT_PUBLIC_INFO_URL && (
            <a
              href={process.env.NEXT_PUBLIC_INFO_URL}
              className={buttonStyle + " bg-zinc-700 block"}
            >
              ?
            </a>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handleSubmit(1000)}
            disabled={loading || !userLocation}
            className={buttonStyle + " bg-zinc-700"}
          >
            ⦰1000m
          </button>
          <button
            onClick={() => handleSubmit(2000)}
            disabled={loading || !userLocation}
            className={buttonStyle + " bg-zinc-700"}
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
            className={buttonStyle + " bg-zinc-900"}
          >
            gMaps↗
          </button>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 w-full h-[20%] overflow-x-hidden overflow-y-scroll"
        ref={logsRef}
      >
        <div className="flex flex-col justify-end items-start p-1 text-xs">
          {logs.map((log, i) => (
            <div key={`log-${i}`}>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Home;
