declare module 'react-native-web' {
  import type { ReactElement } from 'react';

  export function unstable_createElement(
    component: string,
    props?: Record<string, unknown>,
    options?: Record<string, unknown>
  ): ReactElement;
}
