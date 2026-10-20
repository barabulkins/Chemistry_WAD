import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiUsersController } from './api-users.controller';
import { UsersService } from './users.service';
import { User } from '../chemical-samples/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [ApiUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
