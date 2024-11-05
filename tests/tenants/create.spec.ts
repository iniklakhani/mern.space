import createJWKMock from 'mock-jwks'
import request from 'supertest'
import { DataSource } from 'typeorm'
import app from '../../src/app'
import { AppDataSource } from '../../src/config/data-source'
import { Roles } from '../../src/constants'
import { Tenant } from '../../src/entity/Tenant'

describe('POST /tenants', () => {
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

  afterEach(async () => {
    jwks.stop()
  })

  afterAll(async () => {
    await connection.destroy()
  })

  describe('Given all fields', () => {
    it('should return a 201 status code', async () => {
      const tenantData = { name: 'Tenant Name', address: 'Tenant Address' }
      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData)
      expect(response.statusCode).toBe(201)
    })

    it('should create a tenant in the database', async () => {
      const tenantData = { name: 'Tenant Name', address: 'Tenant Address' }
      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData)

      const tenantRepo = connection.getRepository(Tenant)
      const tenants = await tenantRepo.find()

      expect(tenants).toHaveLength(1)
      expect(tenants[0].name).toBe(tenantData.name)
      expect(tenants[0].address).toBe(tenantData.address)
    })

    it('should 401 if user is not authenticated', async () => {
      const tenantData = { name: 'Tenant Name', address: 'Tenant Address' }
      const response = await request(app).post('/tenants').send(tenantData)
      expect(response.statusCode).toBe(401)

      const tenantRepo = connection.getRepository(Tenant)
      const tenants = await tenantRepo.find()

      expect(tenants).toHaveLength(0)
    })

    it('should return 403 if user is non an admin', async () => {
      const managerToken = jwks.token({
        sub: '1',
        role: Roles.MANAGER,
      })

      const tenantData = { name: 'Tenant Name', address: 'Tenant Address' }
      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${managerToken}`])
        .send(tenantData)
      expect(response.statusCode).toBe(403)

      const tenantRepo = connection.getRepository(Tenant)
      const tenants = await tenantRepo.find()

      expect(tenants).toHaveLength(0)
    })

    it('should return 400 if tenant name is not provided', async () => {
      const tenantData = { name: '', address: 'Tenant Address' }
      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData)

      expect(response.statusCode).toBe(400)
    })

    it('should return 400 if tenant address is not provided', async () => {
      const tenantData = { name: 'Tenant Name', address: '' }
      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData)

      expect(response.statusCode).toBe(400)
    })

    it('should return 200 while getting single tenant by Id', async () => {
      const tenantData = { name: 'Tenant Name', address: 'Tenant Address' }
      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData)
      const newTenantId = response.body.id

      const newTenant = await request(app)
        .get(`/tenants/${newTenantId}`)
        .set('Cookie', [`accessToken=${adminToken}`])

      expect(newTenant.statusCode).toBe(200)
      expect(newTenant.body.id).toBe(newTenantId)
    })
  })
})
