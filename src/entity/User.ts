import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Tenant } from './Tenant'

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({ unique: true })
  email: string

  @Column({ select: false })
  password: string

  @Column()
  role: string

  @UpdateDateColumn()
  updatedAt: number

  @CreateDateColumn()
  createdAt: number

  @ManyToOne(() => Tenant)
  tenant: Tenant
}
