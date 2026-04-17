import { Injectable } from '@nestjs/common';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResult } from './paginated-result.interface';

@Injectable()
export abstract class AbstractService {
  protected constructor(protected readonly repository: Repository<any>) {}

  async all(relations: any[] = []): Promise<any[]> {
    return this.repository.find({ relations });
  }

  async paginate(
    page: number = 1,
    relations: any[] = [],
  ): Promise<PaginatedResult> {
    // number of results per page
    const take = 15;
    const [data, total] = await this.repository.findAndCount({
      take,
      skip: (page - 1) * take,
      relations,
    });

    return {
      data: data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / take),
      },
    };
  }

  async create(data: DeepPartial<any>): Promise<any> {
    return this.repository.save(data);
  }

  async findOne(
    condition: FindOptionsWhere<any>,
    relations: any[] = [],
  ): Promise<any> {
    return this.repository.findOne({ where: condition, relations });
  }

  async update(id: number, data): Promise<any> {
    return this.repository.update(id, data);
  }

  async delete(id: number): Promise<any> {
    return this.repository.delete(id);
  }
}
