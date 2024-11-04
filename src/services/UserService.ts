import bcrypt from 'bcrypt'
import createHttpError from 'http-errors'
import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { LimitedUserData, UserData } from '../types'

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password, role }: UserData) {
    const user = await this.userRepository.findOne({ where: { email: email } })
    if (user) {
      const error = createHttpError(400, 'Email already exists!')
      throw error
    }

    // Hash the password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role,
      })
    } catch {
      const error = createHttpError(500, 'Failed to create user.')
      throw error
    }
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } })
  }

  async findById(id: number) {
    return await this.userRepository.findOne({ where: { id } })
  }

  async getAll() {
    return await this.userRepository.find()
  }

  async getById(userId: number) {
    return await this.userRepository.findOne({ where: { id: userId } })
  }

  async update(userId: number, userData: LimitedUserData) {
    try {
      return await this.userRepository.update(userId, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      })
    } catch {
      const error = createHttpError(
        500,
        'Failed to update the user in the database',
      )
      throw error
    }
  }
}
