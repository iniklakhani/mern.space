import { Repository } from 'typeorm'
import { Tenant } from '../entity/Tenant'
import { ITenant } from './../types'
export class TenantService {
  constructor(private tenantRepo: Repository<Tenant>) {}

  async create(tenantData: ITenant) {
    return await this.tenantRepo.save(tenantData)
  }

  async getAll() {
    return await this.tenantRepo.find()
  }
}
