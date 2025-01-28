import { createProxyPermissionObject } from './createProxyPermissionObject'
import { PermissionBuilder } from './permissionBuilder'
import { BaseActions, BaseConditions, SubscribedCheckPermissions } from './types'

export const factoryPermission = <S extends string, A extends BaseActions<S>, C extends BaseConditions<S>>() => {
  const { checkPermission, subscribedCheck, update, removeSubscribe } = new PermissionBuilder<S, A, C>()

  const finalization = new FinalizationRegistry<(() => void) | undefined>(destroy => destroy?.())

  const subscribe = <Subjects extends S, Action extends A[Subjects]>(
    props: SubscribedCheckPermissions<Subjects, Action, C>,
  ) => {
    const proxy = createProxyPermissionObject(props, subscribedCheck, finalization.register, subscribedCheck)

    finalization.register(proxy, proxy.destroy)

    return proxy.check
  }

  return { can: checkPermission, subscribe, removeSubscribe, update }
}
