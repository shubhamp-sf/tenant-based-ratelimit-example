// Copyright (c) 2022 Sourcefuse Technologies
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import {Getter, inject} from '@loopback/core';
import {
  AuthDbSourceName,
  AuthenticationBindings,
} from '@sourceloop/authentication-service';
import {
  DefaultUserModifyCrudRepository,
  IAuthUserWithPermissions,
} from '@sourceloop/core';
import {PgdbDataSource} from '../datasources';
import {ToDo} from '../models';

export class ToDoRepository extends DefaultUserModifyCrudRepository<
  ToDo,
  typeof ToDo.prototype.id
> {
  constructor(
    @inject(`datasources.${AuthDbSourceName}`) dataSource: PgdbDataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    getCurrentUser: Getter<IAuthUserWithPermissions>,
  ) {
    super(ToDo, dataSource, getCurrentUser);
  }
}
