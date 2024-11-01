import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express'
import { AppDataSource } from '../config/data-source'
import logger from '../config/logger'
import { AuthController } from '../controllers/AuthController'
import { RefreshToken } from '../entity/RefreshToken'
import { User } from '../entity/User'
import authenticate from '../middlewares/authenticate'
import { CredentialService } from '../services/CredentialService'
import { TokenService } from '../services/TokenService'
import { UserService } from '../services/UserService'
import { AuthRequest } from '../types'
import loginValidator from '../validators/login-validator'
import registerValidator from '../validators/register-validator'

const router = express.Router()
const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const refreshTokenRepo = AppDataSource.getRepository(RefreshToken)
const tokenService = new TokenService(refreshTokenRepo)
const credentialService = new CredentialService()

const authController = new AuthController(
  userService,
  logger,
  tokenService,
  credentialService,
)

router.post('/register', registerValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return await authController.register(req, res, next)
}) as RequestHandler)

router.post('/login', loginValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return await authController.login(req, res, next)
}) as RequestHandler)

router.get(
  '/self',
  (async (req: Request, res: Response, next: NextFunction) => {
    return await authenticate(req, res, next)
  }) as RequestHandler,
  (req: Request, res: Response) => authController.self(req as AuthRequest, res),
)

export default router
