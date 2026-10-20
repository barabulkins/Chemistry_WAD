import { Module } from '@nestjs/common';
import { ApiUsersController } from './api-users.controller';
import { ChemicalSamplesModule } from '../chemical-samples/chemical-samples.module';

@Module({
  imports: [ChemicalSamplesModule],
  controllers: [ApiUsersController],
})
export class UsersModule {}
