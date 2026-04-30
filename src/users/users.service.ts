import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findAll() {
    return this.repo.find({ order: { user_id: 'ASC' } }); 
  }

  findOne(id: number) {
    return this.repo.findOneBy({ user_id: id }); 
  }

  findByEmail(email: string) {
    return this.repo.findOneBy({ email }); 
  }

  create(data: Partial<User>) {
    return this.repo.save(this.repo.create(data)); 
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (!user) 
      throw new NotFoundException('User not found');
    
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async remove(id: number) { await this.repo.delete(id); }
}
