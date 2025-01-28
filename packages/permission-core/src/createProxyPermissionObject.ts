import {
  BaseActions,
  BaseConditions,
  CheckPermissions,
  ConvertRecordValue,
  Destroy,
  Signal,
  SubscribedCheckPermissions,
} from './types'
import { autoBind } from './utils/autoBind'

export class PermissionObject<S extends string, A extends BaseActions<S>[S], C extends BaseConditions<S>>
  implements SubscribedCheckPermissions<S, A, C>
{
  subject: S
  action
  conditions?: C[S] | ConvertRecordValue<C[S]> | undefined
  mode?: 'some' | undefined
  signal: () => void
  destroy?: () => void

  constructor(
    prop: SubscribedCheckPermissions<S, A, C>,
    public checkPermissions: <Subjects extends S, Action extends A>(
      args: CheckPermissions<Subjects, Action, C, 'some'> & Signal & Destroy,
    ) => boolean,
  ) {
    autoBind(this)

    this.action = prop.action
    this.subject = prop.subject
    this.conditions = prop.conditions
    this.mode = prop.mode
    this.signal = prop.signal
  }
  setDestroy(cb: Destroy['destroy']) {
    this.destroy = cb
  }

  check() {
    return this.checkPermissions({
      subject: this.subject,
      action: this.action,
      conditions: this.conditions,
      mode: this.mode,
      signal: this.signal,
      setDestroy: this.setDestroy,
    })
  }
}

export function createProxyPermissionObject<S extends string, A extends BaseActions<S>[S], C extends BaseConditions<S>>(
  prop: SubscribedCheckPermissions<S, A, C>,
  checkPermissions: <Subjects extends S, Action extends A>(
    args: CheckPermissions<Subjects, Action, C, 'some'> & Signal & Destroy,
  ) => boolean,
  register: (target: WeakKey, heldValue: (() => void) | undefined) => void,
  subscribedCheck: ({ signal, destroy, ...args }: SubscribedCheckPermissions<S, A, C> & Destroy) => boolean,
): PermissionObject<S, A, C> & Destroy & { check: () => boolean } {
  return new Proxy<PermissionObject<S, A, C>>(new PermissionObject<S, A, C>(prop, checkPermissions), {
    get(target, prop: keyof PermissionObject<S, A, C>, receiver) {
      console.log(`Getting ${String(prop)}`)
      return Reflect.get(target, prop, receiver)
    },
    set(target, prop: keyof PermissionObject<S, A, C>, value, receiver) {
      console.log(`Setting ${String(prop)} to ${value}`)
      if (prop === 'destroy') {
        register(target, value)
      }
      if (prop !== 'destroy' && target[prop] !== value) {
        target.destroy?.()
        target.destroy = undefined
        target.check = () =>
          subscribedCheck({
            action: target.action,
            subject: target.subject,
            conditions: target.conditions,
            mode: target.mode,
            signal: target.signal,
            destroy: target.destroy,
            setDestroy: target.setDestroy,
          })
      }
      const result = Reflect.set(target, prop, value, receiver)
      if (!result) {
        console.error(`Failed to set ${String(prop)}`)
      }
      return result
    },
  })
}
