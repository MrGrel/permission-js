import { PermissionObject } from "./permissionObject";
import {
  BaseActions,
  BaseConditions,
  Destroy,
  SubscribedCheckPermissions,
} from "./types";

export function createProxyPermissionObject<
  Subjects extends string,
  Action extends BaseActions<Subjects>[Subjects],
  Conditions extends BaseConditions<Subjects>
>(
  permissions: PermissionObject<Subjects, Action, Conditions>,
  register: (target: WeakKey, heldValue: (() => void) | undefined) => void,
  subscribedCheck: ({
    signal,
    destroy,
    ...args
  }: SubscribedCheckPermissions<Subjects, Action, Conditions> &
    Destroy) => boolean
): PermissionObject<Subjects, Action, Conditions> &
  Destroy & { check: () => boolean } {
  return new Proxy<PermissionObject<Subjects, Action, Conditions>>(
    permissions,
    {
      set(
        target,
        prop: keyof (PermissionObject<Subjects, Action, Conditions> &
          Destroy & { check: () => boolean }),
        value,
        receiver
      ) {
        console.log(prop);
        if (prop === "destroy") {
          register(target, value);
        }
        if (prop !== "destroy" && target[prop] !== value) {
          target.destroy?.();
          target.destroy = undefined;
          target.check = () =>
            subscribedCheck({
              action: target.action,
              subject: target.subject,
              conditions: target.conditions,
              mode: target.mode,
              signal: target.signal,
              destroy: target.destroy,
              setDestroy: target.setDestroy,
            });
        }

        return Reflect.set(target, prop, value, receiver);
      },
    }
  );
}
