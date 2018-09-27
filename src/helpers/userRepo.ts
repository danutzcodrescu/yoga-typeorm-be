import { EntityRepository, Repository, getCustomRepository } from 'typeorm';
import { User } from '../entity/User';

export const userRepo = () =>
  getCustomRepository(UserRepository, connectionName);

/* istanbul ignore next */
export const connectionName =
  process.env.NODE_ENV === 'test'
    ? 'test'
    : process.env.NODE_ENV === 'production'
      ? 'production'
      : 'default';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  findFriends(friends: string[]) {
    return this.createQueryBuilder('user')
      .where('id IN (:...array)', { array: friends })
      .getMany();
  }

  addFriend(friendId: string, userId: string) {
    return this.query(
      'UPDATE "user" SET friends = array_append(friends, $1) WHERE id = $2',
      [friendId, userId]
    );
  }
}
