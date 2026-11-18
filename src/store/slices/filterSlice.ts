import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface FilterState {
  searchQuery: string;
  gasVolumeMin: number;
  sortBy: 'id' | 'title' | 'gas_volume' | 'impurities_percent' | 'likes';
  sortOrder: 'asc' | 'desc';
}

const initialState: FilterState = {
  searchQuery: '',
  gasVolumeMin: 0,
  sortBy: 'id',
  sortOrder: 'asc',
};

export const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setGasVolume: (state, action: PayloadAction<number>) => {
      state.gasVolumeMin = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (
      state,
      action: PayloadAction<'id' | 'title' | 'gas_volume' | 'impurities_percent' | 'likes'>
    ) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    resetFilters: () => {
      // Полный сброс фильтров к исходному состоянию
      return initialState;
    },
  },
});

export const {
  setGasVolume,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
