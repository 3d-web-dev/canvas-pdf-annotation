import { Point, Polygon, SegmentIntersectsPolyline } from "./Point";
import { BaseShape, SHAPE_Type, toRGB } from "./BaseShape";
import Drawing from "./Drawing";
import { Coords } from "./Coords";
import {
  pushGraphicsState,
  setGraphicsState,
  moveTo,
  lineTo,
  closePath,
  setFillingColor,
  setStrokingColor,
  rgb,
  PDFName,
  fill,
  stroke,
  setLineWidth,
  setLineCap,
  LineCapStyle,
  popGraphicsState,
} from "pdf-lib";
export class PolylineShape extends BaseShape {
  constructor() {
    super();
    this.poly = new Polygon();
    this.type = SHAPE_Type.POLY_LINE;
    this.bDashLine = false;
  }
  static from(json) {
    var polylineShape = new PolylineShape();
    polylineShape.type = json.type;
    polylineShape.color = json.color;
    polylineShape.bDashLine = json.bDashLine;
    for (var i = 0; i < json.poly.ptArray.length; i++)
      polylineShape.poly.addPoint(
        new Point(json.poly.ptArray[i].x, json.poly.ptArray[i].y)
      );
    polylineShape.boundRect.leftTop = new Point(
      json.boundRect.leftTop.x,
      json.boundRect.leftTop.y
    );
    polylineShape.boundRect.rightBottom = new Point(
      json.boundRect.rightBottom.x,
      json.boundRect.rightBottom.y
    );
    return polylineShape;
  }
  setToDash() {
    this.bDashLine = true;
  }
  reset() {
    this.poly.clear();
  }
  moveTo(pt) {
    this.poly.clear();
    this.poly.addPoint(pt);
  }
  lineTo(pt) {
    this.poly.addPoint(new Point(pt.x, pt.y));
  }
  contains(pt) {
    if (super.contains(pt) >= 0) {
      var distance = this.poly.distance(pt);
      var tolW = BaseShape.getTolerance();
      var tolerance = tolW * tolW;
      if (distance < tolerance) {
        for (var i = 0; i < this.poly.ptArray.length; i++) {
          distance = pt.distance2(this.poly.ptArray[i]);
          if (distance < tolerance) {
            return i + 1;
          }
        }
        return 0;
      }
    }
    return -1;
  }
  drawPdfShape(page) {
    var rgbColor = toRGB(this.color);
    var pdfColor = rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255);
    const { width, height } = page.getSize();
    var ptArray = Coords.DocPolygonToPdfScreen(this.poly.ptArray, height);
    switch (this.type) {
      case SHAPE_Type.POLY_LINE:
        page.pushOperators(pushGraphicsState());
        page.pushOperators(setLineWidth(BaseShape.penWidth));
        page.pushOperators(setStrokingColor(pdfColor));
        page.pushOperators(moveTo(ptArray[0].x, ptArray[0].y));
        for (var i = 1; i < ptArray.length; i++)
          page.pushOperators(lineTo(ptArray[i].x, ptArray[i].y));
        page.pushOperators(setLineCap(LineCapStyle.Round));
        page.pushOperators(stroke());
        page.pushOperators(popGraphicsState());
        break;
      case SHAPE_Type.POLY_BRUSH:
        const extGState = page.doc.context.obj({
          Type: "ExtGState",
          //   ca: 0.1, // filling
          CA: BaseShape.transparent, // stroking
        });
        page.pushOperators(pushGraphicsState());
        page.node.setExtGState(PDFName.of("GS-1234"), extGState);
        page.pushOperators(setGraphicsState("GS-1234"));
        page.pushOperators(setLineWidth(BaseShape.highlightWidth));
        page.pushOperators(setStrokingColor(pdfColor));
        page.pushOperators(moveTo(ptArray[0].x, ptArray[0].y));
        for (var i = 1; i < ptArray.length; i++)
          page.pushOperators(lineTo(ptArray[i].x, ptArray[i].y));
        page.pushOperators(setLineCap(LineCapStyle.Round));
        page.pushOperators(stroke());
        page.pushOperators(popGraphicsState());
        break;
      default:
        break;
    }
  }
  drawShape(ctx, coords) {
    if (this.poly.ptArray.length === 0) return;
    ctx.save();
    var ptArray = coords.DocPolygonToScreen(this.poly.ptArray);
    if (this.type === SHAPE_Type.POLY_LINE) {
      ctx.strokeStyle = this.color;
      if (this.bDashLine) ctx.setLineDash([15, 5]);
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
    } else {
      ctx.strokeStyle = this.color;
      ctx.lineCap = "round";
      ctx.lineWidth = BaseShape.highlightWidth * Drawing.self.coords.scale;
      ctx.globalAlpha = BaseShape.transparent;
    }
    ctx.beginPath();
    ctx.moveTo(ptArray[0].x, ptArray[0].y);
    for (var i = 1; i < this.poly.ptArray.length; i++)
      ctx.lineTo(ptArray[i].x, ptArray[i].y);
    ctx.stroke();
    ctx.restore();
    super.drawShape(ctx, coords);
  }
  drawBound(ctx, coords) {
    return super.drawBound(ctx, coords);
  }
  getSize() {
    return this.poly.ptArray.length;
  }
  mouseDown(pt) {
    this.moveTo(pt.clone());
  }
  mouseMove(pt) {
    this.lineTo(pt.clone());
  }
  mouseUp(pt) {
    this.poly.smooth();
    this.boundRect.invalidate();
    this.boundRect.extendArray(this.poly.ptArray);
    return true;
  }
  shiftBy(dx, dy) {
    this.poly.shiftBy(dx, dy);
    super.shiftBy(dx, dy);
  }
  intersects(pt1, pt2) {
    return SegmentIntersectsPolyline(pt1, pt2, this.poly.ptArray, false);
  }
}
