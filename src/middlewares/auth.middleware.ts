import { Context } from 'graphql-yoga/dist/types';
import { ArgumentNode } from 'graphql';
import * as jwt from 'jsonwebtoken';
import { JWT } from 'resolvers/user.resolver';
import * as fs from 'fs';
import * as path from 'path';
import { userRepo } from '../helpers/userRepo';
import { isNil } from 'lodash';
import * as argon from 'argon2';
import { LoginMutationArgs } from 'types/schemas';

const publicCert = fs.readFileSync(
  path.join(
    __dirname,
    '../../certs',
    process.env.NODE_ENV === 'test' ? 'public.test.key' : 'public.prod.key'
  )
);

export const logedInMiddleware = async (
  resolver: any,
  parent: any,
  args: ArgumentNode,
  ctx: Context,
  info: any
) => {
  let decoded: JWT;
  try {
    decoded = jwt.verify(ctx.token, publicCert) as JWT;
  } catch {
    throw new Error('not authenticated');
  }
  const user = await userRepo().findOne({ id: decoded.user.id });
  if (isNil(user)) {
    throw Error('user not found');
  }
  ctx.user = user;
  return resolver(parent, args, ctx, info);
};

export const logInMiddleware = async (
  resolver: any,
  parent: any,
  args: LoginMutationArgs,
  ctx: Context,
  info: any
) => {
  const user = await userRepo().findOne({
    email: args.email
  });
  if (isNil(user)) {
    throw Error('User not found');
  }
  if (!(await argon.verify(user.password, args.password))) {
    throw Error('Password is wrong');
  }
  ctx.user = user;
  return resolver(parent, args, ctx, info);
};

export const auth: any = {
  Query: {
    user: logedInMiddleware
  },
  Mutation: {
    logout: logedInMiddleware,
    login: logInMiddleware,
    addFriend: logedInMiddleware
  }
};
