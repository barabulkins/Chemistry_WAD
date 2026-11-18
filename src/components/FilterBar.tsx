import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setGasVolume, resetFilters } from '../store/slices/filterSlice';
import { fetchChemicalSamples } from '../store/slices/samplesSlice';

export const FilterBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);
  const isMockFallback = useAppSelector((state) => state.samples.isMockFallback);

  const handleApplyServerFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    dispatch(fetchChemicalSamples(filters.gasVolumeMin));
  };

  const handleReset = () => {
    dispatch(resetFilters());
    dispatch(fetchChemicalSamples(undefined));
  };

  return (
    <form
      className="search-bar"
      style={{ flexDirection: 'column' }}
      onSubmit={handleApplyServerFilter}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label id="gas_volume_label" htmlFor="gas_volume" style={{ fontSize: '14px', fontWeight: 600 }}>
          Объем газа (мл из 1 кг), текущий: {filters.gasVolumeMin ? `${filters.gasVolumeMin} мл` : 'не задан'}
        </label>
        {isMockFallback && (
          <span style={{ fontSize: '11px', color: 'var(--hover-border)', fontWeight: 600 }}>
            Mock-режим
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
        <input
          type="range"
          name="gas_volume"
          id="gas_volume"
          className="form-control"
          style={{ flex: 1 }}
          value={filters.gasVolumeMin ?? 0}
          min="0"
          max="100"
          step="1"
          onChange={(e) => dispatch(setGasVolume(Number(e.target.value)))}
        />
        <button type="submit" className="search-btn">
          Найти
        </button>
        <button
          type="button"
          className="search-btn"
          onClick={handleReset}
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
          title="Сбросить фильтры"
        >
          Сброс
        </button>
      </div>
    </form>
  );
};
