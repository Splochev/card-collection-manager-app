import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { CardEditions } from './card-editions.entity';

@Entity('users-cards')
@Unique(['cardEditionId', 'userId'])
export class UserCards {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: 0, nullable: false })
  count!: number;

  @ManyToOne(() => CardEditions, { nullable: false })
  @JoinColumn({ name: 'cardEditionId' })
  cardEditionId!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  userId!: number;
}
