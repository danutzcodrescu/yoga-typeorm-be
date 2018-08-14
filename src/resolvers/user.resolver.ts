import { IResolvers } from 'graphql-tools';
import { User as UserModel, Status } from '../entity/User';
import { omit } from 'lodash';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import { userRepo } from '../helpers/userRepo';
import { RegisterMutationArgs, LogoutMutationArgs } from 'types/schemas';

import { addDays, getTime } from 'date-fns';
import { AppContext } from 'types/utilities/utilities';

const cert = fs.readFileSync(
  path.join(
    __dirname,
    '../../certs',
    process.env.NODE_ENV === 'test' ? 'private.test.key' : 'private.prod.key'
  )
);

const userResolver: IResolvers = {
  User: {
    friends: (user: UserModel, _, { userLoader }: AppContext) =>
      user.friends.length > 0 ? userLoader.loadMany(user.friends) : []
  },
  Query: {
    users: () => userRepo().find(),
    user: (_, { email, username }) => {
      return userRepo()
        .createQueryBuilder('user')
        .where('user.email = :email OR user.username = :username', {
          email,
          username
        })
        .getOne();
    }
  },

  Mutation: {
    register: async (
      _,
      { email, username, password }: RegisterMutationArgs
    ) => {
      const user = new UserModel();
      user.email = email;
      user.password = password;
      user.username = username;
      let resp;
      try {
        resp = await userRepo().save(user);
      } catch (e) {
        if (e.message.includes('duplicate key')) {
          return new Error('Duplicate email');
        } else {
          return new Error('Cannot create');
        }
      }
      return resp;
    },

    login: async (_, __, { response, user }: AppContext) => {
      user.status = Status.active;
      let safeUser;
      try {
        safeUser = await userRepo().save(user);
        safeUser = omit(user, ['password']);
      } catch (e) {
        console.log(e);
      }

      const expires = addDays(new Date(), 1);
      const seconds = getTime(expires) / 1000;
      const token = jwt.sign({ exp: seconds, user: safeUser }, cert, {
        algorithm: 'RS256'
      });

      response.cookie('access_token', token, {
        httpOnly: true,
        expires,
        maxAge: 1000 * 60 * 60 * 24
      });
      return safeUser;
    },

    logout: async (
      _,
      { email }: LogoutMutationArgs,
      { response, user }: AppContext
    ) => {
      if (email !== user.email) {
        return new Error('no simmilar emails');
      }
      try {
        await userRepo()
          .createQueryBuilder()
          .update()
          .set({ status: Status.inactive })
          .where('email = :email', { email })
          .execute();
      } catch (e) {
        return new Error('log off failed');
      }
      response.clearCookie('access_token');
      return 'logged out';
    },

    addFriend: async (_, { id }, { user }: AppContext) => {
      if (!user.friends.includes(id)) {
        try {
          await Promise.all([
            userRepo().addFriend(id, user.id),
            userRepo().addFriend(user.id, id)
          ]);
        } catch (e) {
          console.log(e);
        }
      }
      return userRepo().findOne({ id: user.id });
    }
  }
};

export interface JWT {
  exp: number;
  user: any;
  iat: number;
}
export default userResolver;
