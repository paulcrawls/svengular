let activeEffect = null;
const effectStack = [];

export function signal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  function read() {
    if (activeEffect) {
      subscribers.add(activeEffect);
      activeEffect.dependencies.add(subscribers);
    }
    return value;
  }

  read.set = nextValue => {
    if (Object.is(value, nextValue)) return value;
    value = nextValue;
    [...subscribers].forEach(effectRunner => effectRunner());
    return value;
  };

  read.update = updater => read.set(updater(value));
  read.peek = () => value;

  return read;
}

export function effect(fn) {
  function runner() {
    cleanup(runner);
    effectStack.push(runner);
    activeEffect = runner;

    try {
      fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1] ?? null;
    }
  }

  runner.dependencies = new Set();
  runner();

  return () => cleanup(runner);
}

export function computed(fn) {
  const value = signal(undefined);
  effect(() => value.set(fn()));
  return value;
}

export function batch(fn) {
  // Placeholder-friendly API. Current runtime is synchronous and tiny.
  // This keeps the public API ready for a future scheduler without forcing it into bundles.
  return fn();
}

function cleanup(runner) {
  runner.dependencies.forEach(dependency => dependency.delete(runner));
  runner.dependencies.clear();
}
