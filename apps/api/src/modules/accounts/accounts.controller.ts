import { Controller, Get } from '@nestjs/common';

@Controller('accounts')
export class AccountsController {
  @Get()
  findAll() {
    return { message: 'List accounts - TODO' };
  }
}
