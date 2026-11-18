import React from 'react';

interface BottomNavProps {
  activeTab: 'feed' | 'tile';
  onSelectTab: (tab: 'feed' | 'tile') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
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
      <span
        className="nav-item"
        title="Добавление (недоступно для роли Гость)"
        style={{ cursor: 'not-allowed', opacity: 0.5 }}
      >
        <div style={{ background: 'transparent', borderRadius: '15px', padding: '6px', display: 'flex', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </span>

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

      {/* 4. Вход */}
      <span
        className="nav-item"
        title="Вход (недоступно для роли Гость)"
        style={{ cursor: 'not-allowed', opacity: 0.5 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
      </span>
    </nav>
  );
};
