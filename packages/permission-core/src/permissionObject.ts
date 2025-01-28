import {
  BaseActions,
  BaseConditions,
  CheckPermissions,
  ConvertRecordValue,
  Destroy,
  Signal,
  SubscribedCheckPermissions,
} from "./types";
import { autoBind } from "./utils/autoBind";

export class PermissionObject<
  S extends string,
  A extends BaseActions<S>[S],
  C extends BaseConditions<S>
> implements SubscribedCheckPermissions<S, A, C>
{
  subject: S;
  action;
  conditions?: C[S] | ConvertRecordValue<C[S]> | undefined;
  mode?: "some" | undefined;
  signal: () => void;
  destroy?: () => void;

  constructor(
    prop: SubscribedCheckPermissions<S, A, C>,
    public checkPermissions: <Subjects extends S, Action extends A>(
      args: CheckPermissions<Subjects, Action, C, "some"> & Signal & Destroy
    ) => boolean
  ) {
    autoBind(this);

    this.action = prop.action;
    this.subject = prop.subject;
    this.conditions = prop.conditions;
    this.mode = prop.mode;
    this.signal = prop.signal;
  }
  setDestroy(cb: Destroy["destroy"]) {
    this.destroy = cb;
  }

  check() {
    return this.checkPermissions({
      subject: this.subject,
      action: this.action,
      conditions: this.conditions,
      mode: this.mode,
      signal: this.signal,
      setDestroy: this.setDestroy,
    });
  }
}
