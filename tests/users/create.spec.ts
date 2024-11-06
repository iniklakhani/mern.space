import createJWKMock from 'mock-jwks'
import request from 'supertest'
import { DataSource } from 'typeorm'
import app from '../../src/app'
import { AppDataSource } from '../../src/config/data-source'
import { Roles } from '../../src/constants'
import { Tenant } from '../../src/entity/Tenant'
import { UserService } from '../../src/services/UserService'
import { createTenant } from '../utils/index'
import { User } from './../../src/entity/User'

describe('POST /users', () => {
  let connection: DataSource
  let jwks: ReturnType<typeof createJWKMock>
  let adminToken: string

  beforeAll(async () => {
    jwks = createJWKMock('http://localhost:5501')
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    jwks.start()
    // Truncate database
    await connection.dropDatabase()
    await connection.synchronize()

    adminToken = jwks.token({
      sub: '1',
      role: Roles.ADMIN,
    })
  })

  afterEach(() => {
    jwks.stop()
  })

  afterAll(async () => {
    await connection.destroy()
  })

  describe('Given all fields', () => {
    it('should return created admin id on initial server start', async () => {
      const userRepo = connection.getRepository(User)
      const userService = new UserService(userRepo)

      const response = await userService.createAdminUser()
      expect(response).toBe(1)
    })

    it('should return null on initial server start when admin has already been created', async () => {
      const userRepo = connection.getRepository(User)
      const userService = new UserService(userRepo)

      const response = await userService.createAdminUser()
      expect(response).toBe(1)

      const createAgain = await userService.createAdminUser()
      expect(createAgain).toBeNull()
    })

    it('should persist the user in the database', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant))

      // Register an user
      const userData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john.d@local.host',
        password: 'password',
        tenantId: tenant.id,
        role: Roles.MANAGER,
      }

      // Add token to cookie
      await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(userData)

      // Assert
      const userRepo = connection.getRepository(User)
      const users = await userRepo.find({ select: ['email'] })

      expect(users).toHaveLength(1)
      expect(users[0].email).toBe(userData.email)
    })

    it('should create a manager user', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant))

      // Register an user
      const userData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john.d@local.host',
        password: 'password',
        tenantId: tenant.id,
        role: Roles.MANAGER,
      }

      // Add token to cookie
      await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(userData)

      // Assert
      const userRepo = connection.getRepository(User)
      const users = await userRepo.find()

      expect(users).toHaveLength(1)
      expect(users[0].role).toBe(Roles.MANAGER)
    })

    it('should return 403 if non admin user tries to create an user', async () => {
      const nonAdminToken = jwks.token({
        sub: '1',
        role: Roles.MANAGER,
      })

      // Register an user
      const userData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john.d@local.host',
        password: 'password',
        tenantId: 1,
      }

      // Add token to cookie
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${nonAdminToken}`])
        .send()

      // Assert
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(response.statusCode).toBe(403)
      expect(users).toHaveLength(0)
    })

    it('should return list of users to be 1', async () => {
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
        role: Roles.ADMIN,
      })

      // Add token to cookie
      const response = await request(app)
        .get('/users')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send()

      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveLength(1)
    })

    it('should return single user by Id', async () => {
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

      // Add token to cookie
      const response = await request(app)
        .get(`/users/${user.id}`)
        .set('Cookie', [`accessToken=${adminToken};`])
        .send()

      expect(response.statusCode).toBe(200)
    })

    it('should update the user and return the Id', async () => {
      // Register an user
      const userData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john.customer@local.host',
        password: 'password',
        role: Roles.CUSTOMER,
      }
      const userRepo = connection.getRepository(User)
      const user = await userRepo.save(userData)

      // Add token to cookie
      const updated = await request(app)
        .patch(`/users/${user.id}`)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send({
          firstName: 'I am John',
          lastName: 'Doe',
          role: Roles.MANAGER,
        })

      // Assert
      expect(updated.statusCode).toBe(200)
      expect(updated.body).toHaveProperty('id')
    })

    it('should delete the user and return the Id', async () => {
      // Register an user
      const userData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john.customer@local.host',
        password: 'password',
        role: Roles.CUSTOMER,
      }
      const userRepo = connection.getRepository(User)
      const user = await userRepo.save(userData)

      // Add token to cookie
      const deleted = await request(app)
        .delete(`/users/${user.id}`)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send()

      // Assert
      expect(deleted.statusCode).toBe(200)
      expect(deleted.body).toHaveProperty('id')
    })
  })
})
