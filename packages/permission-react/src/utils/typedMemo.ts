import { memo } from "react";

export const typedMemo: <Component extends React.FC<any>>(
  component: Component,
  compare?: (
    prev: React.ComponentPropsWithoutRef<Component>,
    newProps: React.ComponentPropsWithoutRef<Component>
  ) => boolean
) => Component = memo;
