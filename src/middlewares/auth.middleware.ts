import { Context } from 'graphql-yoga/dist/types';
import { ArgumentNode } from 'graphql';

export const loginMiddleware = async (
  resolver: any,
  parent: any,
  args: ArgumentNode,
  ctx: Context,
  info: any
) => {
  console.log({ info });
  return resolver(parent, args, ctx, info);
};

export const auth = {
  Mutation: { login: loginMiddleware }
};
