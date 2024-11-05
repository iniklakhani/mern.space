import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express'
import { AppDataSource } from '../config/data-source'
import logger from '../config/logger'
import { Roles } from '../constants'
import { TenantController } from '../controllers/TenantController'
import { Tenant } from '../entity/Tenant'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { TenantService } from '../services/TenantService'
import { CreateTenantRequest } from '../types'
import tenantValidator from '../validators/tenant-validator'

const router = express.Router()

const tenantRepo = AppDataSource.getRepository(Tenant)
const tenantService = new TenantService(tenantRepo)
const tenantController = new TenantController(tenantService, logger)

router.post(
  '/',
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  ((req: CreateTenantRequest, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next)) as RequestHandler,
)

router.get('/', ((req: Request, res: Response, next: NextFunction) =>
  tenantController.getAll(req, res, next)) as RequestHandler)

router.get('/:id', authenticate as RequestHandler, canAccess([Roles.ADMIN]), ((
  req: Request,
  res: Response,
  next: NextFunction,
) => tenantController.getOne(req, res, next)) as RequestHandler)

router.patch(
  '/:id',
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  ((req: CreateTenantRequest, res: Response, next: NextFunction) =>
    tenantController.update(req, res, next)) as RequestHandler,
)

router.delete(
  '/:id',
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  ((req: Request, res: Response, next: NextFunction) =>
    tenantController.deleteOne(req, res, next)) as RequestHandler,
)

export default router
