import React, { useState, useEffect, useContext } from "react";

import Select from "../shared/components/Select";
import Button from "../shared/components/Button";

import { ReactComponent as SVG55 } from "../assets/svgicons/55.svg";
import { ReactComponent as SVG56 } from "../assets/svgicons/56.svg";
import { ReactComponent as SVG57 } from "../assets/svgicons/57.svg";
import { ReactComponent as SVG58 } from "../assets/svgicons/58.svg";
import { ReactComponent as SVG59 } from "../assets/svgicons/59.svg";
import { ReactComponent as SVG60 } from "../assets/svgicons/60.svg";

import { SheetContext } from "../shared/contexts/SheetContext";

import { downloadToPdf } from "../utils/Draw";

export default function Header({ sheet, sheetChange }) {
  const [currentSheet, setCurrentSheet] = useState();

  const { sheets } = useContext(SheetContext);

  useEffect(() => {
    if (
      (sheet === undefined && sheets.length > 0) ||
      (sheet !== undefined && sheet.id === 1)
    ) {
      setCurrentSheet(sheets[0]);
    } else if (sheet !== undefined && sheet.id === sheets.length) {
      setCurrentSheet(sheets[sheets.length - 1]);
    } else {
      setCurrentSheet(sheet);
    }
  }, [sheet, sheets]);

  return (
    <section
      className="w-full flex justify-between z-50 bg-white px-12 h-16 border-b-2 shadow-2xl"
      style={{
        boxShadow:
          "0 2px 4px 0 rgb(31 49 61 / 10%), 0 0 0 1px rgb(31 49 61 / 5%)",
      }}
    >
      <div className="flex flex-col justify-center">
        <span className="text-sm text-gray-400 font-medium">Sheet</span>
        <Select
          variant="topLeft"
          sheet={currentSheet}
          sheetChange={sheetChange}
        />
      </div>

      <div className="flex items-center">
        <Button variant="outline" extraClassNames="rounded-l-sm relative">
          <SVG55 className="inline mr-1 text-blue-700 relative -top-0.5 -left-0.5" />
          <SVG56 className="inline mr-1 text-blue-700 absolute top-3 left-5" />
        </Button>

        <Button
          onClick={downloadToPdf}
          variant="outline"
          extraClassNames="rounded-l-sm relative"
          innerText="Download"
        >
          <SVG57 className="inline mr-1 text-blue-700" />
        </Button>

        <Button
          variant="outline"
          extraClassNames="border-l-0"
          innerText="Export"
        >
          <SVG58 className="inline mr-1 text-blue-700" />
        </Button>

        <Button
          variant="outline"
          extraClassNames="border-l-0"
          innerText="Filter"
        >
          <SVG59 className="inline mr-1 text-blue-700" />
        </Button>

        <Button
          variant="outline"
          extraClassNames="border-l-0 rounded-r-sm"
          innerText="Sheet Info"
        >
          <SVG60 className="inline mr-1 text-blue-700" />
        </Button>
      </div>
    </section>
  );
}
