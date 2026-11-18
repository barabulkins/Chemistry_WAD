import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import {
  fetchChemicalSamples,
  fetchChemicalFeedSample,
  setSelectedSample,
} from './store/slices/samplesSlice';
import type { NavigationTab } from './components/BottomNav';
import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { TileView } from './components/TileView';
import { FeedView } from './components/FeedView';
import { AddSampleView } from './components/AddSampleView';
import { AuthView } from './components/AuthView';
import { SampleDetailView } from './components/SampleDetailView';
import { BlockingLoader } from './components/BlockingLoader';

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [currentView, setCurrentView] = useState<NavigationTab | 'details'>('tile');

  const { feedSample, selectedSample, items } = useAppSelector((state) => state.samples);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchChemicalSamples(undefined));
    dispatch(fetchChemicalFeedSample({ next: false }));
  }, [dispatch]);

  const handleOpenPassport = () => {
    if (selectedSample) {
      setCurrentView('details');
    } else if (items.length > 0) {
      dispatch(setSelectedSample(items[0]));
      setCurrentView('details');
    }
  };

  return (
    <div className="app-container">
      {/* Блокирующая анимация запросов */}
      <BlockingLoader />

      {/* Верхний заголовок из ЛР5 */}
      <TopHeader
        currentView={currentView}
        onOpenAbout={handleOpenPassport}
        onBackToGrid={() => setCurrentView('tile')}
        isAuthenticated={isAuthenticated}
        username={user?.username}
      />

      {/* Основная рабочая область */}
      {currentView === 'tile' && (
        <TileView
          onSelectSample={(sample) => {
            dispatch(setSelectedSample(sample));
            setCurrentView('details');
          }}
        />
      )}

      {currentView === 'feed' && (
        <FeedView
          sample={feedSample}
          onNextSample={() => dispatch(fetchChemicalFeedSample({ id: feedSample?.id, next: true }))}
        />
      )}

      {currentView === 'add' && (
        <AddSampleView
          onSuccessNavigateToTile={() => setCurrentView('tile')}
          onNavigateToAuth={() => setCurrentView('auth')}
        />
      )}

      {currentView === 'auth' && (
        <AuthView onSuccessNavigateToTile={() => setCurrentView('tile')} />
      )}

      {currentView === 'details' && (selectedSample || items[0]) && (
        <SampleDetailView
          sample={selectedSample || items[0]}
          onWatchInFeed={(id) => {
            dispatch(fetchChemicalFeedSample({ id, next: false }));
            setCurrentView('feed');
          }}
        />
      )}

      {/* Нижняя навигационная панель */}
      <BottomNav
        activeTab={currentView === 'details' ? 'tile' : currentView}
        onSelectTab={(tab) => setCurrentView(tab)}
      />
    </div>
  );
};

export default App;
