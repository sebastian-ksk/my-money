'use client';

import React from 'react';

type Direction = 'ltr' | 'rtl';

interface DirectionProviderProps {
  direction?: Direction;
  children: React.ReactNode;
}

const DirectionProvider = ({
  direction = 'ltr',
  children,
}: DirectionProviderProps) => {
  return <div dir={direction}>{children}</div>;
};

export default DirectionProvider;
