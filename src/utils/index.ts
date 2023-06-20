import {Request} from '@loopback/rest';
import {ConfigKey} from '@sourceloop/core';
import {AuthMultitenantExampleApplication} from '../application';
import {TenantConfigRepository} from '../repositories';

export const hasToken = (req: Request) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  return token ?? false;
};

export const getTenantId = (req: Request): string => {
  const token = hasToken(req);
  if (!token) {
    throw Error('Authorization Headers are not present');
  }
  const userData = JSON.parse(atob(token?.split('.')[1] ?? ''));
  return userData.tenantId;
};

export const getRatelimitForTenant = async (
  req: Request,
  app: AuthMultitenantExampleApplication,
): Promise<number | null> => {
  const configRepository = await app.getRepository(TenantConfigRepository);
  if (!hasToken(req)) {
    return null;
  }
  const tenantId = getTenantId(req);
  const tenantRatelimitConfig = await configRepository.findOne({
    where: {
      configKey: 'ratelimit' as ConfigKey,
      tenantId: getTenantId(req),
    },
  });

  if (!tenantRatelimitConfig?.configValue) {
    console.log('Ratelimit config not present for tenantId', tenantId);
    return null;
  }
  const ratelimitConfig: {max?: number} = tenantRatelimitConfig.configValue;

  console.log(
    'Got max',
    ratelimitConfig.max,
    'requests allowed for tenantId:',
    tenantId,
  );
  return ratelimitConfig.max ?? null;
};
