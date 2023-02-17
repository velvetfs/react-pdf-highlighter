"use client";
import React from "react";

import "../style/Highlight.css";

import type { LTWHP } from "../types.js";

interface Props {
  position: {
    boundingRect: LTWHP;
    rects: Array<LTWHP>;
  };
  onClick?: () => void;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
  comment: {
    text: string;
  };
  isScrolledTo: boolean;
}

export const Highlight = (props: Props) => {
  const { position, onClick, onMouseOver, onMouseOut, comment, isScrolledTo } =
    props;

  const { rects, boundingRect } = position;

  return (
    <div className={`Highlight ${isScrolledTo ? "Highlight--scrolledTo" : ""}`}>
      <div className="Highlight__parts">
        {rects.map((rect, index) => (
          <div
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onClick={onClick}
            key={index}
            style={rect}
            className={`Highlight__part`}
          />
        ))}
      </div>
    </div>
  );
};
