import React from 'react';
import { BasisProvider, LoadingScreen } from '@basis-forum/ui';

export default function Loading() {
  return (
    <BasisProvider>
      <LoadingScreen label="Loading discussions and study tools…" />
    </BasisProvider>
  );
}
