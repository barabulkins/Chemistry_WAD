import React from 'react';
import type { Sample } from '../types/sample';
import { FilterBar } from './FilterBar';
import { SampleCard } from './SampleCard';
import { useAppSelector } from '../store';

interface TileViewProps {
  onSelectSample: (sample: Sample) => void;
}

export const TileView: React.FC<TileViewProps> = ({ onSelectSample }) => {
  const samples = useAppSelector((state) => state.samples.items);

  return (
    <div className="content-area grid-page">
      <FilterBar />

      <div className="cards-grid">
        {samples.length > 0 ? (
          samples.map((sample) => (
            <SampleCard
              key={sample.id}
              sample={sample}
              onSelectSample={onSelectSample}
            />
          ))
        ) : (
          <p>Ничего не найдено</p>
        )}
      </div>
    </div>
  );
};
