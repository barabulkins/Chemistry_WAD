import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  createChemicalSampleDraft,
  publishChemicalSample,
  fetchChemicalSamples,
} from '../store/slices/samplesSlice';

interface AddSampleViewProps {
  onSuccessNavigateToTile: () => void;
  onNavigateToAuth: () => void;
}

export const AddSampleView: React.FC<AddSampleViewProps> = ({
  onSuccessNavigateToTile,
  onNavigateToAuth,
}) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { blockingLoading, error } = useAppSelector((state) => state.samples);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gasVolume, setGasVolume] = useState<number>(45);
  const [impuritiesPercent, setImpuritiesPercent] = useState<number>(10.0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="content-area add-page">
        <h1 className="add-header">Добавление услуги</h1>
        <div className="form-section">
          <h3>Доступ ограничен</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
            Страница создания новых лабораторных услуг и химических образцов доступна только авторизованному создателю.
          </p>
          <button
            type="button"
            className="search-btn"
            style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: 'white' }}
            onClick={onNavigateToAuth}
          >
            Войти в систему
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Пожалуйста, укажите название образца');
      return;
    }
    if (!imageFile) {
      alert('Пожалуйста, выберите файл изображения');
      return;
    }
    if (!videoFile) {
      alert('Пожалуйста, выберите файл видео');
      return;
    }

    try {
      setSuccessMessage(null);
      await dispatch(
        createChemicalSampleDraft({
          title: title.trim(),
          imageFile,
          videoFile,
        })
      ).unwrap();

      await dispatch(
        publishChemicalSample({
          title: title.trim(),
          description: description.trim(),
          gas_volume: gasVolume,
          impurities_percent: impuritiesPercent,
        })
      ).unwrap();

      await dispatch(fetchChemicalSamples(undefined));
      setSuccessMessage(`Образец "${title}" успешно опубликован!`);
      setTitle('');
      setDescription('');
      setImageFile(null);
      setVideoFile(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="content-area add-page">
      <h1 className="add-header">Добавление образца</h1>

      {error && (
        <div style={{ color: 'var(--hover-border)', marginBottom: '15px', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      {successMessage && (
        <div style={{ color: '#059669', marginBottom: '15px', fontSize: '14px' }}>
          <div>✅ {successMessage}</div>
          <button
            type="button"
            className="search-btn"
            style={{ marginTop: '8px', padding: '8px 16px', background: 'var(--primary)', color: 'white' }}
            onClick={onSuccessNavigateToTile}
          >
            В каталог
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Медиа</h3>
          <div className="form-group">
            <label>Изображение (файл для MinIO S3)</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              required
              disabled={blockingLoading}
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="form-group">
            <label>Видео реакции (файл для MinIO S3)</label>
            <input
              type="file"
              className="form-control"
              accept="video/*"
              required
              disabled={blockingLoading}
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Описание и Параметры</h3>
          <div className="form-group">
            <label>Название</label>
            <input
              type="text"
              className="form-control"
              placeholder="Название минерала/образца"
              required
              value={title}
              disabled={blockingLoading}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Описание</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Описание химической реакции"
              value={description}
              disabled={blockingLoading}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Массовая доля примесей (%, в 1 кг образца)</label>
            <input
              type="number"
              step="0.1"
              className="form-control"
              value={impuritiesPercent}
              disabled={blockingLoading}
              onChange={(e) => setImpuritiesPercent(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>Выделившийся газ (мл из 1 кг)</label>
            <input
              type="number"
              className="form-control"
              value={gasVolume}
              disabled={blockingLoading}
              onChange={(e) => setGasVolume(Number(e.target.value))}
            />
          </div>
        </div>

        <button
          type="submit"
          className="search-btn"
          disabled={blockingLoading}
          style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: 'white' }}
        >
          {blockingLoading ? 'Загрузка в S3...' : 'Создать и опубликовать'}
        </button>
      </form>
    </div>
  );
};
