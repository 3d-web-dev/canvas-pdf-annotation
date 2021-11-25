import React from "react";

import { XIcon } from "@heroicons/react/solid";

import { deleteShape } from "../utils/Draw";

import TextElement from "./panel/TextElement";
import CalibrationElement from "./panel/CalibrationElement";
import CameraElement from "./panel/CameraElement";
import LinkElement from "./panel/LinkElement";

import { SHAPE_Type } from "../utils/BaseShape";
import { ContactSupportOutlined } from "@material-ui/icons";

var shapeNames = [
  "Unknown",
  "Line",
  "Arrow",
  "Calibration",
  "Measure Line",
  "Rect",
  "Ellipse",
  "Cloud",
  "Cross",
  "Highlighted Rect",
  "Highlighted Ellipse",
  "Highlighted Cloud",
  "Measure Rect",
  "Polyline",
  "Highlighted Polyline",
  "Measure Polyline",
  "Measure Polygon",
  "Text",
  "Symbol",
  "Camera",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

function getTitle(param) {
  if (param.type < 0) {
    return param.id + " Markups";
  } else return shapeNames[param.type];
}

export default function RightPanel({
  shape,
  close,
  link,
  setLink,
  setLabel,
  setFontSize,
  setBorders,
  setNote,
  message,
}) {
  return (
    <section
      className="absolute top-16 right-0 w-96 bg-gray-100 z-20 divide-y divide-gray-300"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      <div className="p-4 w-full">
        <button onClick={close}>
          <XIcon
            className="h-5 w-5 inline mr-4 text-gray-500 hover:text-gray-400"
            aria-hidden="true"
          />
        </button>
        <span className="capitalize text-md text-gray-500 font-semibold">
          {shape !== undefined
            ? getTitle({ id: shape.id, type: shape.type })
            : "Unknown"}
        </span>
      </div>
      <div className="p-4 w-full">
        {shape !== undefined && (
          <button
            className="capitalize text-sm text-red-400 hover:cursor-pointer"
            onClick={() => {
              deleteShape({ id: shape.id, type: shape.type });
              close();
            }}
          >
            Delete
          </button>
        )}
      </div>

      {shape !== undefined && //shape.obj .text, .textSize, .border
        (shape.type === SHAPE_Type.TEXT ? (
          <TextElement
            setLabel={setLabel}
            setFontSize={setFontSize}
            text={shape.obj.text}
            textSize={shape.obj.textSize}
            border={shape.obj.border}
          />
        ) : shape.type === SHAPE_Type.CALIBRATION ? (
          <CalibrationElement setLabel={setLabel} setFontSize={setFontSize} />
        ) : shape.type === SHAPE_Type.CAMERA ? (
          <CameraElement setLabel={setLabel} setFontSize={setFontSize} />
        ) : shape.type === SHAPE_Type.RECT_Highlight ? (
          <LinkElement
            link={link}
            setLink={setLink}
            setLabel={setLabel}
            setBorders={setBorders}
            setNote={setNote}
          />
        ) : shape.type === SHAPE_Type.ELLIPSE_Highlight ? (
          <LinkElement
            link={link}
            setLink={setLink}
            setLabel={setLabel}
            setBorders={setBorders}
            setNote={setNote}
          />
        ) : shape.type === SHAPE_Type.CLOUD_Highlight ? (
          <LinkElement
            link={link}
            setLink={setLink}
            setLabel={setLabel}
            setBorders={setBorders}
            setNote={setNote}
          />
        ) : (
          <LinkElement
            link={link}
            setLink={setLink}
            setLabel={setLabel}
            setBorders={setBorders}
            setNote={setNote}
          />
        ))}
      <div className="p-4 pt-8 w-full">
        <span className="text-sm block text-gray-500">
          Created by {message.author} on {message.date}
        </span>
        <span className="text-sm block text-gray-400">{message.email}</span>
      </div>
    </section>
  );
}
