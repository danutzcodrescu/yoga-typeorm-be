import { IResolvers } from 'graphql-tools';
import { User as UserModel } from '../entity/User';
import { StatusChange, StatusSubscriptionArgs } from 'types/schemas';

import { AppContext } from 'types/utilities';
import { withFilter } from 'graphql-yoga';
import { STATUS } from '../globals/constants';
import { UserQuery } from './user.query';
import { UserMutation } from './user.mutation';
import { getRepository } from 'typeorm';
import { Conversation } from '../entity/Conversation';
import { connectionName } from '../helpers/userRepo';

const resolver: IResolvers = {
  User: {
    friends: (user: UserModel, _, { userLoader }: AppContext) =>
      user.friends.length > 0 ? userLoader.loadMany(user.friends) : [],
    conversation: async (user: UserModel, _, __) => {
      return getRepository(Conversation, connectionName).query(
        'SELECT id from "conversation" WHERE $1 = ANY(users);',
        [user.id]
      );
    }
  },

  Subscription: {
    status: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: withFilter(
        (_, __, { pubsub }: AppContext) => pubsub.asyncIterator([STATUS]),
        (
          payload: { status: StatusChange },
          variables: StatusSubscriptionArgs
        ) => {
          return variables.friends.includes(payload.status.userId);
        }
      )
    }
  }
};

export interface JWT {
  exp: number;
  user: any;
  iat: number;
}

export default Object.assign(resolver, UserQuery, UserMutation);
