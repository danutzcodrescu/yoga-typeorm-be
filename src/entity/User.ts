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
  inactive = 'logged out',
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
    enum: ['active', 'logged out', 'away'],
    default: 'logged out'
  })
  status: Status;

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
