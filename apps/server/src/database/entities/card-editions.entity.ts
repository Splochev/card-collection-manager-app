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

  @Column({ nullable: false, unique: true })
  cardNumber!: string;

  @Column({ nullable: false })
  cardSetName!: string;

  @Column({ nullable: false })
  name!: string;

  @Column('text', { array: true, default: [] })
  rarities?: string[];

  @Column({ nullable: true, type: 'text', default: null })
  marketURL!: string;

  @Column()
  cardId!: number;

  @ManyToOne(() => CardEntity, { nullable: false })
  @JoinColumn({ name: 'cardId' })
  cards!: CardEntity[];

  count?: number;
}
