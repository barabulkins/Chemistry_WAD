import React from 'react';
import type { Sample } from '../types/sample';
import { resolveImageUrl } from '../utils/mediaUrl';
import { DEFAULT_IMAGE } from '../constants/assets';

interface SampleDetailViewProps {
  sample: Sample;
  onWatchInFeed: (sampleId: number) => void;
}

export const SampleDetailView: React.FC<SampleDetailViewProps> = ({ sample, onWatchInFeed }) => {
  const imageSrc = resolveImageUrl(sample.image_url) || DEFAULT_IMAGE;

  return (
    <div className="content-area add-page">
      <h1 className="add-header" style={{ cursor: 'pointer' }} onClick={() => onWatchInFeed(sample.id)}>
        {sample.title}
      </h1>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-section">
          <h3>Медиа</h3>
          <div className="form-group">
            <label>Изображение (файл)</label>
            <div style={{ width: '100%', height: '150px', background: '#eee', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <img src={imageSrc} alt={sample.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Описание и Параметры</h3>
          <div className="form-group">
            <label>Название</label>
            <input type="text" className="form-control" readOnly value={sample.title} />
          </div>
          <div className="form-group">
            <label>Описание</label>
            <textarea className="form-control" rows={3} readOnly value={sample.description || ''} />
          </div>
          <div className="form-group">
            <label>Массовая доля примесей (%, в 1 кг образца)</label>
            <input type="number" step="0.1" className="form-control" readOnly value={sample.impurities_percent ?? 0} />
          </div>
          <div className="form-group">
            <label>Выделившийся газ (мл из 1 кг)</label>
            <input type="number" className="form-control" readOnly value={sample.gas_volume ?? 0} />
          </div>
        </div>

        <button
          type="button"
          className="search-btn"
          style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: 'white' }}
          onClick={() => onWatchInFeed(sample.id)}
        >
          Смотреть в ленте
        </button>
      </form>
    </div>
  );
};
