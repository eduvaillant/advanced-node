import { PgUser } from '@/infra/postgres/entities'
import { PgUserAccountRepository } from '@/infra/postgres/repos'

import { IBackup, IMemoryDb, newDb } from 'pg-mem'
import { getConnection, getRepository, Repository } from 'typeorm'

const makeFakeDb = async (entities?: any[]): Promise<IMemoryDb> => {
  const db = newDb()
  const connection = await db.adapters.createTypeormConnection({
    type: 'postgres',
    entities: entities ?? ['src/infra/postgres/entities/index.ts']
  })
  await connection.synchronize()
  return db
}

describe('PgUserAccountRepository', () => {
  describe('load', () => {
    let sut: PgUserAccountRepository
    let pgUserRepo: Repository<PgUser>
    let backup: IBackup

    beforeAll(async () => {
      const db = await makeFakeDb([PgUser])
      backup = db.backup()
      pgUserRepo = getRepository(PgUser)
    })

    afterAll(async () => {
      await getConnection().close()
    })

    beforeEach(() => {
      backup.restore()
      sut = new PgUserAccountRepository()
    })

    it('should return an account if email exists', async () => {
      await pgUserRepo.save({ email: 'existing_email' })

      const account = await sut.load({ email: 'existing_email' })

      expect(account).toEqual({ id: '1' })
    })

    it('should return an undefined if email does not exists', async () => {
      const account = await sut.load({ email: 'inexistent_email' })

      expect(account).toBeUndefined()
    })
  })
})