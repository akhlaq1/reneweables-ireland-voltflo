'use client';

import { getGTMNoscriptUrl } from '@/lib/gtm';

export default function GTMNoscript() {
  return (
    <noscript>
      <iframe
        src={getGTMNoscriptUrl()}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}