import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities';

@Injectable()
export class CommentsService {
  constructor(@InjectRepository(Comment) private repo: Repository<Comment>) {}

  create(restaurant_id: number, name: string, comment: string) {
    return this.repo.save(this.repo.create({ restaurant_id, name, comment }));
  }
}
