import _ from 'lodash';
import { EntityManager } from 'typeorm';

import { db } from '..';

export function withLockedTable<T>(
  tables: string | string[],
  call: (m: EntityManager) => Promise<T>,
): Promise<T> {
  return db.transaction(async manager => {
    for (const t of _.castArray(tables)) {
      await manager.query(`LOCK TABLE "${t}" IN SHARE ROW EXCLUSIVE MODE`);
    }
    return call(manager);
  });
}
