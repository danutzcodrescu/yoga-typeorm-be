import { EntityRepository, Repository, getCustomRepository } from 'typeorm';
import { User } from '../entity/User';

export const userRepo = () =>
  getCustomRepository(
    UserRepository,
    process.env.NODE_ENV === 'test'
      ? 'test'
      : process.env.NODE_ENV === 'production'
        ? 'production'
        : 'default'
  );

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  findFriends(friends: string[]) {
    return this.createQueryBuilder('user')
      .where('id IN (:...array)', { array: friends })
      .getMany();
  }
}
