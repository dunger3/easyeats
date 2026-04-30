import {
  Controller, Get, Post, Delete, Param, Query, UseGuards, UseInterceptors,
  UploadedFile, ParseIntPipe, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { NutritionService } from './nutrition.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const csvStorage = diskStorage({
  destination: './uploads/nutrition-tmp',
  filename: (_req, _file, cb) => cb(null, uuidv4() + '.csv'),
});

@Controller('nutrition')
export class NutritionController {
  constructor(private svc: NutritionService) {}

  @Get('search')
  search(
    @Query('item') item = '',
    @Query('maxCalories') maxCalories = '',
    @Query('page') page = '1',
  ) {
    const max = maxCalories !== '' ? parseInt(maxCalories) : null;
    return this.svc.search(item, max, parseInt(page));
  }

  @Get('restaurant/:id')
  findByRestaurant(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findByRestaurant(id);
  }

  @Post('restaurant/:id/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: csvStorage }))
  async uploadCsv(
    @Param('id', ParseIntPipe) restaurantId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded.');
    const isCsv = file.mimetype === 'text/csv'
      || file.mimetype === 'application/vnd.ms-excel'
      || file.mimetype === 'text/plain'
      || file.originalname.toLowerCase().endsWith('.csv');
    if (!isCsv) throw new BadRequestException('Only CSV files are accepted.');

    const count = await this.svc.parseCsvAndSave(restaurantId, file.path);
    return { message: `Successfully imported ${count} nutrition items.`, count };
  }

  @Delete('restaurant/:id')
  @UseGuards(JwtAuthGuard)
  clear(@Param('id', ParseIntPipe) id: number) { return this.svc.clearForRestaurant(id); }
}
