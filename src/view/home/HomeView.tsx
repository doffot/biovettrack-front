// src/views/home/HomeView.tsx
import React from 'react';
import { useMedia } from '../../hooks/useMedia';
import DesktopHomeView from './DesktopHomeView';
import MainMenu from '../../components/MainMenu';

const HomeView: React.FC = () => {
  const isDesktop = useMedia('(min-width: 1024px)');

  if (isDesktop) {
    return <DesktopHomeView />;
  }

  return <MainMenu />;
};

export default HomeView;