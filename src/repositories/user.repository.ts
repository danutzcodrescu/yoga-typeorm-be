import { getRepository } from 'typeorm';
import { User } from '../entity/User';

export const userRepo = getRepository(User);
