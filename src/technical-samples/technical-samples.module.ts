import { Module } from '@nestjs/common';
import { TechnicalSamplesController } from './technical-samples.controller';

@Module({
  controllers: [TechnicalSamplesController]
})
export class TechnicalSamplesModule {}
