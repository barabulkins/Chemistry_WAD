import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChemicalSamplesModule } from './chemical-samples/chemical-samples.module';
import { ChemicalSample } from './chemical-samples/entities/chemical-sample.entity';
import { User } from './chemical-samples/entities/user.entity';
import { SampleLike } from './chemical-samples/entities/sample-like.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'chemistry_db',
      entities: [ChemicalSample, User, SampleLike],
      synchronize: true,
    }),
    ChemicalSamplesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
