import { SubscriberMap, AnyFunction } from "./types";
import { autoBind } from "./utils/autoBind";

interface SubscribeConfig {
  maxSize?: number;
  delay: number;
}

interface SubscribeConfig {
  maxSize?: number;
  delay: number;
}

export class SubscribeManager<S extends string, A extends string> {
  private mapSubscribers: SubscriberMap<S, A> | null = null;

  private timeout: ReturnType<typeof setTimeout> | null = null;
  private config: SubscribeConfig = { delay: 20 };
  private queue = new Set<() => void>();

  constructor(
    subscribers: SubscriberMap<S, A> = null!,
    config: SubscribeConfig = { delay: 20 }
  ) {
    autoBind(this);
    this.mapSubscribers = subscribers;
    this.config = config;
  }

  set<Subject extends S, Action extends A>(
    subject: Subject,
    action: Action,
    cb: AnyFunction
  ) {
    if (!this.mapSubscribers) {
      this.mapSubscribers = {} as SubscriberMap<S, A>;
    }

    if (!this.mapSubscribers[subject]) {
      this.mapSubscribers[subject] = {} as SubscriberMap<S, A>[Subject];
    }

    if (!this.mapSubscribers[subject][action]) {
      this.mapSubscribers[subject][action] = new Set();
    }

    this.mapSubscribers[subject][action].add(cb);
    console.log("subscribers", this.mapSubscribers);
  }

  remove<Subject extends S, Action extends A>(
    subject: Subject,
    action: Action,
    cb: AnyFunction
  ) {
    if (
      this.mapSubscribers?.[subject] &&
      this.mapSubscribers?.[subject]?.[action]
    ) {
      this.mapSubscribers[subject][action].delete(cb);
    }
    console.log("remove", subject, action);
  }

  call(subject: S, action: A) {
    if (this.mapSubscribers) {
      const currentSet = this.mapSubscribers?.[subject]?.[action];

      currentSet.forEach((cb) => this.queue.add(cb));
      currentSet.clear();

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => this.fetch(), this.config.delay);
    }
  }

  private fetch() {
    const { queue } = this;

    queue.forEach((cb) => cb());
    this.clear();
  }

  private clear() {
    this.queue.clear();

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}
