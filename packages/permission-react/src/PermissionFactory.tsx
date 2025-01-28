import { factoryPermission, BaseActions, BaseConditions, CheckPermissions } from 'permission-js-core'
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react'

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

  const useSubscribePermission = <Subjects extends S, Action extends A[Subjects]>(
    props: CheckPermissions<Subjects, Action, C>,
  ) => {
    const { subscribe, removeSubscribe } = useStrictContext()
    const [trigger, setTrigger] = useState(false)

    const signal = useCallback(() => {
      setTrigger(state => !state)
    }, [])

    const [can, setSubscribe] = useState(() => subscribe({ ...props, signal }))

    const arrProps = useMemo(() => Object.values(props), [props])

    useEffect(() => {
      setSubscribe(subscribe({ ...props, signal }))

      return () => removeSubscribe({ action: props.action, subject: props.subject, signal })
    }, [trigger, ...arrProps, removeSubscribe, subscribe])

    return can
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
      const can = useSubscribePermission(args)

      const result = useMemo(() => can(), [can])

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
