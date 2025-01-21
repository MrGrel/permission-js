import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { PermissionBuilder } from "@permission-js/core";
import {
  BaseActions,
  BaseConditions,
  SubscribedCheckPermissions,
  CheckPermissions,
  Subsets,
  NoneOrderTuple,
} from "./lib/types";
import { typedMemo } from "utils/typedMemo";
import { AbilityBuilder, createMongoAbility } from "@casl/ability";

interface IContextProps<
  S extends string,
  A extends BaseActions<S>,
  C extends BaseConditions<S>
> {
  subscribedCheck: PermissionBuilder<S, A, C>["subscribedCheck"];
}

export const reactFactoryPermission = <
  S extends string,
  A extends BaseActions<S>,
  C extends BaseConditions<S>
>() => {
  const Context = createContext<IContextProps<S, A, C> | null>(null);

  const { checkPermission, update, subscribedCheck } = new PermissionBuilder<
    S,
    A,
    C
  >();

  const PermissionProvider = ({ children }: { children: React.ReactNode }) => {
    const contextValue = useMemo(() => subscribedCheck, []);

    return (
      <Context.Provider value={{ subscribedCheck: contextValue }}>
        {children}
      </Context.Provider>
    );
  };

  const usePermission = () => {
    const context = useContext(Context);
    if (!context) throw new Error("Use subscribing check without provider");

    const { subscribedCheck } = context;
    const [signal, setSignal] = useState(false);

    const trigger = useCallback(() => {
      setSignal((prev) => !prev);
    }, [signal]);

    const can = <
      Subjects extends S,
      Action extends NoneOrderTuple<A[Subjects]>
    >(
      args: CheckPermissions<Subjects, C, Action>
    ) => {
      return subscribedCheck({ ...args, signal: trigger });
    };

    return { can };
  };

  const Can = <Subjects extends S, Action extends Subsets<A[Subjects]>>({
    children,
    element = null,
    ...args
  }: CheckPermissions<Subjects, C, Action> & {
    children: React.ReactNode;
    element?: React.ReactNode;
  }): React.ReactNode => {
    const { can } = usePermission();

    const result = can(args);

    if (result) {
      return children;
    }

    return element;
  };

  return {
    usePermission,
    checkPermission,
    updatePermission: update,
    Can,
    PermissionProvider,
  };
};

type keys = "image" | "article" | "comment" | "like";
interface Actions {
  image: ["upload", "download"];
  article: ["create", "update", "delete", "upload", "download"];
  comment: ["create", "update", "delete"];
  like: ["create", "delete"];
}

interface TBaseConditions {
  image: never;
  article: never;
  comment: never;
  like: never;
}

const { Can, usePermission } = reactFactoryPermission<
  keys,
  Actions,
  TBaseConditions
>();

const Art = () => (
  <Can subject={"article"} action={["", "", '']}>
    asdf
  </Can>
);
const useSuka = () => {
  const { can } = usePermission();
  can({ subject: "image", action: ['download', 'download']});
};
