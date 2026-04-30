import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  UseGuards, UseInterceptors, UploadedFile, ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { RestaurantsService} from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const imageStorage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => cb(null, uuidv4() + extname(file.originalname)),
});

@Controller('restaurants')
export class RestaurantsController {
  constructor(private svc: RestaurantsService) {}

  @Get()
  findAll() { return this.svc.findAll(); }

  @Get('search')
  search(
    @Query('keyword') keyword = '',
    @Query('page') page = '1',
  ) {
    return this.svc.search(keyword, parseInt(page));
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: imageStorage }))
  create(@Body() dto: CreateRestaurantDto, @UploadedFile() file?: Express.Multer.File) {
    return this.svc.create({
      name: dto.name, address: dto.address, image_filename: file?.filename ?? null,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: imageStorage }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRestaurantDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const existing = await this.svc.findOne(id);
    let image_filename = existing.image_filename;

    if (dto.deleteImage === 'true' && image_filename) {
      this.svc.deleteImage(image_filename);
      image_filename = null;
    }
    if (file) {
      if (image_filename) this.svc.deleteImage(image_filename);
      image_filename = file.filename;
    }
    return this.svc.update(id, { name: dto.name, address: dto.address, image_filename });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
