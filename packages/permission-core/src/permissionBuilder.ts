import { SubscribeManager } from './subscribeManager'
import {
  Rules,
  BaseActions,
  BaseConditions,
  CheckPermissions,
  ConvertRecordValue,
  SubscribedCheckPermissions,
  UnsubscribePermssions,
  PrevSignal,
} from './types'
import { autoBind } from './utils/autoBind'
import { stringPairHandler } from './utils/stringPairHandler'
import { DeepPartial } from './utils/types'

export class PermissionBuilder<S extends string, A extends BaseActions<S>, C extends BaseConditions<S>> {
  private rules: Rules<S, A, C> | null
  private subscribeManager: SubscribeManager<S, A[S][number]> = new SubscribeManager()

  constructor(rules: DeepPartial<Rules<S, A, C>> = null!) {
    autoBind(this)
    this.rules = rules as Rules<S, A, C>
  }

  update<Subject extends S>(
    subject: Subject,
    action: A[Subject][number],
    value: Rules<S, A, C>[Subject][A[Subject][number]],
  ) {
    if (!this.rules) {
      this.rules = {} as Rules<S, A, C>
    }

    if (!this.rules?.[subject]) {
      this.rules[subject] = {} as Rules<S, A, C>[Subject]
    }

    if (this.rules?.[subject] && this.rules[subject]?.[action] !== value) {
      this.rules[subject][action] = value

      this.subscribeManager.call(subject, action)
    }
  }

  subscribedCheck<Subjects extends S, Action extends A[Subjects]>({
    signal,
    prevSignal,
    ...args
  }: SubscribedCheckPermissions<Subjects, Action, C> & PrevSignal): boolean {
    if (prevSignal) {
      this.removeSubscribe({ subject: args.subject, action: args.action, prevSignal })
    }
    this.setSubscribe({ subject: args.subject, action: args.action, signal })

    return this.checkPermission(args as CheckPermissions<S, A[S], C>)
  }

  private setSubscribe({ subject, action, signal }: SubscribedCheckPermissions<S, A[S], C>) {
    const setTrigger = (subject: S, action: A[S][number]) => {
      this.subscribeManager.set(subject, action, signal)
    }

    stringPairHandler(subject, action, setTrigger, 'forEach', null)
  }

  private removeSubscribe({ subject, action, prevSignal }: UnsubscribePermssions<S, A[S], C>) {
    const removeTrigger = (subject: S, action: A[S][number]) => {
      this.subscribeManager.remove(subject, action, prevSignal)
    }

    stringPairHandler(subject, action, removeTrigger, 'forEach', null)
  }

  checkPermission({ subject, action, conditions, mode = 'some' }: CheckPermissions<S, A[S], C>): boolean {
    const checkPermissionsCb = (subject: S, action: A[S][number]) => {
      return this.checkPermissions(subject, action, conditions)
    }

    return stringPairHandler(subject, action, checkPermissionsCb, mode, false)
  }

  private checkPermissions(subject: S, action: A[S][number], conditions?: C[S] | ConvertRecordValue<C[S]>): boolean {
    if (!this.rules) return false

    const selfSubject = this.rules?.[subject]

    if (!selfSubject) {
      return false
    }

    const permission = selfSubject?.[action]

    if (typeof permission === 'boolean') {
      return permission
    }

    if (permission && typeof permission === 'object' && conditions) {
      const typedPermission = permission as unknown as C[S]
      const keys = Object.keys(typedPermission) as (keyof C[S])[]

      return keys.every(key => {
        if (Array.isArray(conditions[key])) {
          return conditions[key].some((val: C[S][string]) => val === typedPermission[key])
        }

        return typedPermission[key] === conditions[key]
      })
    }

    return false
  }
}

type keys = 'image' | 'article' | 'comment' | 'like'
interface Actions {
  image: ['upload', 'download']
  article: ['create', 'update', 'delete']
  comment: ['create', 'update', 'delete']
  like: ['create', 'delete']
}

interface TBaseConditions {
  image: never
  article: never
  comment: never
  like: never
}
const { subscribedCheck } = new PermissionBuilder<keys, Actions, TBaseConditions>()
subscribedCheck({
  subject: 'image',
  action: ['download', 'upload'],
  signal: () => {},
})
