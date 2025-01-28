import { factoryPermission, BaseActions, BaseConditions, CheckPermissions, SubscribedCheckPermissions } from 'permission-js-core'
import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react'

import { PermissionProviderProps, ReturnFactoryPermission } from './types'
import { typedMemo } from './utils/typedMemo'

export function factoryReactPermission<S extends string, A extends BaseActions<S>, C extends BaseConditions<S>>() {
  const Context = createContext<ReturnFactoryPermission<S, A, C> | null>(null)

  const PermissionProvider = ({ children }: PermissionProviderProps<S, A, C>) => {
    const [contextValue] = useState(() => factoryPermission<S, A, C>())

    const currentChidlren = typeof children === 'function' ? children(contextValue.update) : children

    return <Context.Provider value={contextValue}>{currentChidlren}</Context.Provider>
  }

  const useStrictContext = () => {
    const context = useContext(Context)

    if (!context) throw new Error('Use context without PermissionProvider')

    return context
  }

  const usePermission = () => {
    const { can, update } = useStrictContext()  

    return { can, update }
  }

  const useSubscribePermission = <Subjects extends S, Action extends A[Subjects]>(props: SubscribedCheckPermissions<Subjects, Action, C>)() => {
    const { subscribe } = useStrictContext()
    const [can] = useState(() => subscribe(), [subscribe])

      const [, setSignal] = useState(false)


    const trigger = useCallback(() => {
      setSignal(state => !state)
    }, [])

    const can = useCallback(
      <Subjects extends S, Action extends A[Subjects]>(args: CheckPermissions<Subjects, Action, C>) => {
        return subscribedCheck({ ...args, signal: trigger })
      },
      [subscribedCheck, trigger],
    )
  }

  const Can = typedMemo(
    <Subjects extends S, Action extends A[Subjects]>({
      children,
      element = null,
      ...args
    }: PropsWithChildren<
      CheckPermissions<Subjects, Action, C> & {
        element?: React.ReactNode
      }
    >): React.ReactNode => {
      const { can } = usePermission()

      const arrArgs = Object.values(args)
      const result = useMemo(() => can(args), [...arrArgs, can])

      if (result) {
        return children
      }

      return element
    },
  )

  return {
    usePermission,
    Can,
    PermissionProvider,
  }
}
