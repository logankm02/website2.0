import React from 'react';
import { useMediaQuery } from 'react-responsive';
import HomeIntroDesktop from './HomeIntroDesktop';
import HomeIntroMobile from './HomeIntroMobile';

export default function HomeV3() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  return isMobile ? <HomeIntroMobile /> : <HomeIntroDesktop />;
}
