import { IResolvers } from 'graphql-tools';
import { User as UserModel } from '../entity/User';
import { User } from '../../types/schemas/types';
import { isNil } from 'lodash';
import { ApolloError } from 'apollo-errors';
import * as argon from 'argon2';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import { userRepo } from '../helpers/userRepo';
// tslint:disable-next-line
const ms = require("ms");

const userResolver: IResolvers = {
  Query: {
    users: () => userRepo().find(),
    user: (
      _,
      { email, username }: User,
      { token }: { response: Response; token: string }
    ) => {
      const decoded = jwt.decode(token) as JWT;
      if (isNil(decoded)) {
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
    register: (_, { email, username, password }: User) => {
      const user = new UserModel();
      user.email = email;
      user.password = password;
      user.username = username;
      return userRepo().save(user);
    },

    login: async (
      _,
      { email, password }: User,
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
      const cert = fs.readFileSync(
        path.join(__dirname, '../../certs', 'private.key')
      );
      const token = jwt.sign({ exp: ms('1d') / 1000, user }, cert, {
        algorithm: 'RS256'
      });
      response.cookie('access_token', token, {
        // maxAge: ms('1d') / 1000,
        httpOnly: true
      });
      return user;
    },

    logout: (
      _,
      { email }: User,
      { response }: { response: Response; token: string }
    ) => {
      console.log(email);
      response.clearCookie('access_token');
      return 'logged out';
    }
  }
};

interface JWT {
  exp: number;
  user: any;
  iat: number;
}
export default userResolver;
