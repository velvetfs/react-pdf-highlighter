import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AreaHighlight } from "../src/components/AreaHighlight";

const highlight = {
  position: {
    boundingRect: {
      top: 100,
      left: 100,
      width: 100,
      height: 100,
      pageNumber: 1,
    },
    rects: [],
    pageNumber: 1,
  },
  comment: { text: "test" },
  content: {},
};

test("should render", () => {
  const onChange = jest.fn();
  render(
    <AreaHighlight
      isScrolledTo={true}
      highlight={highlight}
      onChange={onChange}
    />
  );

  expect(screen.getByTestId("AreaHighlight")).toBeInTheDocument();
});
