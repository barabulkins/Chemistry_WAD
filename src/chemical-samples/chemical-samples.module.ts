import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChemicalSamplesController } from './chemical-samples.controller';
import { ChemicalSamplesService } from './chemical-samples.service';
import { ChemicalSample } from './entities/chemical-sample.entity';
import { User } from './entities/user.entity';
import { SampleLike } from './entities/sample-like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChemicalSample, User, SampleLike])],
  controllers: [ChemicalSamplesController],
  providers: [ChemicalSamplesService],
})
export class ChemicalSamplesModule {}
