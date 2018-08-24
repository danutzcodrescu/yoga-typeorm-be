import { userRepo } from '../helpers/userRepo';

import { UserQueryArgs } from 'schemas/index';
import { IResolvers } from 'graphql-tools';

export const UserQuery: IResolvers = {
  Query: {
    users: () => userRepo().find(),
    user: (_, { email, username }: UserQueryArgs) => {
      return userRepo()
        .createQueryBuilder('user')
        .where('user.email = :email OR user.username = :username', {
          email,
          username
        })
        .getOne();
    }
  }
};
