"use client";
import React, { useEffect, useState } from "react";

import {
  EventBus,
  NullL10n,
  PDFLinkService,
  PDFViewer,
} from "pdfjs-dist/legacy/web/pdf_viewer";

import "pdfjs-dist/web/pdf_viewer.css";
import "../style/pdf_viewer.css";

import "../style/PdfHighlighter.css";

import debounce from "lodash.debounce";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { createRoot, Root } from "react-dom/client";
import { scaledToViewport, viewportToScaled } from "../lib/coordinates";
import getAreaAsPng from "../lib/get-area-as-png";
import { findOrCreateContainerLayer } from "../lib/pdfjs-dom";
import type {
  IHighlight,
  LTWH,
  LTWHP,
  Position,
  Scaled,
  ScaledPosition,
} from "../types";
import { TipContainer } from "./TipContainer";

type T_ViewportHighlight<T_HT> = { position: Position } & T_HT;

type PdfHighlighterProps<T_HT> = {
  highlightTransform: (
    highlight: T_ViewportHighlight<T_HT>,
    index: number,
    setTip: (
      highlight: T_ViewportHighlight<T_HT>,
      callback: (highlight: T_ViewportHighlight<T_HT>) => JSX.Element
    ) => void,
    hideTip: () => void,
    viewportToScaled: (rect: LTWHP) => Scaled,
    screenshot: (position: LTWH) => string,
    isScrolledTo: boolean
  ) => JSX.Element;
  highlights: Array<T_HT>;
  onScrollChange: () => void;
  scrollRef: (scrollTo: (highlight: T_HT) => void) => void;
  pdfDocument: PDFDocumentProxy;
  pdfScaleValue?: string;
};

export const PdfHighlighter = <T_HT extends IHighlight>({
  highlightTransform,
  highlights,
  onScrollChange,
  scrollRef,
  pdfDocument,
  pdfScaleValue = "auto",
}: PdfHighlighterProps<T_HT>) => {
  const [tip, setTip] = useState<{
    highlight: T_ViewportHighlight<T_HT>;
    callback: (highlight: T_ViewportHighlight<T_HT>) => JSX.Element;
  } | null>(null);
  const [tipPosition, setTipPosition] = useState<Position | null>(null);
  const [tipChildren, setTipChildren] = useState<JSX.Element | null>(null);
  const [scrolledToHighlightId, setScrolledToHighlightId] =
    useState<string>("");
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(
    null
  );
  const documentRef = React.useRef<HTMLDivElement>(null);
  const [viewerState, setViewerState] = useState<PDFViewer>();

  const [eventBus] = useState<EventBus>(new EventBus());
  const linkService = new PDFLinkService({
    eventBus: eventBus,
    externalLinkTarget: 2,
  });

  var viewer: PDFViewer;
  var roots: Map<Element, Root> = new Map();

  const handleScaleValue = () => {
    viewer.currentScaleValue = pdfScaleValue;
  };

  const debouncedScaleValue = () => debounce(handleScaleValue, 500);

  const resizeObserver = new ResizeObserver(debouncedScaleValue);

  useEffect(() => {
    const current = documentRef.current;
    setContainerNode(current);
    let doc: Document;
    if (current) {
      let { ownerDocument: doc } = current;
      eventBus.on("textlayerrendered", () => {
        renderHighlights();
      });
      eventBus.on("pagesinit", () => {
        handleScaleValue();
        scrollRef(scrollTo);
      });
      doc.defaultView?.addEventListener("resize", debouncedScaleValue);
      if (resizeObserver) resizeObserver.observe(current);
      viewer = new PDFViewer({
        container: documentRef.current,
        eventBus: eventBus,
        textLayerMode: 2,
        removePageBorders: true,
        linkService: linkService,
        l10n: NullL10n,
      });
      setViewerState(viewer);
    }
    return () => {
      eventBus.off("textlayerrendered", renderHighlights);
      eventBus.off("pagesinit", () => {
        handleScaleValue();
        scrollRef(scrollTo);
      });
      doc.defaultView?.removeEventListener("resize", debouncedScaleValue);
    };
  }, []);

  useEffect(() => {
    if (viewer) {
      renderHighlights();
      viewer.setDocument(pdfDocument);
      linkService.setViewer(viewer);
      handleScaleValue();
    }
  }, [containerNode]);

  useEffect(() => {
    renderHighlights();
  }, [scrolledToHighlightId]);

  const groupHighlightsByPage = (highlights: Array<T_HT>) => {
    const allHighlights = highlights.filter(Boolean);

    const pageNumbers = new Set<number>();
    for (const highlight of allHighlights) {
      pageNumbers.add(highlight!.position.pageNumber);
      for (const rect of highlight!.position.rects) {
        if (rect.pageNumber) {
          pageNumbers.add(rect.pageNumber);
        }
      }
    }
    const groupedHighlights = {} as Record<number, any[]>;

    for (const pageNumber of pageNumbers) {
      groupedHighlights[pageNumber] = groupedHighlights[pageNumber] || [];
      for (const highlight of allHighlights) {
        const pageSpecificHighlight = {
          ...highlight,
          position: {
            pageNumber,
            boundingRect: highlight!.position.boundingRect,
            rects: [],
            usePdfCoordinates: highlight!.position.usePdfCoordinates,
          } as ScaledPosition,
        };
        let anyRectsOnPage = false;
        for (const rect of highlight!.position.rects) {
          if (
            pageNumber === (rect.pageNumber || highlight!.position.pageNumber)
          ) {
            pageSpecificHighlight.position.rects.push(rect);
            anyRectsOnPage = true;
          }
        }
        if (anyRectsOnPage || pageNumber === highlight!.position.pageNumber) {
          groupedHighlights[pageNumber].push(pageSpecificHighlight);
        }
      }
    }

    return groupedHighlights;
  };

  const findOrCreateHighlightLayer = (page: number) => {
    const { textLayer } = viewer?.getPageView(page - 1) || {};
    if (!textLayer || textLayer === undefined) return null;
    return findOrCreateContainerLayer(
      textLayer?.div,
      "PdfHighlighter__highlight-layer"
    );
  };

  const scaledPositionToViewport = ({
    pageNumber,
    boundingRect,
    rects,
    usePdfCoordinates,
  }: ScaledPosition): Position => {
    const viewport = viewer!.getPageView(pageNumber - 1).viewport;

    return {
      boundingRect: scaledToViewport(boundingRect, viewport, usePdfCoordinates),
      rects: (rects || []).map((rect) =>
        scaledToViewport(rect, viewport, usePdfCoordinates)
      ),
      pageNumber,
    };
  };

  const renderHighlights = () => {
    const highlightsByPage = groupHighlightsByPage(highlights);

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const highlightLayer = findOrCreateHighlightLayer(pageNumber);

      if (highlightLayer) {
        if (!roots.has(highlightLayer)) {
          let root = createRoot(highlightLayer);
          roots.set(highlightLayer, root);
        }
        roots.get(highlightLayer)?.render(
          <div>
            {(highlightsByPage[pageNumber] || []).map(
              ({ position, id, ...highlight }, index): JSX.Element => {
                // @ts-ignore
                const viewportHighlight: T_ViewportHighlight<T_HT> = {
                  id,
                  position: scaledPositionToViewport(position),
                  ...highlight,
                };

                if (tip && tip.highlight.id === String(id)) {
                  showTip(tip.highlight, tip.callback(viewportHighlight));
                }

                const isScrolledTo = Boolean(scrolledToHighlightId === id);

                return highlightTransform(
                  viewportHighlight,
                  index,
                  (highlight, callback) => {
                    setTip({ highlight, callback });
                    showTip(highlight, callback(highlight));
                  },
                  () => hideTip(),
                  (rect) => {
                    const viewport = viewer!.getPageView(
                      (rect.pageNumber || pageNumber) - 1
                    ).viewport;

                    return viewportToScaled(rect, viewport);
                  },
                  (boundingRect) => {
                    const canvas = viewer.getPageView(pageNumber - 1).canvas;
                    return getAreaAsPng(canvas, boundingRect);
                  },
                  isScrolledTo
                );
              }
            )}
          </div>
        );
      }
    }
  };

  const onScroll = () => {
    onScrollChange();
    setScrolledToHighlightId("");
  };

  const scrollTo = (highlight: T_HT) => {
    const { pageNumber, boundingRect, usePdfCoordinates } = highlight.position;

    viewer.container.removeEventListener("scroll", onScroll);

    const pageViewport = viewer.getPageView(pageNumber - 1).viewport;

    const scrollMargin = 10;

    viewer.scrollPageIntoView({
      pageNumber,
      destArray: [
        null,
        { name: "XYZ" },
        ...pageViewport.convertToPdfPoint(
          0,
          scaledToViewport(boundingRect, pageViewport, usePdfCoordinates).top -
            scrollMargin
        ),
        0,
      ],
    });

    setScrolledToHighlightId(highlight.id);

    setTimeout(() => {
      viewer.container.addEventListener("scroll", onScroll);
    }, 100);
  };

  const hideTip = () => {
    setTipPosition(null);
    setTipChildren(null);
    setTip(null);
  };

  const showTip = (
    highlight: T_ViewportHighlight<T_HT>,
    content: JSX.Element
  ) => {
    setTipPosition(highlight.position);
    setTipChildren(content);
  };

  const renderTip = () => {
    if (!tipPosition) return null;

    const { boundingRect, pageNumber } = tipPosition;
    if (viewerState) {
      const page = {
        node: viewerState.getPageView(
          (boundingRect.pageNumber || pageNumber) - 1
        ).div,
        pageNumber: boundingRect.pageNumber || pageNumber,
      };

      const pageBoundingClientRect = page.node.getBoundingClientRect();

      const pageBoundingRect = {
        bottom: pageBoundingClientRect.bottom,
        height: pageBoundingClientRect.height,
        left: pageBoundingClientRect.left,
        right: pageBoundingClientRect.right,
        top: pageBoundingClientRect.top,
        width: pageBoundingClientRect.width,
        x: pageBoundingClientRect.x,
        y: pageBoundingClientRect.y,
        pageNumber: page.pageNumber,
      };

      return (
        <TipContainer
          scrollTop={viewerState.container.scrollTop}
          pageBoundingRect={pageBoundingRect}
          style={{
            left:
              page.node.offsetLeft + boundingRect.left + boundingRect.width / 2,
            top: boundingRect.top + page.node.offsetTop,
            bottom:
              boundingRect.top + page.node.offsetTop + boundingRect.height,
          }}
        >
          {tipChildren}
        </TipContainer>
      );
    }
  };

  return (
    <div>
      <div
        className="PdfHighlighter"
        ref={documentRef}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="pdfViewer" />
        {renderTip()}
      </div>
    </div>
  );
};
