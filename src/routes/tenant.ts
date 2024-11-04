import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express'
import { AppDataSource } from '../config/data-source'
import logger from '../config/logger'
import { TenantController } from '../controllers/TenantController'
import { Tenant } from '../entity/Tenant'
import authenticate from '../middlewares/authenticate'
import { TenantService } from '../services/TenantService'
import { CreateTenantRequest } from '../types'

const router = express.Router()

const tenantRepo = AppDataSource.getRepository(Tenant)
const tenantService = new TenantService(tenantRepo)
const tenantController = new TenantController(tenantService, logger)

router.post(
  '/',
  ((req: Request, res: Response, next: NextFunction) => {
    return authenticate(req, res, next)
  }) as RequestHandler,
  (req: CreateTenantRequest, res: Response, next: NextFunction) => {
    return tenantController.create(req, res, next)
  },
)

export default router
