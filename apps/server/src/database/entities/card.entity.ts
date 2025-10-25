import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { CardEditions } from './card-editions.entity';

@Entity('cards')
export class CardEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false, unique: true })
  name!: string;

  @Column('text', { array: true, default: [] })
  cardSetNames?: string[];

  @Column()
  type!: string;

  @Column({ nullable: true })
  desc?: string;

  @Column()
  race!: string;

  @Column({ nullable: false })
  cardId!: string;

  @Column({ type: 'text', nullable: true })
  imageUrl!: string | null;

  @Column('simple-array', { nullable: true })
  typeline?: string[];

  @Column({ type: 'int', nullable: true })
  atk?: number;

  @Column({ type: 'int', nullable: true })
  def?: number;

  @Column({ type: 'int', nullable: true })
  level?: number;

  @Column({ nullable: true })
  attribute?: string;

  @Column({ type: 'int', nullable: true })
  linkval?: number;

  @Column('simple-array', { nullable: true })
  linkmarkers?: string[];

  @Column({ nullable: true })
  pend_desc?: string;

  @Column({ nullable: true })
  monster_desc?: string;

  @Column({ type: 'int', nullable: true })
  scale?: number;

  @Column({ nullable: true })
  humanReadableCardType?: string;

  @Column({ nullable: true })
  frameType?: string;

  @Column({ nullable: true })
  archetype?: string;

  @OneToMany(() => CardEditions, (cardEditions) => cardEditions.cards)
  cardEditions!: CardEditions[];
}
