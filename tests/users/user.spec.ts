import createJWKMock from 'mock-jwks'
import request from 'supertest'
import { DataSource } from 'typeorm'
import app from '../../src/app'
import { AppDataSource } from '../../src/config/data-source'
import { Roles } from '../../src/constants'
import { User } from '../../src/entity/User'

describe('GET /auth', () => {
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

    it('should return 401 status code if token does not exist', async () => {
      // Register an user
      const userData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john.d@local.host',
        password: 'password',
      }
      const userRepository = connection.getRepository(User)
      await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      })

      // Add token to cookie
      const response = await request(app).get('/auth/self').send()

      // Assert
      expect(response.statusCode).toBe(401)
    })

    it('should return user id after validation refresh token', async () => {
      // Register an user
      const userData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john.d@local.host',
        password: 'password',
      }

      const userRegistered = await request(app)
        .post('/auth/register')
        .send(userData)
      expect(userRegistered.statusCode).toBe(201)

      // Do login to get the refresh & access token
      const response = await request(app).post('/auth/login').send({
        email: userData.email,
        password: userData.password,
      })

      interface Headers {
        ['set-cookie']: string[]
      }
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

      // call /auth/refresh
      const getNewToken = await request(app)
        .post('/auth/refresh')
        .set('Cookie', [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({})

      expect(getNewToken.statusCode).toBe(200)
      expect(getNewToken.body).toHaveProperty('id')
    })
  })
})
