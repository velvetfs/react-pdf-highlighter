"use client";
import React, { useEffect } from "react";

import type { PDFDocumentProxy } from "pdfjs-dist";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";

type PdfLoaderProps = {
  workerSrc?: string;

  url: string;
  beforeLoad: JSX.Element;
  errorMessage?: JSX.Element;
  children: (pdfDocument: PDFDocumentProxy) => JSX.Element;
  onError?: (error: Error) => void;
  cMapUrl?: string;
  cMapPacked?: boolean;
};

export const PdfLoader = ({
  workerSrc = "https://unpkg.com/pdfjs-dist@3.3.122/build/pdf.worker.min.js",
  url,
  beforeLoad,
  children,
  cMapUrl,
  cMapPacked,
  onError,
  ...props
}: PdfLoaderProps) => {
  const [pdfDocument, setPdfDocument] = React.useState<PDFDocumentProxy | null>(
    null
  );
  const [error, setError] = React.useState<Error | null>(null);
  const documentRef = React.useRef<HTMLElement>(null);

  useEffect(() => {
    setPdfDocument(null);
    setError(null);

    if (typeof workerSrc === "string") {
      GlobalWorkerOptions.workerSrc = workerSrc;
    }

    Promise.resolve()
      .then(() => pdfDocument && pdfDocument.destroy())
      .then(() => {
        if (!url) {
          return;
        }
        return getDocument({
          url,
          cMapUrl,
          cMapPacked,
          ...props,
        })
          .promise.then((pdfDocument: PDFDocumentProxy) => {
            setPdfDocument(pdfDocument);
          })
          .catch((e: Error) => {
            setError(e);
          });
      })
      .catch((e) => setError(e));
    return () => {
      if (pdfDocument) {
        pdfDocument.destroy();
      }
    };
  }, [url]);

  const renderDocument = () => {
    if (error === null && pdfDocument === null) {
      return beforeLoad;
    } else if (error) {
      console.log(error.message);
      return <div style={{ color: "black" }}>{error.message}</div>;
    } else if (pdfDocument !== null && pdfDocument !== undefined) {
      return children(pdfDocument);
    } else {
      return null;
    }
  };

  return (
    <>
      <span ref={documentRef} />
      {renderDocument()}
    </>
  );
};
