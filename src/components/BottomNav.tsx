import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { logoutSuccess, setAuthLoading } from '../store/slices/authSlice';
import { resetFilters } from '../store/slices/filterSlice';
import { fetchChemicalSamples } from '../store/slices/samplesSlice';
import { logoutUser } from '../services/authService';

export type NavigationTab = 'feed' | 'tile' | 'add' | 'auth';

interface BottomNavProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleAuthTabClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      const confirmed = window.confirm('Вы действительно хотите выйти из системы? При выходе сбросится фильтр.');
      if (confirmed) {
        dispatch(setAuthLoading(true));
        try {
          await logoutUser();
        } catch (err) {
          console.warn('Серверный logout:', err);
        } finally {
          dispatch(logoutSuccess());
          dispatch(resetFilters());
          dispatch(fetchChemicalSamples(undefined));
          dispatch(setAuthLoading(false));
          onSelectTab('tile');
        }
        return;
      }
    }
    onSelectTab('auth');
  };

  return (
    <nav className="bottom-nav">
      {/* 1. Лента */}
      <a
        href="#feed"
        className={`nav-item ${activeTab === 'feed' ? 'active' : ''}`}
        title="Лента"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('feed');
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </a>

      {/* 2. Добавление */}
      <a
        href="#add"
        className={`nav-item ${activeTab === 'add' ? 'active' : ''}`}
        title={isAuthenticated ? 'Добавление услуги' : 'Добавление (требуется авторизация)'}
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('add');
        }}
        style={{ cursor: 'pointer' }}
      >
        <div
          style={{
            background: activeTab === 'add' ? 'var(--primary)' : 'transparent',
            borderRadius: '15px',
            padding: '6px',
            display: 'flex',
            color: activeTab === 'add' ? '#fff' : 'var(--primary)',
            border: '1px solid var(--primary)',
            opacity: isAuthenticated ? 1 : 0.6,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </a>

      {/* 3. Плитка */}
      <a
        href="#tile"
        className={`nav-item ${activeTab === 'tile' ? 'active' : ''}`}
        title="Плитка"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('tile');
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </a>

      {/* 4. Вход / Выход */}
      <a
        href="#auth"
        className={`nav-item ${activeTab === 'auth' ? 'active' : ''}`}
        title={isAuthenticated ? 'Выход' : 'Вход'}
        onClick={handleAuthTabClick}
      >
        {isAuthenticated ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--hover-border)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        )}
      </a>
    </nav>
  );
};
