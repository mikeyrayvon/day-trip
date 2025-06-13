'use client';

import { getVoid, getAttractor } from './utils';
import { useRef, useState } from 'react';
import { Stats, LatLon } from './types';
import Map from './map';
import { useResizeObserver } from './hooks/useResizeObserver';
// import { useRouter } from 'next/navigation';

const HomePage = () => {
  // const router = useRouter();
  const [voidStats, setVoidStats] = useState<Stats | undefined>();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(1000);
  const logsRef = useRef<HTMLDivElement | null>(null);
  const [userLocation, setUserLocation] = useState<LatLon | undefined>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    process.env.NODE_ENV === 'development',
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useResizeObserver({ logsRef });

  /*const fetchUserData = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
  }, [supabase, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated, fetchUserData]);*/

  const addLogs = (newLogs: string | string[]) => {
    setLogs((state) => [
      ...state,
      ...(Array.isArray(newLogs) ? newLogs : [newLogs]),
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (pattern: 'void' | 'attractor') => {
    setLoading(true);
    addLogs([`getting ${pattern}`, `radius: ${radius} meters`]);
    const startLocation = await getUserLocation();
    const { stats: newVoid, message } =
      pattern === 'void'
        ? await getVoid(startLocation, radius)
        : await getAttractor(startLocation, radius);
    addLogs([
      message,
      `${pattern} acquired`,
      `${pattern} latlon: ${newVoid.coordinate.lat},${newVoid.coordinate.lon}`,
      `average radius: ${newVoid.radius}`,
      `${pattern} power: ${newVoid.power}`,
      `--------------------------------`,
    ]);
    setVoidStats(newVoid);
    setUserLocation(startLocation);
    setLoading(false);
  };

  const getUserLocation = () => {
    if (!('geolocation' in navigator)) {
      return Promise.reject('Geolocation is not supported');
    }

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
          resolve({ lat: latitude, lon: longitude });
        },
        (e: any) => {
          reject(e);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 },
      );
    });
  };

  const initUserLocation = () => {
    getUserLocation().then((location) => {
      setUserLocation(location);
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
            <select
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="form-element bg-zinc-700"
            >
              <option value="500">0.5km</option>
              <option value="1000">1km</option>
              <option value="2000">2km</option>
              <option value="3000">3km</option>
            </select>
            <button
              onClick={() => {
                handleSubmit('void');
              }}
              disabled={loading}
              className="form-element bg-zinc-700"
            >
              Void
            </button>
            <button
              onClick={() => {
                handleSubmit('attractor');
              }}
              disabled={loading}
              className="form-element bg-zinc-700"
            >
              Attractor
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
        <div ref={messagesEndRef} />
      </div>
      {!userLocation && (
        <div className="pointer-events-none absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center">
          <button
            onClick={initUserLocation}
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
