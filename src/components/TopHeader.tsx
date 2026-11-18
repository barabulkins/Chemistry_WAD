import React from 'react';
import { InfoCircle } from 'react-bootstrap-icons';

interface TopHeaderProps {
  currentView: 'feed' | 'tile' | 'details' | 'add' | 'auth';
  onOpenAbout: () => void;
  onBackToGrid: () => void;
  isAuthenticated: boolean;
  username?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentView,
  onOpenAbout,
  onBackToGrid,
  isAuthenticated,
  username,
}) => {
  return (
    <header
      className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom"
      style={{
        backgroundColor: 'var(--nav-bg)',
        borderColor: 'var(--border-color)',
        minHeight: '48px',
        zIndex: 10,
      }}
    >
      <div className="d-flex align-items-center">
        <span className="fw-bold" style={{ fontSize: '13px', color: 'var(--text-dark)' }}>
          Определение массовой доли примесей
        </span>
      </div>
      <div className="d-flex align-items-center gap-2">
        {isAuthenticated ? (
          <span
            style={{
              backgroundColor: '#2e7d32',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 500,
              padding: '3px 8px',
              borderRadius: 'var(--radius-global)',
              display: 'inline-block',
            }}
          >
            {username || 'Лаборант'}
          </span>
        ) : (
          <span
            style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 500,
              padding: '3px 8px',
              borderRadius: 'var(--radius-global)',
              display: 'inline-block',
            }}
          >
            Гость
          </span>
        )}

        {currentView === 'details' || currentView === 'add' || currentView === 'auth' ? (
          <button
            type="button"
            className="header-btn"
            onClick={onBackToGrid}
          >
            Назад
          </button>
        ) : (
          <button
            type="button"
            className="header-btn"
            onClick={onOpenAbout}
            title="Паспорт образца"
          >
            <InfoCircle size={13} />
            Паспорт
          </button>
        )}
      </div>
    </header>
  );
};
