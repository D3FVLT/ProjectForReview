import { Column, Entity, PrimaryColumn } from 'typeorm';

import { Timestamps } from '../common/timestamps';

@Entity('users')
export class User extends Timestamps {
  @PrimaryColumn('varchar')
  id: string;

  @Column('varchar')
  firstName: string;

  @Column('varchar', { nullable: true })
  username?: string;
}
