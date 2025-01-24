import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react'

import { PermissionBuilder, BaseActions, BaseConditions, CheckPermissions } from 'permission-js-core'
import { typedMemo } from './utils/typedMemo'

export function reactFactoryPermission<S extends string, A extends BaseActions<S>, C extends BaseConditions<S>>() {
  const Context = createContext<PermissionBuilder<S, A, C> | null>(null)

  const PermissionProvider = ({ children }: PropsWithChildren) => {
    const [contextValue] = useState(() => new PermissionBuilder<S, A, C>())

    return <Context.Provider value={contextValue}>{children}</Context.Provider>
  }

  function usePermission() {
    const context = useContext(Context)
    if (!context) throw new Error('Use subscribing check without PermissionProvider')

    const { subscribedCheck, update } = context
    const [signal, setSignal] = useState(false)

    const trigger = useCallback(() => {
      setSignal(prev => !prev)
    }, [signal])

    const can = useCallback(
      <Subjects extends S, Action extends A[Subjects]>(args: CheckPermissions<Subjects, Action, C>) => {
        return subscribedCheck({ ...args, signal: trigger })
      },
      [trigger],
    )

    return { can, update }
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

      const result = useMemo(() => can(args), [can])

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

export const callChlen = () => 'chlen' 