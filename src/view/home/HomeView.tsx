// src/views/home/HomeView.tsx
import React from 'react';
import { useMedia } from '../../hooks/useMedia';
import MainMenu from '../../components/MainMenu';
import DashboardView from './DashboardView';

const HomeView: React.FC = () => {
  const isDesktop = useMedia('(min-width: 1024px)');

  if (isDesktop) {
    return <DashboardView />;
  }

  return <MainMenu />;
};

export default HomeView;