import type { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="phu-app">
      <AppHeader />
      <main className="phu-main">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
