import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert
} from 'typeorm';

import * as argon from 'argon2';

export enum Status {
  active = 'active',
  inactive = 'loggedOut',
  away = 'away'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() username: string;

  @Column() password: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: ['active', 'loggedOut', 'away'],
    default: 'loggedOut'
  })
  status: Status;

  @Column('varchar', { array: true, default: {} })
  friends: string[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @BeforeInsert()
  async beforeInsert() {
    const password = await argon.hash(this.password);
    this.password = password;
  }
}
