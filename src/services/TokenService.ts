import fs from 'fs'
import createHttpError from 'http-errors'
import { JwtPayload, sign } from 'jsonwebtoken'
import path from 'path'
import { Repository } from 'typeorm'
import { Config } from '../config'
import { RefreshToken } from '../entity/RefreshToken'
import { User } from '../entity/User'

export class TokenService {
  constructor(private refreshTokenRepo: Repository<RefreshToken>) {}
  generateAccessToken(payload: JwtPayload) {
    let privateKey: Buffer
    try {
      privateKey = fs.readFileSync(
        path.join(__dirname, '../../certs/private.pem'),
      )
    } catch {
      const error = createHttpError(500, 'Error while reading private key')
      throw error
    }

    const accessToken = sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
      issuer: 'auth-service',
    })

    return accessToken
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: 'HS256',
      expiresIn: '1y',
      issuer: 'auth-service',
      jwtid: String(payload.id),
    })

    return refreshToken
  }

  async persistRefreshToken(user: User) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365 // 1Y (TODO: change for leap year);
    const newRefreshToken = await this.refreshTokenRepo.save({
      user: user,
      expiresAt: new Date(Date.now() + MS_IN_YEAR),
    })
    return newRefreshToken
  }
}