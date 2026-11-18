import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  loginSuccess,
  logoutSuccess,
  setAuthLoading,
  setAuthError,
  clearAuthError,
} from '../store/slices/authSlice';
import { resetFilters } from '../store/slices/filterSlice';
import { fetchChemicalSamples } from '../store/slices/samplesSlice';
import { loginUser, logoutUser, registerUser } from '../services/authService';

interface AuthViewProps {
  onSuccessNavigateToTile: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccessNavigateToTile }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading, error } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('chemist@lab.ru');
  const [password, setPassword] = useState('secretPass123');
  const [username, setUsername] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    dispatch(setAuthLoading(true));

    try {
      const data = await loginUser({ email, password });
      dispatch(loginSuccess(data.user));
      dispatch(fetchChemicalSamples(undefined));
      onSuccessNavigateToTile();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Неверный логин или пароль';
      dispatch(setAuthError(msg));
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    dispatch(setAuthLoading(true));

    try {
      const newUser = await registerUser({ username, email, password });
      dispatch(loginSuccess(newUser));
      dispatch(fetchChemicalSamples(undefined));
      onSuccessNavigateToTile();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Ошибка регистрации';
      dispatch(setAuthError(msg));
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  const handleLogout = async () => {
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
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="content-area add-page">
        <h1 className="add-header">Профиль</h1>

        <div className="form-section">
          <h3>Текущий пользователь</h3>
          <div className="form-group">
            <label>Имя пользователя</label>
            <input type="text" className="form-control" readOnly value={user.username} />
          </div>
          <div className="form-group">
            <label>Электронная почта</label>
            <input type="email" className="form-control" readOnly value={user.email} />
          </div>
          <div className="form-group">
            <label>Роль</label>
            <input type="text" className="form-control" readOnly value="Создатель (автор услуг)" />
          </div>
        </div>

        <button
          type="button"
          className="search-btn"
          onClick={handleLogout}
          disabled={isLoading}
          style={{ width: '100%', padding: '12px', background: 'var(--hover-border)', color: 'white', border: 'none' }}
        >
          {isLoading ? 'Выход...' : 'Выйти из системы (Выход)'}
        </button>
      </div>
    );
  }

  return (
    <div className="content-area add-page">
      <h1 className="add-header">Авторизация</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
        <button
          type="button"
          className="search-btn"
          onClick={() => setActiveTab('login')}
          style={{
            flex: 1,
            background: activeTab === 'login' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'login' ? 'white' : 'var(--primary)',
          }}
        >
          Вход
        </button>
        <button
          type="button"
          className="search-btn"
          onClick={() => setActiveTab('register')}
          style={{
            flex: 1,
            background: activeTab === 'register' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'register' ? 'white' : 'var(--primary)',
          }}
        >
          Регистрация
        </button>
      </div>

      {error && (
        <div style={{ color: 'var(--hover-border)', marginBottom: '15px', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      {activeTab === 'login' ? (
        <form onSubmit={handleLogin}>
          <div className="form-section">
            <h3>Вход в систему</h3>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="chemist@lab.ru"
              />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <div style={{ marginTop: '5px' }}>
              <span
                style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => {
                  setEmail('chemist@lab.ru');
                  setPassword('secretPass123');
                }}
              >
                Подставить тестового создателя (chemist@lab.ru)
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="search-btn"
            disabled={isLoading}
            style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: 'white' }}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <div className="form-section">
            <h3>Регистрация создателя</h3>
            <div className="form-group">
              <label>Имя</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Ваше имя"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@lab.ru"
              />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="search-btn"
            disabled={isLoading}
            style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: 'white' }}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
      )}
    </div>
  );
};
