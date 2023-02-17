"use client";
import React from "react";

import "../style/AreaHighlight.css";

import type { LTWHP, ViewportHighlight } from "../types";

type AreaHighlightProps = {
  highlight: ViewportHighlight;
  onChange: (rect: LTWHP) => void;
  isScrolledTo: boolean;
};

export const AreaHighlight = (props: AreaHighlightProps) => {
  const { highlight, onChange, isScrolledTo, ...otherProps } = props;

  return (
    <div
      className={`AreaHighlight ${
        isScrolledTo ? "AreaHighlight--scrolledTo" : ""
      }`}
    >
      <div
        className="AreaHighlight__part"
        style={{
          left: highlight.position.boundingRect.left,
          top: highlight.position.boundingRect.top,
          width: highlight.position.boundingRect.width,
          height: highlight.position.boundingRect.height,
        }}
        {...otherProps}
      ></div>
    </div>
  );
};
