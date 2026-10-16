import { useEffect, useRef } from 'react';

type RemoteEvent = { eventType: string; eventKeyAction?: number };

// In a browser there is no remote: the keyboard stands in for it.
const KEYS: Record<string, string> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  Enter: 'select',
  ' ': 'select',
  Escape: 'back',
};

// Same contract as useTVEventHandler: key down only (eventKeyAction 0).
export function useRemoteEvents(handler: (event: RemoteEvent) => void) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const eventType = KEYS[event.key];
      if (eventType && !event.repeat) handlerRef.current({ eventType, eventKeyAction: 0 });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
