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
      const tenant = await this.tenantService.getById(Number(tenantId))
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

  async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
    }

    const { name, address } = req.body
    const tenantId = req.params.id

    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, 'Invalid request.'))
      return
    }

    try {
      await this.tenantService.update(Number(tenantId), {
        name,
        address,
      })

      this.logger.info('Tenant has been updated.', { id: tenantId })

      res.json({ id: Number(tenantId) })
    } catch (error) {
      next(error)
      return
    }
  }

  async deleteOne(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id
    if (isNaN(Number(tenantId))) {
      const error = createHttpError(400, 'Invalid request.')
      next(error)
      return
    }

    try {
      const tenant = await this.tenantService.deleteById(Number(tenantId))
      if (!tenant.affected) {
        const error = createHttpError(404, 'Tenant not found.')
        next(error)
        return
      }

      this.logger.info('Tenant has been deleted', { id: Number(tenantId) })
      res.json({ id: Number(tenantId) })
    } catch (err) {
      next(err)
      return
    }
  }
}
