import { AnyFunction } from "../types"

interface TPrototype {
  [key: string]: AnyFunction
}

const CONSTRUCTOR = 'constructor'

function isPrototype<T extends object>(value: unknown): value is T {
  return typeof value === 'object'
}

function isFunction(item: unknown): item is AnyFunction {
  return typeof item === 'function'
}

function bind(name: string, instance: unknown, proto?: unknown): void {
  if (!isPrototype<TPrototype>(proto)) {
    return
  }

  if (!isPrototype<TPrototype>(instance)) {
    return
  }

  if (name === CONSTRUCTOR) {
    return
  }

  const descriptor = Object.getOwnPropertyDescriptor(proto, name)

  if (!descriptor) {
    return
  }

  if (descriptor.get || descriptor.set) {
    Object.defineProperty(proto, name, {
      ...descriptor,
      get: descriptor.get ? descriptor.get.bind(instance) : undefined,
      set: descriptor.set ? descriptor.set.bind(instance) : undefined,
    })

    return
  }

  if (isFunction(descriptor.value)) {
    instance[name] = proto[name].bind(instance)
  }
}

export function autoBind(instance: object): void {
  try {
    const proto = Object.getPrototypeOf(instance)
    const properties = Object.getOwnPropertyNames(proto)
    properties.forEach((name: string) => bind(name, instance, proto))
  } catch (error) {
    throw new Error(`Cannot get prototype of ${instance}`)
  }
}
