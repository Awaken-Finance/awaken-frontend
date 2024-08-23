import { DependencyList, Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import isDeepEqual from 'react-use/lib/misc/isDeepEqual';

/**
 * useUnmounted
 * @returns boolean
 * whether the component is unmounted
 */
export function useUnmounted() {
  const unmountedRef = useRef(false);
  useEffect(() => {
    return () => {
      unmountedRef.current = true;
    };
  }, []);
  return unmountedRef.current;
}
/**
 * @method useAsyncState
 * Prevent React state update on an unmounted component.
 */
export function useAsyncState<S>(initialState?: S | (() => S)): [S | undefined, Dispatch<SetStateAction<S>>] {
  const unmountedRef = useUnmounted();
  const [state, setState] = useState(initialState);
  const setAsyncState = useCallback((s: any) => {
    if (unmountedRef) return;
    setState(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [state, setAsyncState];
}

export function useDeepEQMemo<T>(factory: () => T, deps: any[]) {
  const { current } = useRef({
    deps,
    obj: undefined as undefined | T,
    initialized: false,
  });
  // Trigger the factory for the first time or when the object that depends on the change changes
  if (current.initialized === false || !isDeepEqual(current.deps, deps)) {
    current.deps = deps;
    current.obj = factory();
    current.initialized = true;
  }
  return current.obj as T;
}

export function useCreation<T>(factory: () => T, deps: any[]) {
  const { current } = useRef({
    deps,
    obj: undefined as undefined | T,
    initialized: false,
  });
  // Trigger the factory for the first time or when the object that depends on the change changes
  if (current.initialized === false || !depsAreSame(current.deps, deps)) {
    current.deps = deps;
    current.obj = factory();
    current.initialized = true;
  }
  return current.obj as T;
}

function depsAreSame(oldDeps: any[], deps: any[]): boolean {
  if (oldDeps === deps) return true;
  for (let i = 0; i < oldDeps.length; i++) {
    if (oldDeps[i] !== deps[i]) return false;
  }
  return true;
}

export function useReturnLastCallback<T extends (...args: any[]) => any>(callback: T, deps: DependencyList) {
  const last = useRef<number>(0);
  return useCallback(async (...args: any) => {
    ++last.current;
    const id = last.current;
    try {
      const req = await callback(...args);
      if (last.current !== id) throw new Error('Not the latest request');
      return req;
    } catch (error) {
      if (last.current !== id) throw new Error('Not the latest request');
      throw error;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps) as T;
}

/**
 * that deal with the debounced function.
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T | undefined,
  deps: DependencyList,
  delay = 500,
) {
  const timer = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: any[]) => {
    if (!callbackRef.current) return;
    timer.current && clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      callbackRef.current?.(...args);
    }, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
