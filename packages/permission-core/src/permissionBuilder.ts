import {
  Rules,
  BaseActions,
  BaseConditions,
  CheckPermissions,
  ConvertRecordValue,
  SubscribedCheckPermissions,
} from './types'

import { autoBind } from './utils/autoBind'
import { DeepPartial } from './utils/types'
import { SubscribeManager } from './utils/subscribeManager'
import { stringPairHandler } from './utils/stringPairHandler'

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

    if (!this.rules[subject]) {
      this.rules[subject] = {} as Rules<S, A, C>[Subject]
    }

    if (this.rules[subject] && this.rules[subject][action] !== value) {
      this.rules[subject][action] = value

      this.subscribeManager.call(subject, action)
    }
  }

  subscribedCheck<Subjects extends S, Action extends A[Subjects]>({
    signal,
    ...args
  }: SubscribedCheckPermissions<Subjects, Action, C> & {
    signal: () => void
  }): boolean {
    const typedArgs = args as CheckPermissions<S, A[Subjects], C>

    this.setSubscribers

    return this.checkPermission(typedArgs)
  }

  private setSubscribers({ subject, action, signal }: SubscribedCheckPermissions<S, A[S], C>) {
    const setTrigger = (subject: S, action: A[S][number]) => {
      if (this.hasAction(subject, action)) {
        this.subscribeManager.set(subject, action, signal)
      }
    }

    stringPairHandler(subject, action, setTrigger, 'forEach', null)
  }

  private hasAction = (subject: S, action: A[S][number]) => {
    return !!this.rules?.[subject]?.[action] !== undefined
  }

  checkPermission({ subject, action, conditions, mode = 'some' }: CheckPermissions<S, A[S], C>): boolean {
    const checkPermissionsCb = (subject: S, action: A[S][number]) => {
      return this.checkPermissions(subject, action, conditions)
    }

    return stringPairHandler(subject, action, checkPermissionsCb, mode, false)
  }

  private checkPermissions(subject: S, action: A[S][number], conditions?: C[S] | ConvertRecordValue<C[S]>): boolean {
    if (!this.rules) return false

    const selfSubject = this.rules[subject]

    if (!selfSubject) {
      return false
    }

    const permission = selfSubject[action]

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
