'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function AppTopbar() {
  return (
    <div className="flex-shrink-0 flex items-center justify-end px-6 py-4 border-b-2 border-black bg-white">
      <ConnectButton showBalance={false} />
    </div>
  );
}
