import React from 'react';
import type { Sample } from '../types/sample';
import { resolveImageUrl } from '../utils/mediaUrl';
import { DEFAULT_IMAGE } from '../constants/assets';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleChemicalSampleLike, deleteChemicalSample } from '../store/slices/samplesSlice';

interface SampleCardProps {
  sample: Sample;
  onSelectSample: (sample: Sample) => void;
}

export const SampleCard: React.FC<SampleCardProps> = ({ sample, onSelectSample }) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const imageSrc = resolveImageUrl(sample.image_url) || DEFAULT_IMAGE;

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Для выставления отметки "Нравится" необходимо войти в систему!');
      return;
    }
    const nextVal = sample.is_liked === 1 ? 0 : 1;
    dispatch(toggleChemicalSampleLike({ id: sample.id, value: nextVal }));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    const confirmed = window.confirm(`Удалить образец "${sample.title}"?`);
    if (confirmed) {
      dispatch(deleteChemicalSample(sample.id));
    }
  };

  const canDelete = sample.is_creator === 1;

  return (
    <a
      href={`#feed-${sample.id}`}
      className="card"
      onClick={(e) => {
        e.preventDefault();
        onSelectSample(sample);
      }}
    >
      <div className="card-img-container">
        <img
          src={imageSrc}
          alt={sample.title}
          className="card-img"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_IMAGE;
          }}
        />
        {sample.isDraft && (
          <div className="draft-badge">Черновик</div>
        )}
      </div>
      <div className="card-info">
        <h3 className="card-title">{sample.title}</h3>
        <div className="card-likes" style={{ justifyContent: 'space-between' }}>
          <span
            onClick={handleLike}
            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            title={sample.is_liked === 1 ? 'Снять лайк' : 'Поставить лайк'}
          >
            <span>{sample.is_liked === 1 ? '❤️' : '🤍'}</span> {sample.likes}
          </span>

          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--hover-border)',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '0 4px',
              }}
              title="Удалить услугу (Soft delete)"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </a>
  );
};
