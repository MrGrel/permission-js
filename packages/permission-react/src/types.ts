import { BaseActions, BaseConditions, factoryPermission } from 'permission-js-core'

export type ReturnFactoryPermission<
  S extends string,
  A extends BaseActions<S>,
  C extends BaseConditions<S>,
> = ReturnType<typeof factoryPermission<S, A, C>>
export interface PermissionProviderProps<S extends string, A extends BaseActions<S>, C extends BaseConditions<S>> {
  children: React.ReactNode | ((update: ReturnFactoryPermission<S, A, C>['update']) => React.ReactNode)
}
