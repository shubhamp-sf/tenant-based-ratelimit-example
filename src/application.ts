// Copyright (c) 2022 Sourcefuse Technologies
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {Request, RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';

import {
  AuthenticationServiceComponent,
  AuthorizationBindings,
} from '@sourceloop/authentication-service';
import {
  CachePluginComponent,
  CachePluginComponentBindings,
  CachePluginComponentOptions,
  CacheStrategyTypes,
} from '@sourceloop/cache';
import {SecureSequence} from '@sourceloop/core';
import {
  CasbinAuthorizationProvider,
  UserPermissionsProvider,
} from 'loopback4-authorization';
import {RateLimitSecurityBindings} from 'loopback4-ratelimiter';
import path from 'path';
import {RatelimitDataSource} from './datasources';
import {
  CasbinEnforcerConfigProvider,
  CasbinResValModifierProvider,
} from './providers';
import {getRatelimitForTenant, getTenantId, hasToken} from './utils';

export {ApplicationConfig};

export class AuthMultitenantExampleApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    const cacheOptions: CachePluginComponentOptions = {
      cacheProvider: CacheStrategyTypes.Redis,
      prefix: 'sourceloop',
      ttl: 24 * 60 * 60 * 100,
    };

    this.configure(CachePluginComponentBindings.COMPONENT).to(cacheOptions);
    this.component(CachePluginComponent);

    this.bind(RateLimitSecurityBindings.CONFIG).to({
      name: RatelimitDataSource.dataSourceName,
      type: 'RedisStore',
      max: async (req: Request) => {
        return (
          (await getRatelimitForTenant(req, this)) ??
          parseInt(process.env.RATE_LIMITER_MAX_REQS as string)
        );
      },
      windowMs: parseInt(process.env.RATE_LIMITER_WINDOW_MS as string),
      keyGenerator: (req: Request) => {
        if (!hasToken(req)) {
          return req.ip;
        }
        return getTenantId(req);
      },
      enabledByDefault: true,
    });

    this.component(AuthenticationServiceComponent); // already binds core component which binds ratelimit component
    this.sequence(SecureSequence);

    this.bind(AuthorizationBindings.CASBIN_ENFORCER_CONFIG_GETTER).toProvider(
      CasbinEnforcerConfigProvider,
    );

    this.bind(AuthorizationBindings.CASBIN_RESOURCE_MODIFIER_FN).toProvider(
      CasbinResValModifierProvider,
    );
    this.bind(AuthorizationBindings.CASBIN_AUTHORIZE_ACTION).toProvider(
      CasbinAuthorizationProvider,
    );
    this.bind(AuthorizationBindings.USER_PERMISSIONS).toProvider(
      UserPermissionsProvider,
    );

    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });

    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
