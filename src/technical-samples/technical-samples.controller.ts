import { Controller, Get, Param, Query, Render, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('technical-samples')
export class TechnicalSamplesController {
  // Модель-коллекция услуг (Технические образцы веществ)
  private samples = [
    {
      id: 1,
      title: 'Известняк',
      description: 'Технический образец известняка для определения массовой доли примесей. При обработке кислотой выделяется углекислый газ.',
      status: 'published',
      impurities_percent: 15.5,
      gas_volume: 45,
      likes: [101, 102, 103, 104, 105], // 5 likes
      image_url: 'http://127.0.0.1:9000/chemistry1/limestone.jpg',
      video_url: 'http://127.0.0.1:9000/chemistry1/limestone.MP4'
    },
    {
      id: 2,
      title: 'Мрамор',
      description: 'Кристаллическая горная порода, состоящая из кальцита. Используется в качестве образца для расчета доли примесей.',
      status: 'published',
      impurities_percent: 2.3,
      gas_volume: 85,
      likes: [101, 102, 106], // 3 likes
      image_url: 'http://127.0.0.1:9000/chemistry1/marble.jpg',
      video_url: 'http://127.0.0.1:9000/chemistry1/marble.MP4'
    },
    {
      id: 3,
      title: 'Металлический цинк',
      description: 'Образец цинка с примесями. При реакции с соляной кислотой выделяется водород.',
      status: 'published',
      impurities_percent: 5.0,
      gas_volume: 22,
      likes: [103, 107], // 2 likes
      image_url: 'http://127.0.0.1:9000/chemistry1/zinc.jpg',
      video_url: 'http://127.0.0.1:9000/chemistry1/zinc.MP4'
    },
    {
      id: 4,
      title: 'Новый образец',
      description: 'Описание нового образца',
      status: 'draft',
      impurities_percent: 0,
      gas_volume: 0,
      likes: [],
      image_url: '',
      video_url: ''
    },
    {
      id: 5,
      title: 'Бракованный образец',
      description: 'Не используется',
      status: 'deleted',
      impurities_percent: 99.9,
      gas_volume: 0,
      likes: [],
      image_url: '',
      video_url: ''
    }
  ];

  // 1. Страница плитки карточек (список)
  @Get()
  @Render('tile')
  getAll(@Query('gas_volume') volume?: string) {
    let items = this.samples.filter(s => s.status === 'published' || s.status === 'draft');
    
    if (volume && volume.trim() !== '') {
      items = items.filter(s => s.gas_volume === Number(volume));
    }
    
    return { 
      samples: items.map(s => ({ ...s, likes: s.likes.length, isDraft: s.status === 'draft' })), 
      queryVolume: volume || ''
    };
  }

  // 2. Страница добавления (черновик)
  @Get('draft')
  @Render('add')
  getDraft() {
    const draftItem = this.samples.find(s => s.status === 'draft');
    return { sample: draftItem };
  }

  // 3. Страница ленты
  @Get(['feed', 'feed/:id'])
  @Render('feed')
  getFeed(@Param('id') id?: string, @Query('next') next?: string) {
    const items = this.samples.filter(s => s.status === 'published' || s.status === 'draft');
    
    let currentIndex = 0;
    if (id) {
      const idx = items.findIndex(s => s.id === Number(id));
      if (idx !== -1) currentIndex = idx;
    }

    if (next === 'true') {
      currentIndex = (currentIndex + 1) % items.length;
    }

    const selected = items[currentIndex];
    return { 
      sample: selected ? { ...selected, likes: selected.likes.length } : null
    };
  }
}