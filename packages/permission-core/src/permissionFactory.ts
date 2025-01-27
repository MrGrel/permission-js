import { PermissionBuilder } from './permissionBuilder'
import { BaseActions, BaseConditions, SubscribedCheckPermissions } from './types'

export const factoryPermission = <S extends string, A extends BaseActions<S>, C extends BaseConditions<S>>() => {
  const { checkPermission, subscribedCheck, update } = new PermissionBuilder<S, A, C>()

  const subscribe = () => {
    let prevSignal: () => void

    return <Subjects extends S, Action extends A[Subjects]>(props: SubscribedCheckPermissions<Subjects, Action, C>) => {
      const result = subscribedCheck({ ...props, prevSignal })
      prevSignal = props.signal

      return result
    }
  }

  return { can: checkPermission, subscribe, update }
}
