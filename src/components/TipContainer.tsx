import React, { useEffect, useRef } from "react";

import type { LTWHP } from "../types";

type TipContainerProps = {
  children: JSX.Element | null;
  style: { top: number; left: number; bottom: number };
  scrollTop: number;
  pageBoundingRect: LTWHP;
};

const clamp = (value: number, left: number, right: number) =>
  Math.min(Math.max(value, left), right);

export const TipContainer = (props: TipContainerProps) => {
  const { children, style, scrollTop, pageBoundingRect } = props;
  const [height, setHeight] = React.useState<number>(0);
  const [width, setWidth] = React.useState<number>(0);
  const node = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!node.current) {
      return;
    }

    const { offsetHeight, offsetWidth } = node.current;

    setHeight(offsetHeight);
    setWidth(offsetWidth);
  };

  useEffect(() => {
    setTimeout(updatePosition, 0);
  }, []);

  useEffect(() => {
    updatePosition();
  }, [props.children]);

  const isStyleCalculationInProgress = width === 0 && height === 0;

  const shouldMove = style.top - height - 5 < scrollTop;
  const top = shouldMove ? style.bottom + 5 : style.top - height - 5;
  const left = clamp(style.left - width / 2, 0, pageBoundingRect.width - width);

  const childrenWithProps = React.Children.map(children, (child) =>
    // @ts-ignore
    React.cloneElement(child, {
      onUpdate: () => {
        setHeight(0);
        setWidth(0);
      },
      popup: {
        position: shouldMove ? "below" : "above",
      },
    })
  );

  return (
    <div
      className="PdfHighlighter__tip-container"
      style={{
        visibility: isStyleCalculationInProgress ? "hidden" : "visible",
        top,
        left,
      }}
      ref={node}
    >
      {childrenWithProps}
    </div>
  );
};
