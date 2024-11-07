import createJWKMock from 'mock-jwks'
import request from 'supertest'
import { DataSource, Repository } from 'typeorm'
import app from '../../src/app'
import { AppDataSource } from '../../src/config/data-source'
import { Tenant } from '../../src/entity/Tenant'
import { TenantService } from '../../src/services/TenantService'

describe('GET /tenants', () => {
  let connection: DataSource
  let jwks: ReturnType<typeof createJWKMock>
  let tenantService: TenantService
  let tenantRepo: Repository<Tenant>

  beforeAll(async () => {
    jwks = createJWKMock('http://localhost:5501')
    connection = await AppDataSource.initialize()

    tenantRepo = connection.getRepository(Tenant)
    tenantService = new TenantService(tenantRepo)
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
    it('should return array of tenants + test catch block', async () => {
      // test try block
      const response = await request(app).get('/tenants').send()
      expect(response.statusCode).toBe(200)
      expect(response.body).toBeInstanceOf(Array)

      // test catch block
      const jestspy = jest
        .spyOn(tenantRepo, 'find')
        .mockRejectedValue(
          new Error('Failed to fetch tenants from the database'),
        )

      await expect(tenantService.getAll()).rejects.toThrow(
        'Failed to fetch tenants from the database',
      )
    })
  })
})
