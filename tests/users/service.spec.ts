import createJWKMock from 'mock-jwks'
import { DataSource, Repository } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { Roles } from '../../src/constants'
import { User } from '../../src/entity/User'
import { UserService } from '../../src/services/UserService'
import { UserData } from '../../src/types'

describe('TEST UserService', () => {
  let connection: DataSource
  let jwks: ReturnType<typeof createJWKMock>
  let adminToken: string
  let userService: UserService
  let userRepo: Repository<User>

  beforeAll(async () => {
    jwks = createJWKMock('http://localhost:5501')
    connection = await AppDataSource.initialize()

    userRepo = connection.getRepository(User)
    userService = new UserService(userRepo)
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

  describe('Test catch blocks', () => {
    it('should throw an error when userRepository.update fails', async () => {
      const updateSpy = jest
        .spyOn(userRepo, 'update')
        .mockRejectedValue(new Error('Database error'))

      const userData = {
        firstName: 'John',
        lastName: 'D',
        role: Roles.CUSTOMER,
      }

      await expect(userService.update(1, userData)).rejects.toThrow(
        'Failed to update the user in the database',
      )

      updateSpy.mockRestore()
    })

    it('should throw an error when userRepository.create fails', async () => {
      const createSpy = jest
        .spyOn(userRepo, 'save')
        .mockRejectedValue(new Error('Database error'))

      const payload: UserData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.catch@local.host',
        password: 'password',
        role: Roles.CUSTOMER,
        tenantId: 1,
      }

      await expect(userService.create(payload)).rejects.toThrow(
        'Failed to create user.',
      )

      createSpy.mockRestore()
    })

    it('should throw an error when userRepository.createAdminUser fails', async () => {
      const createSpy = jest
        .spyOn(userRepo, 'save')
        .mockRejectedValue(new Error('Database error'))

      await expect(userService.createAdminUser()).rejects.toThrow(
        'Failed to create an admin user',
      )

      createSpy.mockRestore()
    })
  })
})
