import bcrypt from 'bcrypt'
import request from 'supertest'
import { DataSource } from 'typeorm'
import app from '../../src/app'
import { AppDataSource } from '../../src/config/data-source'
import { Roles } from '../../src/constants'
import { User } from '../../src/entity/User'
import { isJWT } from '../utils'

describe('POST /auth/login', () => {
  let connection: DataSource

  beforeAll(async () => {
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    // Truncate database
    await connection.dropDatabase()
    await connection.synchronize()
  })

  afterAll(async () => {
    await connection.destroy()
  })

  describe('Given all fields', () => {
    it('should return the token and refresh token inside a cookie', async () => {
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john.d@local.host',
        password: 'password',
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      const userRepository = connection.getRepository(User)
      await userRepository.save({
        ...userData,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      })

      // Act
      const response = await request(app)
        .post('/auth/login')
        .send({ email: userData.email, password: userData.password })

      interface Headers {
        ['set-cookie']: string[]
      }

      // Assert
      let accessToken = ''
      let refreshToken = ''
      const cookies =
        (response.headers as unknown as Headers)['set-cookie'] || []

      cookies.forEach((cookie) => {
        if (cookie.startsWith('accessToken=')) {
          accessToken = cookie.split(';')[0].split('=')[1]
        }
        if (cookie.startsWith('refreshToken=')) {
          refreshToken = cookie.split(';')[0].split('=')[1]
        }
      })

      expect(accessToken).not.toBeNull()
      expect(refreshToken).not.toBeNull()

      expect(isJWT(accessToken)).toBeTruthy()
      expect(isJWT(refreshToken)).toBeTruthy()
    })

    it('should return the 400 if email or password is wrong', async () => {
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john.d@local.host',
        password: 'password',
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      const userRepository = connection.getRepository(User)
      await userRepository.save({
        ...userData,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      })

      // Act
      const response = await request(app).post('/auth/login').send({
        email: userData.email,
        password: 'wrong-password',
      })

      // Assert
      expect(response.statusCode).toBe(400)
    })
  })
})
