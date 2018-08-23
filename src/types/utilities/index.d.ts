import { User } from 'entity/User';
import { Response } from 'express';
import { userLoader } from 'loaders/user.loaders';
import { PubSub } from 'graphql-yoga';

export interface AppContext {
  token: string;
  response: Response;
  user: User;
  userLoader: ReturnType<typeof userLoader>;
  pubsub: PubSub
}
