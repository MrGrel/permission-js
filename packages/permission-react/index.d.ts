import * as react from 'react';
import { PropsWithChildren } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';
import * as permission_js_core from 'permission-js-core';
import { BaseActions, BaseConditions, CheckPermissions } from 'permission-js-core';

declare function reactFactoryPermission<S extends string, A extends BaseActions<S>, C extends BaseConditions<S>>(): {
    usePermission: () => {
        can: <Subjects extends S, Action extends A[Subjects]>(args: CheckPermissions<Subjects, Action, C>) => boolean;
        update: <Subject extends S>(subject: Subject, action: A[Subject][number], value: permission_js_core.Rules<S, A, C>[Subject][A[Subject][number]]) => void;
    };
    Can: <Subjects extends S, Action extends A[Subjects]>({ children, element, ...args }: PropsWithChildren<CheckPermissions<Subjects, Action, C> & {
        element?: React.ReactNode;
    }>) => React.ReactNode;
    PermissionProvider: react.MemoExoticComponent<({ children }: PropsWithChildren) => react_jsx_runtime.JSX.Element>;
};
declare const callChlen: () => string;

export { callChlen, reactFactoryPermission as createPermissionProvider };
