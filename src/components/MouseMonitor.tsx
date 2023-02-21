import React, { useRef } from "react";

type MouseMonitorProps = {
  onMoveAway: () => void;
  paddingX: number;
  paddingY: number;
  children: JSX.Element;
};

export const MouseMonitor = (props: MouseMonitorProps) => {
  const container = useRef<HTMLDivElement | null>(null);
  let unsubscribe = () => {};

  const { onMoveAway, paddingX, paddingY, children, ...restProps } = props;

  const onMouseMove = (event: MouseEvent) => {
    if (!container) return;

    let current = container.current;

    if (!current) return;
    const { clientX, clientY } = event;
    const { left, top, width, height } = current.getBoundingClientRect();
    const inBoundsX =
      clientX > left - paddingX && clientX < left + width + paddingX;
    const inBoundsY =
      clientY > top - paddingY && clientY < top + height + paddingY;
    const isNear = inBoundsX && inBoundsY;

    if (!isNear) {
      onMoveAway();
    }
  };

  const attachRef = (ref: HTMLDivElement | null) => {
    container.current = ref;
    unsubscribe();
    if (ref) {
      const { ownerDocument: doc } = ref;
      doc.addEventListener("mousemove", onMouseMove);
      unsubscribe = () => {
        doc.removeEventListener("mousemove", onMouseMove);
      };
    }
  };

  return (
    <div ref={(ref) => attachRef(ref)}>
      {React.cloneElement(children, restProps)}
    </div>
  );
};
