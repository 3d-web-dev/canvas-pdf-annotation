import { Point, Rect, Polygon, SegmentIntersectsPolyline } from "./Point";
import { BaseShape, SHAPE_Type, toRGB } from "./BaseShape";
import { MLineShape } from "./MLineShape";
import { Coords } from "./Coords";
import {
  StandardFonts,
  pushGraphicsState,
  setGraphicsState,
  moveTo,
  lineTo,
  appendBezierCurve,
  closePath,
  drawEllipsePath,
  setFillingColor,
  setStrokingColor,
  rgb,
  degrees,
  radians,
  PDFName,
  fill,
  fillAndStroke,
  stroke,
  setLineWidth,
  setLineCap,
  LineCapStyle,
  popGraphicsState,
} from "pdf-lib";
export class MPolylineShape extends BaseShape {
  constructor() {
    super();
    this.poly = new Polygon();
    this.type = SHAPE_Type.POLYLINE_MEASURE;
  }
  static from(json) {
    var polylineShape = new MPolylineShape();
    polylineShape.type = json.type;
    polylineShape.color = json.color;
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
      if (this.type === SHAPE_Type.POLYGON_MEASURE) return 0;
    }
    return -1;
  }
  drawPdfShape(page) {
    var rgbColor = toRGB(this.color);
    var pdfColor = rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255);
    const { width, height } = page.getSize();
    const extGState = page.doc.context.obj({
      Type: "ExtGState",
      ca: BaseShape.transparent, // filling
    });
    var ptArray = Coords.DocPolygonToPdfScreen(this.poly.ptArray, height);
    page.doc.embedFont(StandardFonts.Helvetica).then((pdfFont) => {
      page.pushOperators(pushGraphicsState());
      page.pushOperators(setLineWidth(BaseShape.penWidth));
      page.pushOperators(setStrokingColor(pdfColor));
      page.pushOperators(setFillingColor(pdfColor));
      page.node.setExtGState(PDFName.of("GS-1234"), extGState);
      page.pushOperators(setGraphicsState("GS-1234"));
      page.pushOperators(moveTo(ptArray[0].x, ptArray[0].y));
      for (var i = 1; i < ptArray.length; i++)
        page.pushOperators(lineTo(ptArray[i].x, ptArray[i].y));
      page.pushOperators(setLineCap(LineCapStyle.Round));
      if (this.type === SHAPE_Type.POLYLINE_MEASURE) {
        var n = (ptArray.length / 2) | 0;
        var range = this.poly.getLength() * MLineShape.pixelRange;
        var msg = range.toFixed(1) + "m";
        var testWidth =
          pdfFont.widthOfTextAtSize(msg, BaseShape.mTextHeight) + 10;
        page.pushOperators(stroke());
        page.pushOperators(popGraphicsState());
        page.drawText(msg, {
          x: ptArray[n].x - testWidth / 2,
          y: ptArray[n].y,
          size: BaseShape.mTextHeight,
          color: pdfColor,
          lineHeight: BaseShape.mTextHeight + 2,
        });
      } else {
        var ptCenter = this.poly.GetCentroid();
        var rect = new Rect();
        rect.extendArray(this.poly.ptArray);
        if (!rect.contains(ptCenter, 0)) {
          ptCenter = this.poly.GetCenter();
        }
        ptCenter.y = height - ptCenter.y;
        range =
          this.poly.GetArea() * MLineShape.pixelRange * MLineShape.pixelRange;
        msg = range.toFixed(1) + "m2";
        testWidth = pdfFont.widthOfTextAtSize(msg, BaseShape.mTextHeight) + 10;
        page.pushOperators(fillAndStroke());
        page.pushOperators(popGraphicsState());
        page.drawText(msg, {
          x: ptCenter.x - testWidth / 2,
          y: ptCenter.y,
          size: BaseShape.mTextHeight,
          color: pdfColor,
          lineHeight: BaseShape.mTextHeight + 2,
        });
      }
    });
  }
  drawShape(ctx, coords) {
    if (this.poly.ptArray.length === 0) return;
    ctx.save();
    var ptArray = coords.DocPolygonToScreen(this.poly.ptArray);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = MLineShape.mLineWidth;
    ctx.lineCap = "round";
    ctx.font = BaseShape.mTextHeight + "px Arial";
    ctx.textAlign = "center";
    if (this.type === SHAPE_Type.POLYLINE_MEASURE) {
      var range = this.poly.getLength() * MLineShape.pixelRange;
      var msg = range.toFixed(1) + "m";
      var metrics = ctx.measureText(msg);
      var testWidth = metrics.width;
      var n = (ptArray.length / 2) | 0;
      var cx = ptArray[n].x;
      var cy = ptArray[n].y;
      var rect = new Rect();
      rect.leftTop.x = cx - testWidth / 2;
      rect.leftTop.y = cy - BaseShape.mTextHeight / 2;
      rect.rightBottom.x = cx + testWidth / 2;
      rect.rightBottom.y = cy + BaseShape.mTextHeight / 2;
      let region = new Path2D();
      var i = 0;
      region.moveTo(ptArray[i].x, ptArray[i].y);
      i++;
      for (; i < ptArray.length; i++) {
        // if (rect.contains(ptArray[i], 0)) {
        //     ctx.stroke(region);
        //     i++;
        //     while (i < ptArray.length && rect.contains(ptArray[i], 0)) i++;
        //     if (i === ptArray.length) break;
        //     region.moveTo(ptArray[i].x, ptArray[i].y);
        // }
        // else
        region.lineTo(ptArray[i].x, ptArray[i].y);
      }
      ctx.stroke(region);
      ctx.fillStyle = this.color;
      ctx.fillText(msg, ptArray[n].x, ptArray[n].y + BaseShape.mTextHeight / 2);
    } else {
      let region = new Path2D();
      region.moveTo(ptArray[0].x, ptArray[0].y);
      for (i = 1; i < ptArray.length; i++)
        region.lineTo(ptArray[i].x, ptArray[i].y);
      ctx.stroke(region);
      region.closePath();
      ctx.fillStyle = this.color;
      ctx.globalAlpha = BaseShape.transparent;
      ctx.fill(region, "evenodd");
      var ptCenter = this.poly.GetCentroid();
      rect = new Rect();
      rect.extendArray(this.poly.ptArray);
      if (!rect.contains(ptCenter, 0)) {
        ptCenter = this.poly.GetCenter();
      }
      var pt = coords.DocPtToScreen(ptCenter);
      range =
        this.poly.GetArea() * MLineShape.pixelRange * MLineShape.pixelRange;
      ctx.font = BaseShape.mTextHeight + "px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 1;
      msg = range.toFixed(1) + "m2";
      ctx.fillText(msg, pt.x, pt.y + BaseShape.mTextHeight / 2);
    }
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
