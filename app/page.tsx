'use client';

import { getVoid } from './utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Stats, LatLon } from './types';
import Map from './map';
import { useResizeObserver } from './hooks/useResizeObserver';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const supabase = createClient();
  const router = useRouter();
  const [voidStats, setVoidStats] = useState<Stats | undefined>();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const logsRef = useRef<HTMLDivElement | null>(null);
  const [userLocation, setUserLocation] = useState<LatLon | undefined>();
  const [isAuthenticated, setIsAuthenticated] = useState(
    process.env.NODE_ENV === 'development',
  );

  useResizeObserver({ logsRef });

  const fetchUserData = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      router.push('/login');
    }
    setIsAuthenticated(true);
  }, [supabase, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated, fetchUserData]);

  const addLogs = (newLogs: string | string[]) => {
    setLogs((state) => [
      ...state,
      ...(Array.isArray(newLogs) ? newLogs : [newLogs]),
    ]);
  };

  const handleSubmit = async (radius = 1000, startLocation: LatLon) => {
    setLoading(true);
    addLogs(['getting void', `radius: ${radius}`]);
    const { stats: newVoid, message } = await getVoid(
      startLocation ?? (userLocation as LatLon),
      radius,
    );
    addLogs([
      message,
      'void acquired',
      `void latlon: ${newVoid.coordinate.lat},${newVoid.coordinate.lon}`,
      `void radius: ${newVoid.radius}`,
      `void power: ${newVoid.power}`,
    ]);
    setVoidStats(newVoid);
    setLoading(false);
  };

  const getUserLocation = () => {
    if (!('geolocation' in navigator)) {
      return Promise.reject('Geolocation is not supported');
    }

    setLoading(true);
    addLogs(['enableHighAccuracy: false', 'timeout: 5000', 'maximumAge: 0']);

    // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
    return new Promise<LatLon>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;
          addLogs([
            'device acquired',
            `device latlon: ${latitude},${longitude}`,
          ]);
          setUserLocation({ lat: latitude, lon: longitude });
          setLoading(false);
          resolve({ lat: latitude, lon: longitude });
        },
        (e: any) => {
          setLoading(false);
          reject(e);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 },
      );
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="fixed h-full w-full bg-zinc-700 text-white">
      <Map userLocation={userLocation} voidStats={voidStats} />
      <div className="absolute bottom-[20%] z-[1000] flex w-full items-center justify-between px-4 py-2">
        <div>
          {process.env.NEXT_PUBLIC_INFO_URL && (
            <a
              href={process.env.NEXT_PUBLIC_INFO_URL}
              className="form-element block bg-zinc-700"
            >
              ?
            </a>
          )}
        </div>
        {userLocation && (
          <div className="flex gap-1">
            <button
              onClick={() => {
                getUserLocation().then((startLocation) => {
                  handleSubmit(1000, startLocation);
                });
              }}
              disabled={loading}
              className="form-element bg-zinc-700"
            >
              Generate
            </button>
            <button
              onClick={() =>
                window.location.assign(
                  `https://www.google.com/maps/search/?api=1&query=${voidStats?.coordinate.lat},${voidStats?.coordinate.lon}`,
                )
              }
              disabled={loading || !voidStats?.coordinate}
              className="form-element bg-zinc-900"
            >
              gMaps↗
            </button>
          </div>
        )}
      </div>
      <div
        className="absolute bottom-0 left-0 h-[20%] w-full overflow-x-hidden overflow-y-scroll"
        ref={logsRef}
      >
        <div className="flex flex-col items-start justify-end p-1 text-xs">
          {logs.map((log, i) => (
            <div key={`log-${i}`}>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
      {!userLocation && (
        <div className="pointer-events-none absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center">
          <button
            onClick={getUserLocation}
            disabled={loading}
            className="form-element pointer-events-auto bg-zinc-700"
          >
            Start
          </button>
        </div>
      )}
    </main>
  );
};

export default HomePage;
