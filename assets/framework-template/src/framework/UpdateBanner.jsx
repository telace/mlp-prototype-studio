import { useEffect, useRef, useState } from 'react';

const VERSION_POLL_INTERVAL_MS = 180000;

async function readPrototypeVersion() {
  if (typeof window === 'undefined') return null;
  const url = new URL('version.json', window.location.href);
  url.searchParams.set('t', Date.now().toString());
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) return null;
  const data = await response.json();
  return typeof data.version === 'string' ? data.version : null;
}

export default function UpdateBanner() {
  const currentVersionRef = useRef(null);
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    let disposed = false;
    const checkVersion = async () => {
      try {
        const nextVersion = await readPrototypeVersion();
        if (disposed || !nextVersion) return;
        if (!currentVersionRef.current) {
          currentVersionRef.current = nextVersion;
          return;
        }
        if (currentVersionRef.current !== nextVersion) {
          setHasUpdate(true);
        }
      } catch {
        // Version checks are best-effort and should never interrupt prototype review.
      }
    };

    checkVersion();
    const timer = window.setInterval(checkVersion, VERSION_POLL_INTERVAL_MS);
    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, []);

  if (!hasUpdate) return null;

  return (
    <button className="update-banner" type="button" onClick={() => window.location.reload()}>
      原型已更新，点击刷新查看最新版本
    </button>
  );
}

