import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class Timestamps {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
