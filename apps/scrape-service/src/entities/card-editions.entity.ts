import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { CardEntity } from './card.entity';

@Entity('card-editions')
@Index(['name', 'cardNumber'], { unique: true })
export class CardEditions {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', nullable: false, unique: true })
  cardNumber!: string;

  @Column({ type: 'varchar', nullable: false })
  cardSetName!: string;

  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column('text', { array: true, default: [] })
  rarities?: string[];

  @Column({ nullable: true, type: 'text', default: null })
  marketURL!: string;

  @Column({ type: 'int' })
  cardId!: number;

  @ManyToOne(() => CardEntity, { nullable: false })
  @JoinColumn({ name: 'cardId' })
  cards!: CardEntity[];

  count?: number;
}
