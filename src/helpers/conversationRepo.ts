import { getRepository } from 'typeorm';
import { connectionName } from './userRepo';
import { Conversation } from '../entity/Conversation';

export const conversationRepo = () =>
  getRepository(Conversation, connectionName);
