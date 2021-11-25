import Drawing from "./Drawing";
import { BaseShape, SHAPE_Type } from "./BaseShape";
import { ACTION } from "./EditShape";
import { MLineShape } from "./MLineShape";

let draw = null;
let docMap = new Map();
BaseShape.loadSvgs();

export function startApp(sheet, callback) {
  if (draw === null)
    draw = new Drawing(document.getElementById("container"), callback);
  if (draw.docUrl != null) docMap[draw.docUrl] = draw.save();
  draw.loadDocument(sheet.type, sheet.sheet, sheet.page, docMap[sheet.sheet]);
}

export function prepareDraw() {
  if (draw.shapeEditor.isValid) {
    draw.shapeEditor.reset();
    draw.drawCanvases(true);
  }
}

// right controls
export function selectDraw() {
  draw.shapeEditor.setAction(ACTION.SELECT);
  draw.showCursor();
}

export function multiSelectDraw() {
  draw.shapeEditor.setAction(ACTION.MULTI_SELECT);
  draw.showCursor();
}

export function cloudDraw() {
  prepareDraw();
  draw.shapeEditor.setAction(ACTION.DRAW);
  draw.shapeEditor.setDrawType(SHAPE_Type.CLOUD);
  draw.showCursor();
}

export function arrowDraw() {
  prepareDraw();
  draw.shapeEditor.setAction(ACTION.DRAW);
  draw.shapeEditor.setDrawType(SHAPE_Type.ARROW);
  draw.showCursor();
}

export function penDraw() {
  prepareDraw();
  draw.shapeEditor.setAction(ACTION.DRAW);
  draw.shapeEditor.setDrawType(SHAPE_Type.POLY_LINE);
  draw.showCursor();
}

export function brushDraw() {
  prepareDraw();
  draw.shapeEditor.setAction(ACTION.DRAW);
  draw.shapeEditor.setDrawType(SHAPE_Type.POLY_BRUSH);
  draw.showCursor();
}

export function textDraw() {
  prepareDraw();
  draw.shapeEditor.setAction(ACTION.DRAW);
  draw.shapeEditor.setDrawType(SHAPE_Type.TEXT);
  draw.showCursor();
}

export function rectDraw() {
  prepareDraw(draw);
  draw.shapeEditor.setAction(ACTION.DRAW);
  draw.shapeEditor.setDrawType(SHAPE_Type.RECT);
  draw.showCursor();
}

export function ellipseDraw() {
  prepareDraw();
  draw.shapeEditor.setAction(ACTION.DRAW);
  draw.shapeEditor.setDrawType(SHAPE_Type.ELLIPSE);
  draw.showCursor();
}

export function lineDraw() {
  prepareDraw(draw);
  draw.shapeEditor.setAction(ACTION.DRAW);
  draw.shapeEditor.setDrawType(SHAPE_Type.LINE);
  draw.showCursor();
}

export function xDraw() {
  prepareDraw();
  draw.shapeEditor.setAction(ACTION.DRAW);
  draw.shapeEditor.setDrawType(SHAPE_Type.CROSS);
  draw.showCursor();
}

export function cloudLinkDraw() {
  prepareDraw();
  draw.shapeEditor.setAction(ACTION.DRAW);
  draw.shapeEditor.setDrawType(SHAPE_Type.CLOUD_Highlight);
  draw.showCursor();
}

export function ellipseLinkDraw() {
  prepareDraw();
  draw.shapeEditor.setAction(ACTION.DRAW);
  draw.shapeEditor.setDrawType(SHAPE_Type.ELLIPSE_Highlight);
  draw.showCursor();
}

export function rectLinkDraw() {
  prepareDraw();
  draw.shapeEditor.setAction(ACTION.DRAW);
  draw.shapeEditor.setDrawType(SHAPE_Type.RECT_Highlight);
  draw.showCursor();
}

export function calibrationDraw() {
  if (!draw.containsType(SHAPE_Type.CALIBRATION)) {
    prepareDraw();
    draw.shapeEditor.setAction(ACTION.DRAW);
    draw.shapeEditor.setDrawType(SHAPE_Type.CALIBRATION);
    draw.showCursor();
  }
}

export function lineMeasureDraw() {
  if (MLineShape.pixelRange > 0) {
    prepareDraw();
    draw.shapeEditor.setAction(ACTION.DRAW);
    draw.shapeEditor.setDrawType(SHAPE_Type.LINE_MEASURE);
    draw.showCursor();
  }
}

export function rectMeasureDraw() {
  if (MLineShape.pixelRange > 0) {
    prepareDraw();
    draw.shapeEditor.setAction(ACTION.DRAW);
    draw.shapeEditor.setDrawType(SHAPE_Type.RECT_MEASURE);
    draw.showCursor();
  }
}

export function polylineMeasureDraw() {
  if (MLineShape.pixelRange > 0) {
    prepareDraw();
    draw.shapeEditor.setAction(ACTION.DRAW);
    draw.shapeEditor.setDrawType(SHAPE_Type.POLYLINE_MEASURE);
    draw.showCursor();
  }
}

export function polygonMeasureDraw() {
  if (MLineShape.pixelRange > 0) {
    prepareDraw();
    draw.shapeEditor.setAction(ACTION.DRAW);
    draw.shapeEditor.setDrawType(SHAPE_Type.POLYGON_MEASURE);
    draw.showCursor();
  }
}

export function colorDraw(color) {
  draw.color = color;
  if (draw.shapeEditor.isValid()) {
    for (var i = 0; i < draw.shapeEditor.selObjArray.length; i++) {
      draw.shapeEditor.selObjArray[i].setColor(draw.color);
    }
    draw.drawCanvases(true);
  }
}

export function symbolDraw(id) {
  prepareDraw();
  draw.shapeEditor.setAction(ACTION.DRAW);
  draw.shapeEditor.setDrawType(SHAPE_Type.SYMBOL);
  draw.shapeEditor.symId = id;
  draw.showCursor();
}
export function cameraDraw() {
  prepareDraw();
  draw.shapeEditor.setAction(ACTION.DRAW);
  draw.shapeEditor.setDrawType(SHAPE_Type.CAMERA);
  draw.showCursor();
}

// left controls
export function zoomInDraw() {
  draw.leftZoomIn();
}

export function zoomOutDraw() {
  draw.leftZoomOut();
}

export function zoomFullDraw() {
  draw.leftZoomFull();
}

export function zoomFullScreenDraw() {
  draw.leftFullscreen();
}

// right panel
export function deleteShape(shapeInfo) {
  draw.deleteShape(shapeInfo);
}

export function setText(label, size, borders) {
  draw.editTextShape(label, size, borders);
}

// header
export function downloadToPdf() {
  draw.downloadToPdf();
}
