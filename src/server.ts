import app from './app'
import { Config } from './config'
import { AppDataSource } from './config/data-source'
import logger from './config/logger'
import { Roles } from './constants'
import { User } from './entity/User'

const startServer = async () => {
  const PORT = Config.PORT
  try {
    const connection = await AppDataSource.initialize()
    logger.info('Database connected successfully!')

    // START: Create an admin user
    const userRepo = connection.getRepository(User)
    const isAdminExist = await userRepo.find({ where: { role: Roles.ADMIN } })
    if (!isAdminExist.length) {
      const admin = await userRepo.save({
        firstName: Config.ADMIN_FIRST_NAME,
        lastName: Config.ADMIN_LAST_NAME,
        email: Config.ADMIN_EMAIL,
        password: Config.ADMIN_PASSWORD,
        role: Roles.ADMIN,
      })
      logger.info('Admin user created successfully.', { id: admin.id })
    }
    // END: Create an admin user

    app.listen(PORT, () => {
      logger.info('Server is up and running!', {
        port: PORT,
      })
    })
  } catch (error) {
    logger.error('Could not start the server', { error })
    process.exit(1)
  }
}

void startServer()
