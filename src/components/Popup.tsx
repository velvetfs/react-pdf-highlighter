"use client";
import React from "react";

import { MouseMonitor } from "./MouseMonitor";

type PopupProps = {
  onMouseOver: (content: JSX.Element) => void;
  popupContent: JSX.Element;
  onMouseOut: () => void;
  children: JSX.Element;
};

export const Popup = (props: PopupProps) => {
  const [mouseIn, setMouseIn] = React.useState(false);

  const { onMouseOver, popupContent, onMouseOut } = props;

  return (
    <div
      className="pop-up"
      onMouseOver={() => {
        setMouseIn(true);
        onMouseOver(
          <MouseMonitor
            onMoveAway={() => {
              onMouseOut();
            }}
            children={popupContent}
            paddingX={200}
            paddingY={60}
          />
        );
      }}
      onMouseOut={() => {
        setMouseIn(false);
      }}
    >
      {props.children}
    </div>
  );
};
