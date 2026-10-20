import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Render,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ChemicalSamplesService } from './chemical-samples.service';
import { CurrentUser } from '../auth/current-user';

@Controller('technical-samples')
export class ChemicalSamplesController {
  // Фиксированный пользователь через singleton
  private get CURRENT_USER_ID(): number {
    return CurrentUser.getInstance().getId();
  }

  constructor(private readonly samplesService: ChemicalSamplesService) {}

  // ─── 1. GET: Плитка карточек ───
  @Get()
  @Render('tile')
  async getAll(@Query('gas_volume') volume?: string) {
    const gasVol = volume && volume.trim() !== '' ? Number(volume) : undefined;
    const samples = await this.samplesService.findAllForTile(gasVol);
    return { samples, queryVolume: volume || '' };
  }

  // ─── 2. GET: Страница добавления / редактирования черновика ───
  @Get('draft')
  @Render('add')
  async getDraft() {
    const draft = await this.samplesService.findDraftByUser(this.CURRENT_USER_ID);
    return { sample: draft || null, hasDraft: !!draft };
  }

  // ─── 3. GET: Лента ───
  @Get(['feed', 'feed/:id'])
  @Render('feed')
  async getFeed(@Param('id') id?: string, @Query('next') next?: string) {
    const isNext = next === 'true';
    const sample = await this.samplesService.findOneForFeed(
      id ? Number(id) : undefined,
      isNext,
    );
    return { sample };
  }

  // ─── 4. POST: Создание черновика (ORM) ───
  @Post('draft')
  async createDraft(@Body('title') title: string, @Res() res: Response) {
    await this.samplesService.createDraftFrontend(
      this.CURRENT_USER_ID,
      title || 'Новый образец',
    );
    return res.redirect('/technical-samples/draft');
  }

  // ─── 5. POST: Публикация черновика (ORM) ───
  @Post('publish')
  async publishDraft(
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('impurities_percent') impuritiesPercent: string,
    @Body('gas_volume') gasVolume: string,
    @Res() res: Response,
  ) {
    await this.samplesService.publishDraftFrontend(
      this.CURRENT_USER_ID,
      title,
      description,
      parseFloat(impuritiesPercent) || 0,
      parseInt(gasVolume, 10) || 0,
    );
    return res.redirect('/technical-samples');
  }

  // ─── 6. POST: Логическое удаление через SQL cursor ───
  @Post(':id/delete')
  async deleteSample(@Param('id') id: string, @Res() res: Response) {
    await this.samplesService.deleteSampleRaw(this.CURRENT_USER_ID, Number(id));
    return res.redirect('/technical-samples');
  }
}
