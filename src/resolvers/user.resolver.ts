import { IResolvers } from 'graphql-tools';
import { User as UserModel, Status } from '../entity/User';
import { isNil, omit } from 'lodash';
import { ApolloError } from 'apollo-errors';
import * as argon from 'argon2';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import { userRepo } from '../helpers/userRepo';
import {
  RegisterMutationArgs,
  LoginMutationArgs,
  LogoutMutationArgs
} from 'types/schemas';

import { addDays, getTime } from 'date-fns';

const cert = fs.readFileSync(
  path.join(
    __dirname,
    '../../certs',
    process.env.NODE_ENV === 'test' ? 'private.test.key' : 'private.prod.key'
  )
);

const publicCert = fs.readFileSync(
  path.join(
    __dirname,
    '../../certs',
    process.env.NODE_ENV === 'test' ? 'public.test.key' : 'public.prod.key'
  )
);

const userResolver: IResolvers = {
  User: {
    friends: (user: UserModel) =>
      userRepo()
        .createQueryBuilder()
        .where('id IN (:...array)', { array: user.friends })
        .getMany()
  },
  Query: {
    users: () => userRepo().find(),
    user: (
      _,
      { email, username },
      { token }: { response: Response; token: string }
    ) => {
      try {
        jwt.verify(token, publicCert);
      } catch {
        return new ApolloError(
          'must_authenticate',
          { message: 'Not authenticated' },
          { message: 'Not authenticated' }
        );
      }
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
          return new ApolloError(
            'not_found',
            { message: 'Duplicate email existing' },
            { message: 'Duplicate email existing' }
          );
        } else {
          return new ApolloError(
            'not_found',
            { message: 'Cannot create new user' },
            { message: 'Cannot create new user' }
          );
        }
      }
      return resp;
    },

    login: async (
      _,
      { email, password }: LoginMutationArgs,
      {
        response
      }: { response: Response; token: { response: Response; token: string } }
    ) => {
      const user = await userRepo().findOne({
        where: { email }
      });
      if (isNil(user)) {
        return new ApolloError(
          'not_found',
          { message: 'User not found' },
          { message: 'User not found' }
        );
      }
      if (!(await argon.verify(user.password, password))) {
        return new ApolloError(
          'not_found',
          { message: 'Password is wrong' },
          { message: 'Password is wrong' }
        );
      }
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
      { response, token }: { response: Response; token: string }
    ) => {
      try {
        jwt.verify(token, publicCert);
      } catch {
        return new ApolloError(
          'must_authenticate',
          { message: 'Not authenticated' },
          { message: 'Not authenticated' }
        );
      }
      try {
        await userRepo()
          .createQueryBuilder()
          .update()
          .set({ status: Status.inactive })
          .where('email = :email', { email })
          .execute();
      } catch (e) {
        return new ApolloError(
          'not_found',
          { message: 'User not found' },
          { message: 'User not found' }
        );
      }
      response.clearCookie('access_token');
      return 'logged out';
    },

    addFriend: async (_, { id }, { token }) => {
      let decoded: JWT;
      try {
        decoded = jwt.verify(token, publicCert) as JWT;
      } catch {
        return new ApolloError(
          'must_authenticate',
          { message: 'Not authenticated' },
          { message: 'Not authenticated' }
        );
      }
      try {
        await userRepo().query(
          'UPDATE "user" SET friends = array_append(friends, $1) WHERE id = $2',
          [id, decoded.user.id]
        );
      } catch (e) {
        console.log(e);
      }
      return userRepo().findOne({ id: decoded.user.id });
    }
  }
};

interface JWT {
  exp: number;
  user: any;
  iat: number;
}
export default userResolver;
