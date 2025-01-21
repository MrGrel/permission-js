import { TupleToUnionTuple, UniqueTuple } from "./utils/types";

export type Mode = "some" | "every";

export type AnyRecord = Record<string, any>;

export type ConvertRecordValue<T extends AnyRecord> = T[string] extends [
  ...T[string]
]
  ? {
      [key in keyof T]: T[key];
    }
  : {
      [key in keyof T]: T[key][];
    };

export type Tuple = [string, ...string[]];
export type BaseActions<K extends string> = Record<K, Tuple>;
export type BaseConditions<K extends string> = Record<K, AnyRecord>;

export type Rules<
  K extends string,
  A extends BaseActions<K>,
  C extends BaseConditions<K>
> = {
  [key in K]: {
    [action in A[key][number]]: C[key] extends never
      ? boolean
      : C[key] | boolean;
  };
};

export type CheckPermissions<
  Subject extends string,
  Action extends BaseActions<Subject>[Subject],
  Conditions extends BaseConditions<Subject>,
  FunctionMode extends Mode = "some"
> = {
  subject: Subject | UniqueTuple<Subject[]>;
  action: Action[number] | UniqueTuple<TupleToUnionTuple<Action>>;
  conditions?: Conditions[Subject] | ConvertRecordValue<Conditions[Subject]>;
  mode?: FunctionMode;
};

export type Signal = {
  signal: () => void;
};

export type SubscribedCheckPermissions<
  Subjects extends string,
  Action extends BaseActions<Subjects>[Subjects],
  Conditions extends BaseConditions<Subjects>
> = CheckPermissions<Subjects, Action, Conditions> & Signal;

// TODO:
export type SubscriptionKey<S extends string> = {
  subject: S | S[];
  action:
    | BaseActions<S>[S][number]
    | UniqueTuple<TupleToUnionTuple<BaseActions<S>[S]>>;
};

export interface SubscriptionValue<
  S extends string,
  A extends BaseActions<S>[S],
  C extends BaseConditions<S>
> {
  args: CheckPermissions<S, A, C>;
  subscribers: Signal["signal"][];
  callback: () => boolean;
}

/*
TODO: structure to which i strive

type CreateMapType = {
  comment: {
    actions: [
      "read",
      "create",
      "update",
      {
        action: "delete";
        condition: {
          userId: "12341234";
          role: "admin";
        };
      }
    ];
    conditions: {
      id: "1234";
    };
  };
  article: {
    subArticle: {
      userArticle: {
        actions: ["read"];
      };
    };
    kudasaiArticle: {
      actions: ["read", "create", "update", "delete"];
      conditions: {
        mazuka: "red mazuka";
      };
    };
    conditions: {
      sasaiKudasai: "canasuba";
    };
  };
};
*/
