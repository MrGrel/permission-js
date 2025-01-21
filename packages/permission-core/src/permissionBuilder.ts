import {
  BaseActions,
  BaseConditions,
  Rules,
  SubscriptionKey,
  SubscriptionValue,
  CheckPermissions,
  ConvertRecordValue,
  SubscribedCheckPermissions,
} from "./types";

export class PermissionBuilder<
  S extends string,
  A extends BaseActions<S>,
  C extends BaseConditions<S>
> {
  private rules: Rules<S, A, C> | null = null;

  private subscriptions = new Map<
    SubscriptionKey<S>,
    SubscriptionValue<S, A[S], C>
  >();

  update = <Subject extends S>(
    subject: Subject,
    action: A[Subject][number],
    value: Rules<S, A, C>[Subject][A[Subject][number]]
  ) => {
    if (!this.rules) {
      this.rules = {} as Rules<S, A, C>;
    }

    if (!this.rules[subject]) {
      this.rules[subject] = {} as Rules<S, A, C>[Subject];
    }

    if (this.rules[subject] && this.rules[subject][action] !== value) {
      this.rules[subject][action] = value;

      this.triggerSubscription(subject, action);
    }
  };

  private triggerSubscription = (subject: S, action: A[S][number]) => {
    const subscriptionsArrMap = Array.from(this.subscriptions.entries());

    const haveElement = <T>(current: T | T[], el: T) => {
      if (current instanceof Array) {
        return current.some((curEl) => curEl === el);
      }

      return current === el;
    };

    subscriptionsArrMap.forEach(([keys, { subscribers, args }]) => {
      const { action: actionKey, subject: subjectKey } = keys;
      if (haveElement(subjectKey, subject)) {
        if (haveElement(actionKey, action)) {
          subscribers.forEach((signal) => signal());
        }
      }
    });
  };

  subscribedCheck = <Subjects extends S, Action extends A[Subjects]>({
    signal,
    ...args
  }: SubscribedCheckPermissions<Subjects, Action, C> & {
    signal: () => void;
  }): boolean => {
    const callPermissionCheck = this.subscriptions.get(args);
    const typedArgs = args as CheckPermissions<S, A[Subjects], C>;

    if (!callPermissionCheck) {
      const callback = () => this.checkPermission(typedArgs);

      this.subscriptions.set(typedArgs, {
        callback,
        args: typedArgs,
        subscribers: [signal],
      });
      return callback();
    }

    const hasSubscribe = callPermissionCheck.subscribers.some(
      (subscriber) => subscriber === signal
    );

    if (!hasSubscribe) {
      callPermissionCheck.subscribers.push(signal);
      this.subscriptions.set(typedArgs, callPermissionCheck);
    }

    return callPermissionCheck.callback();
  };

  checkPermission = ({
    subject,
    action,
    conditions,
    mode = "some",
  }: CheckPermissions<S, A[S], C>): boolean => {
    if (Array.isArray(subject) && typeof action === "string") {
      if (!subject.length) return false;
      return subject[mode]((s) => this.checkPermissions(s, action, conditions));
    }

    if (Array.isArray(action) && typeof subject === "string") {
      if (!action.length) return false;

      return action[mode]((a) => this.checkPermissions(subject, a, conditions));
    }

    if (Array.isArray(subject) && Array.isArray(action)) {
      if (!subject.length || !action.length) return false;

      return subject[mode]((s) =>
        action[mode]((a) => this.checkPermissions(s, a, conditions))
      );
    }

    if (typeof subject === "string" && typeof action === "string") {
      return this.checkPermissions(subject, action, conditions);
    }

    return false;
  };

  private checkPermissions = (
    subject: S,
    action: A[S][number],
    conditions?: C[S] | ConvertRecordValue<C[S]>
  ): boolean => {
    if (!this.rules) return false;

    const selfSubject = this.rules[subject];

    if (!selfSubject) {
      return false;
    }

    const permission = selfSubject[action];

    if (typeof permission === "boolean") {
      return permission;
    }

    if (permission && typeof permission === "object" && conditions) {
      const typedPermission = permission as unknown as C[S];
      const keys = Object.keys(typedPermission) as (keyof C[S])[];

      return keys.every((key) => {
        if (Array.isArray(conditions[key])) {
          return conditions[key].some(
            (val: C[S][string]) => val === typedPermission[key]
          );
        }

        return typedPermission[key] === conditions[key];
      });
    }

    return false;
  };
}

type keys = "image" | "article" | "comment" | "like";
interface Actions {
  image: ["upload", "download"];
  article: ["create", "update", "delete"];
  comment: ["create", "update", "delete"];
  like: ["create", "delete"];
}

interface TBaseConditions {
  image: never;
  article: never;
  comment: never;
  like: never;
}
const { subscribedCheck } = new PermissionBuilder<
  keys,
  Actions,
  TBaseConditions
>();
subscribedCheck({
  subject: "image",
  action: ["download", "upload"],
  signal: () => {},
});
