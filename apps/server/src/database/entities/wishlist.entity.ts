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

@Entity('wishlist')
@Unique(['cardEditionId', 'userId'])
export class Wishlist {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: 0, nullable: false })
  count!: number;

  @Column({ nullable: false })
  cardEditionId!: number;

  @Column({ nullable: false })
  userId!: number;

  @ManyToOne(() => CardEditions, { nullable: false })
  @JoinColumn({ name: 'cardEditionId' })
  cardEdition!: CardEditions;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
