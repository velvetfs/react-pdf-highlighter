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
      onMouseOver={() => {
        setMouseIn(true);

        onMouseOver(
          <MouseMonitor
            onMoveAway={() => {
              if (mouseIn) {
                return;
              }

              onMouseOut();
            }}
            paddingX={60}
            paddingY={30}
            children={popupContent}
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
