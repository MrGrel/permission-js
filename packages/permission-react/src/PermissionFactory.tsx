import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import {
  PermissionBuilder,
  BaseActions,
  BaseConditions,
  CheckPermissions,
} from "permission-js-core";

import { typedMemo } from "./utils/typedMemo";

export const reactFactoryPermission = <
  S extends string,
  A extends BaseActions<S>,
  C extends BaseConditions<S>
>() => {
  const Context = createContext<PermissionBuilder<S, A, C> | null>(null);

  const PermissionProvider = ({ children }: { children: React.ReactNode }) => {
    const [contextValue] = useState(() => new PermissionBuilder<S, A, C>());

    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
  };

  const usePermission = () => {
    const context = useContext(Context);
    if (!context)
      throw new Error("Use subscribing check without PermissionProvider");

    const { subscribedCheck, update } = context;
    const [signal, setSignal] = useState(false);

    const trigger = useCallback(() => {
      setSignal((prev) => !prev);
    }, [signal]);

    const can = useCallback(
      <Subjects extends S, Action extends A[Subjects]>(
        args: CheckPermissions<Subjects, Action, C>
      ) => {
        return subscribedCheck({ ...args, signal: trigger });
      },
      [setSignal]
    );

    return { can, update };
  };

  const Can = typedMemo(
    <Subjects extends S, Action extends A[Subjects]>({
      children,
      element = null,
      ...args
    }: CheckPermissions<Subjects, Action, C> & {
      children: React.ReactNode;
      element?: React.ReactNode;
    }): React.ReactNode => {
      const { can } = usePermission();

      const result = can(args);

      if (result) {
        return children;
      }

      return element;
    }
  );

  return {
    usePermission,
    Can,
    PermissionProvider,
  };
};
