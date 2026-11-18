import React from 'react';
import { useAppSelector } from '../store';

export const BlockingLoader: React.FC = () => {
  const blockingLoading = useAppSelector((state) => state.samples.blockingLoading);
  const authLoading = useAppSelector((state) => state.auth.isLoading);

  const isVisible = blockingLoading || authLoading;

  if (!isVisible) return null;

  return (
    <div
      className="blocking-loader-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'all',
        cursor: 'wait',
      }}
    >
      <div
        className="blocking-loader-card"
        style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          border: '1px solid #38bdf8',
          borderRadius: '16px',
          padding: '28px 36px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          maxWidth: '360px',
          textAlign: 'center',
        }}
      >
        <div
          className="spinner-border text-info"
          role="status"
          style={{ width: '3.5rem', height: '3.5rem', borderWidth: '4px' }}
        >
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <div style={{ color: '#f8fafc', fontSize: '18px', fontWeight: 600 }}>
          Синхронизация данных...
        </div>
        <div style={{ color: '#94a3b8', fontSize: '13px' }}>
          Интерфейс заблокирован на время выполнения запроса Redux Thunk / Axios
        </div>
      </div>
    </div>
  );
};
