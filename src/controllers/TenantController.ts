import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import createHttpError from 'http-errors'
import { Logger } from 'winston'
import { TenantService } from '../services/TenantService'
import { CreateTenantRequest } from '../types'

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}

  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
    }

    const { name, address } = req.body

    try {
      const tenant = await this.tenantService.create({ name, address })
      this.logger.info('Tenant has been created', { id: tenant.id })
      res.status(201).json({ id: tenant.id })
    } catch (error) {
      next(error)
      return
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenants = await this.tenantService.getAll()
      res.json(tenants)
    } catch (err) {
      next(err)
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id
    if (isNaN(Number(tenantId))) {
      const error = createHttpError(400, 'Invalid request.')
      next(error)
      return
    }

    try {
      const tenant = await this.tenantService.getOne(Number(tenantId))
      if (!tenant) {
        const error = createHttpError(404, 'Tenant not found.')
        next(error)
        return
      }

      res.json(tenant)
    } catch (err) {
      next(err)
      return
    }
  }
}
