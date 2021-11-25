import { BaseShape, SHAPE_Type, toRGB } from "./BaseShape";
import { Point, Polygon, SegmentIntersectsPolyline } from "./Point";
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
  PDFName,
  fill,
  fillAndStroke,
  stroke,
  setLineWidth,
  setLineCap,
  LineCapStyle,
  popGraphicsState,
} from "pdf-lib";
export class MRectShape extends BaseShape {
  constructor() {
    super();
    this.poly = new Polygon();
    this.type = SHAPE_Type.RECT_MEASURE;
  }
  static from(json) {
    var rectShape = new MRectShape();
    rectShape.type = json.type;
    rectShape.color = json.color;
    for (var i = 0; i < json.poly.ptArray.length; i++)
      rectShape.poly.addPoint(
        new Point(json.poly.ptArray[i].x, json.poly.ptArray[i].y)
      );
    rectShape.boundRect.leftTop = new Point(
      json.boundRect.leftTop.x,
      json.boundRect.leftTop.y
    );
    rectShape.boundRect.rightBottom = new Point(
      json.boundRect.rightBottom.x,
      json.boundRect.rightBottom.y
    );
    return rectShape;
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
      page.pushOperators(setLineWidth(1));
      page.pushOperators(setStrokingColor(pdfColor));
      page.pushOperators(setFillingColor(pdfColor));
      page.node.setExtGState(PDFName.of("GS-1234"), extGState);
      page.pushOperators(setGraphicsState("GS-1234"));
      page.pushOperators(moveTo(ptArray[0].x, ptArray[0].y));
      for (var i = 1; i < ptArray.length; i++)
        page.pushOperators(lineTo(ptArray[i].x, ptArray[i].y));
      page.pushOperators(closePath());
      page.pushOperators(setLineCap(LineCapStyle.Round));
      page.pushOperators(fillAndStroke());
      page.pushOperators(popGraphicsState());

      page.setFont(pdfFont);
      var area =
        Math.abs(
          (ptArray[0].x - ptArray[1].x) * (ptArray[1].y - ptArray[2].y)
        ) *
        MLineShape.pixelRange *
        MLineShape.pixelRange;
      var msg = area.toFixed(1) + "m2";
      page.drawText(msg, {
        x: (ptArray[0].x + ptArray[1].x) / 2,
        y: (ptArray[1].y + ptArray[2].y) / 2 - BaseShape.mTextHeight / 2,
        size: BaseShape.mTextHeight,
        color: pdfColor,
        lineHeight: BaseShape.mTextHeight,
      });
    });
  }
  drawShape(ctx, coords) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = MLineShape.mLineWidth;
    ctx.lineCap = "round";
    var ptArray = coords.DocPolygonToScreen(this.poly.ptArray);
    let region = new Path2D();
    region.moveTo(ptArray[0].x, ptArray[0].y);
    region.lineTo(ptArray[1].x, ptArray[1].y);
    region.lineTo(ptArray[2].x, ptArray[2].y);
    region.lineTo(ptArray[3].x, ptArray[3].y);
    region.lineTo(ptArray[0].x, ptArray[0].y);
    ctx.save();
    ctx.stroke(region);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = BaseShape.transparent;
    ctx.fill(region, "evenodd");
    ctx.restore();
    ctx.font = BaseShape.mTextHeight + "px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = this.color;
    var area =
      Math.abs(
        (this.poly.ptArray[0].x - this.poly.ptArray[1].x) *
          (this.poly.ptArray[1].y - this.poly.ptArray[2].y)
      ) *
      MLineShape.pixelRange *
      MLineShape.pixelRange;
    var msg = area.toFixed(1) + "m2";
    ctx.fillText(
      msg,
      (ptArray[0].x + ptArray[1].x) / 2,
      (ptArray[1].y + ptArray[2].y) / 2 + BaseShape.mTextHeight / 2
    );
    super.drawShape(ctx, coords);
  }
  drawBound(ctx, coords) {
    if (super.drawBound(ctx, coords)) {
      ctx.fillStyle = "green";
      var poly = coords.DocPolygonToScreen(this.poly.ptArray);
      ctx.fillRect(
        poly[0].x - BaseShape.markWidth / 2,
        poly[0].y - BaseShape.markWidth / 2,
        BaseShape.markWidth,
        BaseShape.markWidth
      );
      ctx.fillRect(
        poly[1].x - BaseShape.markWidth / 2,
        poly[1].y - BaseShape.markWidth / 2,
        BaseShape.markWidth,
        BaseShape.markWidth
      );
      ctx.fillRect(
        poly[2].x - BaseShape.markWidth / 2,
        poly[2].y - BaseShape.markWidth / 2,
        BaseShape.markWidth,
        BaseShape.markWidth
      );
      ctx.fillRect(
        poly[3].x - BaseShape.markWidth / 2,
        poly[3].y - BaseShape.markWidth / 2,
        BaseShape.markWidth,
        BaseShape.markWidth
      );
    }
    return false;
  }
  mouseDown(pt) {
    var p0 = pt.clone();
    this.poly.addPoint(p0);
    this.poly.addPoint(pt.clone());
    this.poly.addPoint(pt.clone());
    this.poly.addPoint(pt.clone());
  }
  mouseMove(pt) {
    var pt3 = this.poly.third();
    pt3.x = pt.x;
    pt3.y = pt.y;
    this.poly.second().x = pt.x;
    this.poly.fourth().y = pt.y;
  }
  mouseUp(pt) {
    this.boundRect.invalidate();
    this.boundRect.extendArray(this.poly.ptArray);
    return true;
  }
  shiftBy(dx, dy) {
    this.poly.shiftBy(dx, dy);
    super.shiftBy(dx, dy);
  }
  shiftPointAt(id, dx, dy) {
    this.poly.shiftPointAt(id, dx, dy);
    var pt = this.poly.ptArray[id];
    switch (id) {
      case 0:
        this.poly.fourth().x = pt.x;
        this.poly.second().y = pt.y;
        break;
      case 1:
        this.poly.first().y = pt.y;
        this.poly.third().x = pt.x;
        break;
      case 2:
        this.poly.second().x = pt.x;
        this.poly.fourth().y = pt.y;
        break;
      case 3:
        this.poly.first().x = pt.x;
        this.poly.third().y = pt.y;
        break;
      default:
        break;
    }
    this.boundRect.invalidate();
    this.boundRect.extendArray(this.poly.ptArray);
  }
  contains(pt) {
    var tolW = BaseShape.getTolerance();
    var tolerance = tolW * tolW;
    if (super.contains(pt) >= 0) {
      for (var i = 0; i < this.poly.ptArray.length; i++) {
        var distance = pt.distance2(this.poly.ptArray[i]);
        if (distance < tolerance) {
          return i + 1;
        }
      }
      return 0;
    }
    return -1;
  }
  intersects(pt1, pt2) {
    return SegmentIntersectsPolyline(pt1, pt2, this.poly.ptArray, true);
  }
}
