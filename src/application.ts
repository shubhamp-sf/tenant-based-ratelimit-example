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

import {AuthenticationServiceComponent} from '@sourceloop/authentication-service';
import {
  RateLimitSecurityBindings,
  RateLimiterComponent,
} from 'loopback4-ratelimiter';
import path from 'path';
import {MySequence} from './sequence';

export {ApplicationConfig};

export class AuthMultitenantExampleApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });

    this.component(RestExplorerComponent);

    console.log(process.env.RATE_LIMITER_WINDOW_MS);
    console.log(process.env.RATE_LIMITER_MAX_REQS);

    // this.bind(RateLimitSecurityBindings.RATELIMITCONFIG).to({
    //   RatelimitActionMiddleware: true,
    // });

    this.component(RateLimiterComponent);
    this.bind(RateLimitSecurityBindings.CONFIG).to({
      name: 'ratelimit',
      type: 'RedisStore',
      max: parseInt(process.env.RATE_LIMITER_MAX_REQS as string),
      windowMs: parseInt(process.env.RATE_LIMITER_WINDOW_MS as string),
      keyGenerator: function (req: Request) {
        console.log(req.ip);
        return req.ip;
      },
    });

    this.component(AuthenticationServiceComponent);

    this.sequence(MySequence);

    // this.bind(AuthorizationBindings.CASBIN_ENFORCER_CONFIG_GETTER).toProvider(
    //   CasbinEnforcerConfigProvider,
    // );

    // this.bind(AuthorizationBindings.CASBIN_RESOURCE_MODIFIER_FN).toProvider(
    //   CasbinResValModifierProvider,
    // );
    // this.bind(AuthorizationBindings.CASBIN_AUTHORIZE_ACTION).toProvider(
    //   CasbinAuthorizationProvider,
    // );
    // this.bind(AuthorizationBindings.USER_PERMISSIONS).toProvider(
    //   UserPermissionsProvider,
    // );

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
