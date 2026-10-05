declare module '*.svg' {
  import type { ReactElement, SVGAttributes } from 'react';
  const content: (props: SVGAttributes<SVGSVGElement>) => ReactElement;
  export default content;
}