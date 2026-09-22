import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Coach } from '../../coaches/entities/coach.entity';
import { User } from '../../users/entities/user.entity';
import { Handedness } from '../enums/handedness.enum';
import { PlayerGender } from '../enums/player-gender.enum';
import { PlayerGoal } from '../enums/player-goal.enum';
import { PlayerStatus } from '../enums/player-status.enum';
import { Level } from '../../academy/entities/level.entity';

@Entity('players')
@Index(['playerCode'], { unique: true })
@Index(['nationalId'], { unique: true })
export class Player extends BaseEntity {
  @OneToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @Column({ name: 'player_code', type: 'varchar', length: 20 })
  playerCode!: string;

  @Column({ name: 'first_name_fa', type: 'varchar', length: 100 })
  firstNameFa!: string;

  @Column({ name: 'last_name_fa', type: 'varchar', length: 100 })
  lastNameFa!: string;

  @Column({ name: 'full_name_latin', type: 'varchar', length: 200 })
  fullNameLatin!: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate!: string;

  @Column({ name: 'national_id', type: 'varchar', length: 10 })
  nationalId!: string;

  @Column({ type: 'enum', enum: PlayerGender })
  gender!: PlayerGender;

  @Column({ name: 'height_cm', type: 'integer' })
  heightCm!: number;

  @Column({ name: 'weight_kg', type: 'numeric', precision: 5, scale: 2 })
  weightKg!: string;

  @Column({ name: 'dominant_hand', type: 'enum', enum: Handedness })
  dominantHand!: Handedness;

  @Column({ name: 'playing_position', type: 'varchar', length: 100, nullable: true })
  playingPosition!: string | null;

  @Column({ name: 'previous_club', type: 'varchar', length: 200, nullable: true })
  previousClub!: string | null;

  @Column({ name: 'medical_conditions', type: 'text', nullable: true })
  medicalConditions!: string | null;

  @Column({ type: 'text', nullable: true })
  allergies!: string | null;

  @Column({ name: 'player_mobile', type: 'varchar', length: 20, nullable: true })
  playerMobile!: string | null;

  @Column({ name: 'eitaa_mobile', type: 'varchar', length: 20, nullable: true })
  eitaaMobile!: string | null;

  @Column({ name: 'emergency_contact', type: 'varchar', length: 20 })
  emergencyContact!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode!: string | null;

  @Column({
    name: 'height_with_reach_cm',
    type: 'integer',
    nullable: true,
  })
  heightWithReachCm!: number | null;

  @Column({ name: 'vertical_jump_cm', type: 'integer', nullable: true })
  verticalJumpCm!: number | null;

  @Column({ name: 'wingspan_cm', type: 'integer', nullable: true })
  wingspanCm!: number | null;

  @Column({
    name: 'volleyball_experience',
    type: 'text',
    nullable: true,
  })
  volleyballExperience!: string | null;

  @Column({
    name: 'current_team_or_school',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  currentTeamOrSchool!: string | null;

  @Column({ type: 'enum', enum: PlayerGoal })
  goal!: PlayerGoal;

  @ManyToOne(() => Level, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'technical_level_id' })
  technicalLevel!: Level | null;

  @ManyToOne(() => Coach, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'responsible_coach_id' })
  responsibleCoach!: Coach | null;

  @Column({ name: 'start_training_month', type: 'date', nullable: true })
  startTrainingMonth!: string | null;

  @Column({ name: 'insurance_expiry_date', type: 'date', nullable: true })
  insuranceExpiryDate!: string | null;

  @Column({ name: 'clothing_size', type: 'varchar', length: 20, nullable: true })
  clothingSize!: string | null;

  @Column({ name: 'shoe_size', type: 'varchar', length: 20, nullable: true })
  shoeSize!: string | null;

  @Column({ type: 'enum', enum: PlayerStatus, default: PlayerStatus.PENDING })
  status!: PlayerStatus;

  @Column({ name: 'parental_consent_at', type: 'timestamptz', nullable: true })
  parentalConsentAt!: Date | null;

  @Column({ name: 'media_consent_at', type: 'timestamptz', nullable: true })
  mediaConsentAt!: Date | null;

  @Column({ name: 'academy_terms_accepted_at', type: 'timestamptz', nullable: true })
  academyTermsAcceptedAt!: Date | null;
}
