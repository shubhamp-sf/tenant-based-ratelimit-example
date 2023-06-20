// Copyright (c) 2023 Sourcefuse Technologies
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, juggler, repository} from '@loopback/repository';
import {
  DefaultUserModifyCrudRepository,
  IAuthUserWithPermissions,
} from '@sourceloop/core';
import {AuthenticationBindings} from 'loopback4-authentication';

import {
  AuthDbSourceName,
  Tenant,
  TenantConfig,
  TenantRepository,
} from '@sourceloop/authentication-service';
import {CacheManager} from '@sourceloop/cache';
import {RedisDataSource} from '../datasources';

export class TenantConfigRepository extends CacheManager.CacheRepositoryMixin(
  DefaultUserModifyCrudRepository<
    TenantConfig,
    typeof TenantConfig.prototype.id,
    {}
  >,
  {prefix: 'tenant-config', ttl: 24 * 60 * 60 * 100 /* 24 hours */},
) {
  public readonly tenant: BelongsToAccessor<
    Tenant,
    typeof TenantConfig.prototype.id
  >;

  constructor(
    @inject(`datasources.${AuthDbSourceName}`) dataSource: juggler.DataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    protected readonly getCurrentUser: Getter<
      IAuthUserWithPermissions | undefined
    >,
    @repository.getter('TenantRepository')
    protected tenantRepositoryGetter: Getter<TenantRepository>,
    @inject.getter(`datasources.${RedisDataSource.dataSourceName}`)
    public getCacheDataSource: Getter<RedisDataSource>,
  ) {
    super(TenantConfig, dataSource, getCurrentUser);
    this.tenant = this.createBelongsToAccessorFor(
      'tenant',
      tenantRepositoryGetter,
    );
    this.registerInclusionResolver('tenant', this.tenant.inclusionResolver);
  }
}
