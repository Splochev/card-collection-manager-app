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

  @Column({ type: 'varchar', nullable: false, unique: true })
  name!: string;

  @Column('text', { array: true, default: [] })
  cardSetNames?: string[];

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'text', nullable: true })
  desc?: string;

  @Column({ type: 'varchar' })
  race!: string;

  @Column({ type: 'varchar', nullable: false })
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

  @Column({ type: 'varchar', nullable: true })
  attribute?: string;

  @Column({ type: 'int', nullable: true })
  linkval?: number;

  @Column('simple-array', { nullable: true })
  linkmarkers?: string[];

  @Column({ type: 'text', nullable: true })
  pend_desc?: string;

  @Column({ type: 'text', nullable: true })
  monster_desc?: string;

  @Column({ type: 'int', nullable: true })
  scale?: number;

  @Column({ type: 'varchar', nullable: true })
  humanReadableCardType?: string;

  @Column({ type: 'varchar', nullable: true })
  frameType?: string;

  @Column({ type: 'varchar', nullable: true })
  archetype?: string;

  @OneToMany(() => CardEditions, (cardEditions) => cardEditions.cards)
  cardEditions!: CardEditions[];
}
