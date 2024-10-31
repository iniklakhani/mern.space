import bcrypt from 'bcrypt'
import createHttpError from 'http-errors'
import { Repository } from 'typeorm'
import { Roles } from '../constants'
import { User } from '../entity/User'
import { UserData } from '../types'

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password }: UserData) {
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
        role: Roles.CUSTOMER,
      })
    } catch {
      const error = createHttpError(500, 'Failed to create user.')
      throw error
    }
  }
}
