'use client';

import { useEffect, useState } from 'react';

export type LiveChatProvider = 'intercom' | 'crisp' | 'none';

export interface LiveChatConfig {
  provider: LiveChatProvider;
  intercomAppId?: string;
  crispWebsiteId?: string;
}

export function LiveChatWidget() {
  const [config, setConfig] = useState<LiveChatConfig>({ provider: 'none' });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/settings/public');
        if (res.ok) {
          const data = await res.json();
          setConfig(data.liveChat ?? { provider: 'none' });
        }
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    }
    fetchConfig();
  }, []);

  useEffect(() => {
    if (!loaded || config.provider === 'none') return;

    if (config.provider === 'intercom' && config.intercomAppId) {
      loadIntercom(config.intercomAppId);
    } else if (config.provider === 'crisp' && config.crispWebsiteId) {
      loadCrisp(config.crispWebsiteId);
    }
  }, [config, loaded]);

  return null;
}

function loadIntercom(appId: string) {
  if (typeof window === 'undefined') return;
  if ((window as any).Intercom) return;

  const script = document.createElement('script');
  script.src = `https://widget.intercom.io/widget/${appId}`;
  script.async = true;
  document.head.appendChild(script);

  (window as any).intercomSettings = { app_id: appId };
}

function loadCrisp(websiteId: string) {
  if (typeof window === 'undefined') return;
  if ((window as any).$crisp) return;

  (window as any).CRISP_WEBSITE_ID = websiteId;
  const script = document.createElement('script');
  script.src = 'https://client.crisp.chat/l.js';
  script.async = true;
  document.head.appendChild(script);
}

export function useLiveChat() {
  const [config, setConfig] = useState<LiveChatConfig>({ provider: 'none' });

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/settings/public');
        if (res.ok) {
          const data = await res.json();
          setConfig(data.liveChat ?? { provider: 'none' });
        }
      } catch {
        // ignore
      }
    }
    fetchConfig();
  }, []);

  const open = () => {
    if (config.provider === 'intercom' && (window as any).Intercom) {
      (window as any).Intercom('show');
    } else if (config.provider === 'crisp' && (window as any).$crisp) {
      (window as any).$crisp.push(['do', 'chat:open']);
    }
  };

  const identify = (userId: string, email?: string, name?: string) => {
    if (config.provider === 'intercom' && (window as any).Intercom) {
      (window as any).Intercom('boot', { app_id: config.intercomAppId, user_id: userId, email, name });
    } else if (config.provider === 'crisp' && (window as any).$crisp) {
      (window as any).$crisp.push(['set', 'user:nickname', [name ?? userId]]);
      if (email) (window as any).$crisp.push(['set', 'user:email', [email]]);
    }
  };

  return { config, open, identify };
}