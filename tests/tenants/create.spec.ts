import request from 'supertest'
import { DataSource } from 'typeorm'
import app from '../../src/app'
import { AppDataSource } from '../../src/config/data-source'

describe('POST /tenants', () => {
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
    it('should return a 201 status code', async () => {
      const tenantData = { name: 'Tenant Name', address: 'Tenant Address' }
      const response = await request(app).post('/tenants').send(tenantData)
      expect(response.statusCode).toBe(201)
    })
  })
})
