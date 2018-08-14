import * as Dataloader from 'dataloader';
import { User } from 'entity/User';
import { userRepo } from '../helpers/userRepo';

const batchUsers = async (friends: string[]) => {
  const users = await userRepo()
    .createQueryBuilder('user')
    .where('id IN (:...array)', { array: friends })
    .getMany();
  const userMap = new Map<string, User>();
  users.forEach(user => userMap.set(user.id, user));
  return [...userMap.values()];
};

export const userLoader = () => new Dataloader(batchUsers);
