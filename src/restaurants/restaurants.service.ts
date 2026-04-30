import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Restaurant } from '../entities';

export const CATEGORIES: Record<string, { icon: string; ids: number[] }> = {
  'Fast Food':         { icon: '🍔', ids: [5, 9, 10, 13] },
  'Chicken & Tex Mex': { icon: '🌮', ids: [7, 8, 14] },
  Cafes:               { icon: '☕', ids: [6, 11, 12] },
};

@Injectable()
export class RestaurantsService {
  constructor(@InjectRepository(Restaurant) private repo: Repository<Restaurant>) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const r = await this.repo.findOne({
      where: { restaurant_id: id },
      relations: ['menuItems', 'comments'],
    });
    if (!r) throw new NotFoundException('Restaurant not found');
    return r;
  }

  async search(keyword: string, page: number, perPage = 6) {
    const qb = this.repo.createQueryBuilder('r');
    if (keyword) qb.andWhere('r.name LIKE :kw', { kw: `%${keyword}%` });
    const total = await qb.getCount();
    const results = await qb.skip((page - 1) * perPage).take(perPage).getMany();
    return { results, total, totalPages: Math.ceil(total / perPage) };
  }

  create(data: Partial<Restaurant>) { return this.repo.save(this.repo.create(data)); }

  async update(id: number, data: Partial<Restaurant>) {
    const r = await this.repo.findOneBy({ restaurant_id: id });
    if (!r) throw new NotFoundException('Restaurant not found');
    Object.assign(r, data);
    return this.repo.save(r);
  }

  async remove(id: number) {
    const r = await this.repo.findOneBy({ restaurant_id: id });
    if (!r) throw new NotFoundException('Restaurant not found');
    if (r.image_filename) this.deleteImage(r.image_filename);
    // Delete dependents to avoid FK constraint errors
    await this.repo.manager.query('DELETE FROM comments WHERE restaurant_id = ?', [id]);
    await this.repo.manager.query('DELETE FROM menu WHERE restaurant_id = ?', [id]);
    await this.repo.manager.query('DELETE FROM nutrition WHERE restaurant_id = ?', [id]);
    await this.repo.delete(id);
  }

  deleteImage(filename: string) {
    const p = path.join(process.cwd(), 'uploads', filename);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}
