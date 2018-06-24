import { getRepository } from 'typeorm';
import { User } from '../entity/User';

export const userRepo = () =>
  getRepository(User, process.env.NODE_ENV === 'test' ? 'test' : 'default');
