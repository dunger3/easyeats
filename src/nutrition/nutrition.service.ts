import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { NutritionItem } from '../entities';

const NAME_KEYS      = ['item', 'name', 'food', 'product', 'menu item', 'description', 'menu'];
const CALORIE_KEYS   = ['calori', 'kcal', 'energy'];
const PROTEIN_KEYS   = ['protein', 'prot'];
const SODIUM_KEYS    = ['sodium', 'sel', 'salt'];
const ALL_NUTRI_KEYS = [...CALORIE_KEYS, ...PROTEIN_KEYS, ...SODIUM_KEYS, 'fat', 'carb', 'fibre', 'fiber', 'sugar'];

@Injectable()
export class NutritionService {
  constructor(@InjectRepository(NutritionItem) private repo: Repository<NutritionItem>) {}

  findByRestaurant(restaurant_id: number) {
    return this.repo.find({ where: { restaurant_id }, order: { item_name: 'ASC' } });
  }

  async search(itemName: string, maxCalories: number | null, page = 1, perPage = 20) {
    const qb = this.repo.createQueryBuilder('n').leftJoinAndSelect('n.restaurant', 'r');
    if (itemName) qb.andWhere('n.item_name LIKE :name', { name: `%${itemName}%` });
    if (maxCalories !== null && !isNaN(maxCalories)) {
      qb.andWhere('n.calories <= :max', { max: maxCalories });
    }
    const total = await qb.getCount();
    const results = await qb
      .orderBy('n.calories', 'ASC')
      .skip((page - 1) * perPage).take(perPage).getMany();
    return { results, total, totalPages: Math.ceil(total / perPage) };
  }

  async clearForRestaurant(restaurant_id: number) {
    await this.repo.delete({ restaurant_id });
    return { cleared: true };
  }

  async parseCsvAndSave(restaurantId: number, filePath: string): Promise<number> {
    const raw = fs.readFileSync(filePath, 'utf-8');
    fs.unlinkSync(filePath);
    const items = this.parseCsv(raw, restaurantId);
    if (!items.length) throw new Error(
      'Could not extract nutrition data from this CSV. Make sure it has a header row ' +
      'with columns for item name, calories, protein, and sodium.',
    );
    await this.clearForRestaurant(restaurantId);
    await this.repo.save(items);
    return items.length;
  }

  // ── CSV parsing ─────────────────────────────────────────
  private parseCsv(raw: string, restaurant_id: number): Partial<NutritionItem>[] {
    const lines = raw.replace(/\r\n?/g, '\n').split('\n');

    const headerIdx = this.findHeaderRow(lines);
    if (headerIdx === -1) throw new Error('Could not find a header row in the CSV.');

    const headers = this.splitRow(lines[headerIdx]).map(h => h.toLowerCase().trim());
    const find = (keys: string[]) => headers.findIndex(h => keys.some(k => h.includes(k)));
    const cols = {
      name:     find(NAME_KEYS),
      calories: find(CALORIE_KEYS),
      protein:  find(PROTEIN_KEYS),
      sodium:   find(SODIUM_KEYS),
    };

    if (cols.name === -1) throw new Error(
      'No item name column found. Expected a header like "Item", "Name", "Food", "Product", or "Menu Item".');
    if (cols.calories === -1) throw new Error(
      'No calories column found. Expected a header like "Calories", "Cal", "Energy", or "kcal".');

    const items: Partial<NutritionItem>[] = [];
    const seen = new Set<string>();

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const row = this.splitRow(lines[i]);
      if (!row.length || row.every(c => !c.trim())) continue;

      const name = this.cleanString(row[cols.name] ?? '');
      if (!name || name.length < 2 || seen.has(name.toLowerCase())) continue;

      const calories = this.cleanNumber(row[cols.calories] ?? '');
      if (calories === null || calories < 0 || calories > 5000) continue;

      const protein = cols.protein >= 0 ? this.cleanNumber(row[cols.protein] ?? '') : null;
      const sodium  = cols.sodium  >= 0 ? this.cleanNumber(row[cols.sodium]  ?? '') : null;

      seen.add(name.toLowerCase());
      items.push({
        restaurant_id,
        item_name: name,
        calories: Math.round(calories),
        protein:  protein !== null ? Math.round(protein * 10) / 10 : null,
        sodium:   sodium  !== null ? Math.round(sodium) : null,
      });
    }
    return items;
  }

  private findHeaderRow(lines: string[]): number {
    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      const lower = lines[i].toLowerCase();
      const hasNutrition = ALL_NUTRI_KEYS.some(k => lower.includes(k));
      const hasName = NAME_KEYS.some(k => lower.includes(k));
      if (hasNutrition && hasName) return i;
    }
    return lines.findIndex(l => l.trim().length > 0);
  }

  private cleanString(v: string) { return v.trim().replace(/^["']|["']$/g, '').trim(); }

  private cleanNumber(v: string): number | null {
    const cleaned = v.trim().replace(/[^0-9.]/g, '');
    if (!cleaned) return null;
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  }

  private splitRow(row: string): string[] {
    const out: string[] = [];
    let cur = '';
    let q = false;
    for (let i = 0; i < row.length; i++) {
      const c = row[i];
      if (c === '"') {
        if (q && row[i + 1] === '"') { cur += '"'; i++; }
        else q = !q;
      } else if ((c === ',' || c === ';' || c === '\t') && !q) {
        out.push(cur); cur = '';
      } else cur += c;
    }
    out.push(cur);
    return out;
  }
}
