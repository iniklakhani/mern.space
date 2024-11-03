import createJWKMock from 'mock-jwks'
import request from 'supertest'
import { DataSource } from 'typeorm'
import app from '../../src/app'
import { AppDataSource } from '../../src/config/data-source'
import { Roles } from '../../src/constants'
import { User } from '../../src/entity/User'

describe('GET /auth/self', () => {
  let connection: DataSource
  let jwks: ReturnType<typeof createJWKMock>

  beforeAll(async () => {
    jwks = createJWKMock('http://localhost:5501')
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    jwks.start()
    // Truncate database
    await connection.dropDatabase()
    await connection.synchronize()
  })

  afterEach(() => {
    jwks.stop()
  })

  afterAll(async () => {
    await connection.destroy()
  })

  describe('Given all fields', () => {
    it('should return the 200 status code', async () => {
      const accessToken = jwks.token({
        sub: '1',
        role: Roles.CUSTOMER,
      })

      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send()
      expect(response.statusCode).toBe(200)
    })

    it('should return the user data', async () => {
      // Register an user
      const userData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john.d@local.host',
        password: 'password',
      }
      const userRepository = connection.getRepository(User)
      const user = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      })

      // Generate token
      const accessToken = jwks.token({ sub: String(user.id), role: user.role })

      // Add token to cookie
      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send()

      // Assert
      // Check if user id matches with registered user
      expect((response.body as Record<string, string>).id).toBe(user.id)
    })

    it('should not return the password field', async () => {
      // Register an user
      const userData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john.d@local.host',
        password: 'password',
      }
      const userRepository = connection.getRepository(User)
      const user = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      })

      // Generate token
      const accessToken = jwks.token({ sub: String(user.id), role: user.role })

      // Add token to cookie
      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send()

      // Assert
      // Check if user id matches with registered user
      expect(response.body as Record<string, string>).not.toHaveProperty(
        'password',
      )
    })
  })
})
