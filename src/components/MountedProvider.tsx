'use client';

import React, { useEffect, useState } from 'react';

interface MountedProviderProps {
  children: React.ReactNode;
}

const MountedProvider: React.FC<MountedProviderProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className='min-h-screen flex items-center justify-center'
        style={{ backgroundColor: '#F2F2F2' }}
      >
        <p style={{ color: '#666' }}>Cargando...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default MountedProvider;
