import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Sample } from '../../types/sample';
import { MOCK_SAMPLES } from '../../mock/mockSamples';
import { ApiSamplesService } from '../../generated/services/ApiSamplesService';
import type { PublishSampleDto } from '../../generated/models/PublishSampleDto';
import type { SampleResponseDto } from '../../generated/models/SampleResponseDto';
import { OpenAPI } from '../../generated/core/OpenAPI';

// Включаем передачу cookies во всех запросах сгенерированного клиента OpenAPI/Axios
OpenAPI.WITH_CREDENTIALS = true;

export interface SamplesState {
  items: Sample[];
  feedSample: Sample | null;
  selectedSample: Sample | null;
  activeDraft: Sample | null;
  isLoading: boolean;
  blockingLoading: boolean; // Блокирующая анимация запросов
  error: string | null;
  isMockFallback: boolean;  // Признак работы в режиме fallback-mock (бэкенд не запущен)
}

const initialState: SamplesState = {
  items: [],
  feedSample: null,
  selectedSample: null,
  activeDraft: null,
  isLoading: false,
  blockingLoading: false,
  error: null,
  isMockFallback: false,
};

// ─── THUNKS: Асинхронные действия с использованием кодогенерации и axios ─────────
// Названы строго по теме предметной области: Chemical Samples (химические образцы)

/**
 * 1. Загрузка каталога опубликованных химических образцов
 * Использует сгенерированный метод ApiSamplesService.apiSamplesControllerGetAll
 * При недоступности бэкенда плавно переключается на коллекцию mock-объектов.
 */
export const fetchChemicalSamples = createAsyncThunk(
  'samples/fetchChemicalSamples',
  async (gasVolume: number | undefined) => {
    try {
      const volParam = gasVolume && gasVolume > 0 ? gasVolume : undefined;
      const data = await ApiSamplesService.apiSamplesControllerGetAll(volParam);
      return {
        items: data.map((item) => ({
          ...item,
          isDraft: item.status === 'draft',
        })) as Sample[],
        isMock: false,
      };
    } catch (err) {
      console.warn('Сервер недоступен. Переключение на локальные mock-данные (гостевой режим):', err);
      let mock = MOCK_SAMPLES.filter((s) => s.status !== 'deleted');
      if (gasVolume && gasVolume > 0) {
        mock = mock.filter((s) => s.gas_volume === gasVolume);
      }
      return {
        items: mock,
        isMock: true,
      };
    }
  }
);

/**
 * 2. Получение текущего/следующего образца для медиа-ленты
 */
export const fetchChemicalFeedSample = createAsyncThunk(
  'samples/fetchChemicalFeedSample',
  async (params?: { id?: number; next?: boolean }) => {
    try {
      const res = await axios.get<SampleResponseDto>('/api/samples/feed', {
        params: {
          id: params?.id,
          next: params?.next ? 'true' : undefined,
        },
        withCredentials: true,
      });
      return { sample: res.data as Sample, isMock: false };
    } catch (err) {
      console.warn('Сервис ленты недоступен. Переключение на локальный mock-поток:', err);
      const published = MOCK_SAMPLES.filter((s) => s.status !== 'deleted');
      let idx = 0;
      if (params?.id !== undefined) {
        const found = published.findIndex((s) => s.id === params.id);
        if (found !== -1) idx = found;
      }
      if (params?.next) {
        idx = (idx + 1) % published.length;
      }
      return { sample: (published[idx] || null) as Sample | null, isMock: true };
    }
  }
);

/**
 * 3. Детальный просмотр опубликованного образца по ID
 */
export const fetchChemicalSampleById = createAsyncThunk(
  'samples/fetchChemicalSampleById',
  async (id: number) => {
    try {
      const data = await ApiSamplesService.apiSamplesControllerGetOne(id);
      return data as Sample;
    } catch (err) {
      const found = MOCK_SAMPLES.find((s) => s.id === id);
      return (found || null) as Sample | null;
    }
  }
);

/**
 * 4. Создание нового черновика услуги с автозаполнением создателя и выгрузкой в MinIO S3
 */
export const createChemicalSampleDraft = createAsyncThunk(
  'samples/createChemicalSampleDraft',
  async (
    payload: { title: string; imageFile: File; videoFile: File },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('title', payload.title);
      formData.append('image', payload.imageFile);
      formData.append('video', payload.videoFile);

      const res = await axios.post<SampleResponseDto>('/api/samples', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      return res.data as Sample;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Ошибка создания черновика услуги'
      );
    }
  }
);

/**
 * 5. Публикация черновика создателя
 */
export const publishChemicalSample = createAsyncThunk(
  'samples/publishChemicalSample',
  async (payload: PublishSampleDto, { rejectWithValue }) => {
    try {
      const res = await ApiSamplesService.apiSamplesControllerPublish(payload);
      return res as Sample;
    } catch (err: any) {
      return rejectWithValue(
        err.body?.message || err.message || 'Ошибка публикации образца'
      );
    }
  }
);

/**
 * 6. Логическое удаление услуги создателя
 */
export const deleteChemicalSample = createAsyncThunk(
  'samples/deleteChemicalSample',
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await ApiSamplesService.apiSamplesControllerRemove(id);
      return { id, message: res.message };
    } catch (err: any) {
      return rejectWithValue(
        err.body?.message || err.message || 'Ошибка при удалении образца'
      );
    }
  }
);

/**
 * 7. Выставление / снятие отметки "Нравится" для авторизованного пользователя
 */
export const toggleChemicalSampleLike = createAsyncThunk(
  'samples/toggleChemicalSampleLike',
  async ({ id, value }: { id: number; value: number }, { rejectWithValue }) => {
    try {
      const res = await ApiSamplesService.apiSamplesControllerLike(id, { value });
      return {
        id,
        value,
        liked: res.liked,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.body?.message || err.message || 'Ошибка при изменении отметки лайка'
      );
    }
  }
);

export const samplesSlice = createSlice({
  name: 'samples',
  initialState,
  reducers: {
    setSelectedSample: (state, action: PayloadAction<Sample | null>) => {
      state.selectedSample = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ─── fetchChemicalSamples ───
    builder.addCase(fetchChemicalSamples.pending, (state) => {
      state.isLoading = true;
      state.blockingLoading = true;
      state.error = null;
    });
    builder.addCase(fetchChemicalSamples.fulfilled, (state, action) => {
      state.isLoading = false;
      state.blockingLoading = false;
      state.items = action.payload.items;
      state.isMockFallback = action.payload.isMock;
    });
    builder.addCase(fetchChemicalSamples.rejected, (state, action) => {
      state.isLoading = false;
      state.blockingLoading = false;
      state.error = action.error.message || 'Ошибка загрузки каталога';
    });

    // ─── fetchChemicalFeedSample ───
    builder.addCase(fetchChemicalFeedSample.pending, (state) => {
      state.blockingLoading = true;
    });
    builder.addCase(fetchChemicalFeedSample.fulfilled, (state, action) => {
      state.blockingLoading = false;
      state.feedSample = action.payload.sample;
      state.isMockFallback = action.payload.isMock;
    });
    builder.addCase(fetchChemicalFeedSample.rejected, (state) => {
      state.blockingLoading = false;
    });

    // ─── fetchChemicalSampleById ───
    builder.addCase(fetchChemicalSampleById.pending, (state) => {
      state.blockingLoading = true;
    });
    builder.addCase(fetchChemicalSampleById.fulfilled, (state, action) => {
      state.blockingLoading = false;
      state.selectedSample = action.payload;
    });
    builder.addCase(fetchChemicalSampleById.rejected, (state) => {
      state.blockingLoading = false;
    });

    // ─── createChemicalSampleDraft ───
    builder.addCase(createChemicalSampleDraft.pending, (state) => {
      state.blockingLoading = true;
      state.error = null;
    });
    builder.addCase(createChemicalSampleDraft.fulfilled, (state, action) => {
      state.blockingLoading = false;
      state.activeDraft = action.payload;
    });
    builder.addCase(createChemicalSampleDraft.rejected, (state, action) => {
      state.blockingLoading = false;
      state.error = action.payload as string;
    });

    // ─── publishChemicalSample ───
    builder.addCase(publishChemicalSample.pending, (state) => {
      state.blockingLoading = true;
      state.error = null;
    });
    builder.addCase(publishChemicalSample.fulfilled, (state, action) => {
      state.blockingLoading = false;
      state.activeDraft = null;
      // Добавляем или обновляем образец в каталоге
      const idx = state.items.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = action.payload;
      } else {
        state.items.unshift(action.payload);
      }
    });
    builder.addCase(publishChemicalSample.rejected, (state, action) => {
      state.blockingLoading = false;
      state.error = action.payload as string;
    });

    // ─── deleteChemicalSample ───
    builder.addCase(deleteChemicalSample.pending, (state) => {
      state.blockingLoading = true;
    });
    builder.addCase(deleteChemicalSample.fulfilled, (state, action) => {
      state.blockingLoading = false;
      state.items = state.items.filter((s) => s.id !== action.payload.id);
      if (state.feedSample?.id === action.payload.id) {
        state.feedSample = null;
      }
      if (state.selectedSample?.id === action.payload.id) {
        state.selectedSample = null;
      }
    });
    builder.addCase(deleteChemicalSample.rejected, (state, action) => {
      state.blockingLoading = false;
      state.error = action.payload as string;
    });

    // ─── toggleChemicalSampleLike ───
    builder.addCase(toggleChemicalSampleLike.pending, (state) => {
      state.blockingLoading = true;
    });
    builder.addCase(toggleChemicalSampleLike.fulfilled, (state, action) => {
      state.blockingLoading = false;
      const { id, liked } = action.payload;
      const item = state.items.find((s) => s.id === id);
      if (item) {
        if (liked === 1 && item.is_liked !== 1) {
          item.likes = (item.likes ?? 0) + 1;
        } else if (liked === 0 && item.is_liked === 1) {
          item.likes = Math.max(0, (item.likes ?? 0) - 1);
        }
        item.is_liked = liked;
      }
      if (state.feedSample && state.feedSample.id === id) {
        if (liked === 1 && state.feedSample.is_liked !== 1) {
          state.feedSample.likes = (state.feedSample.likes ?? 0) + 1;
        } else if (liked === 0 && state.feedSample.is_liked === 1) {
          state.feedSample.likes = Math.max(0, (state.feedSample.likes ?? 0) - 1);
        }
        state.feedSample.is_liked = liked;
      }
      if (state.selectedSample && state.selectedSample.id === id) {
        if (liked === 1 && state.selectedSample.is_liked !== 1) {
          state.selectedSample.likes = (state.selectedSample.likes ?? 0) + 1;
        } else if (liked === 0 && state.selectedSample.is_liked === 1) {
          state.selectedSample.likes = Math.max(0, (state.selectedSample.likes ?? 0) - 1);
        }
        state.selectedSample.is_liked = liked;
      }
    });
    builder.addCase(toggleChemicalSampleLike.rejected, (state, action) => {
      state.blockingLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setSelectedSample, clearError } = samplesSlice.actions;

export default samplesSlice.reducer;
