import React, { ReactNode } from 'react';
import { SiteHeader, SiteFooter } from '.';

interface SiteContentContainerProps {
  children: ReactNode | null;
}

function SiteContentContainer({ children }: SiteContentContainerProps) {
  return (
    <div className="site-full-window">
      <SiteHeader />
      <div className="site-content-parent">{children}</div>
      <SiteFooter />
    </div>
  );
}

export default SiteContentContainer;
