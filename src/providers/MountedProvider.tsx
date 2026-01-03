'use client';

import React, { useEffect, useState } from 'react';

interface MountedProviderProps {
  children: React.ReactNode;
}

const MountedProvider: React.FC<MountedProviderProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 100);
  }, []);

  if (!mounted) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-neutral-light'>
        <p style={{ color: '#666' }}>Cargando...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default MountedProvider;
