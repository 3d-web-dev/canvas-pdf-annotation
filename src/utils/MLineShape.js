import { Point, Polygon, SegmentIntersectsPolyline } from "./Point";
import { BaseShape, SHAPE_Type, MEASURE_Unit, toRGB } from "./BaseShape";
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
export class MLineShape extends BaseShape {
  constructor() {
    super();
    this.line = new Polygon();
    this.type = SHAPE_Type.CALIBRATION;
    this.unit = MEASURE_Unit.METER;
  }
  setUnit(u) {
    this.unit = u;
  }
  static from(json) {
    var shape = new MLineShape();
    shape.type = json.type;
    shape.color = json.color;
    shape.unit = json.unit;
    for (var i = 0; i < json.line.ptArray.length; i++)
      shape.line.addPoint(
        new Point(json.line.ptArray[i].x, json.line.ptArray[i].y)
      );
    shape.boundRect.leftTop = new Point(
      json.boundRect.leftTop.x,
      json.boundRect.leftTop.y
    );
    shape.boundRect.rightBottom = new Point(
      json.boundRect.rightBottom.x,
      json.boundRect.rightBottom.y
    );
    return shape;
  }
  setRange(r, u) {
    var scale = 1;
    if (u === MEASURE_Unit.FEET) scale = 0.3048;
    this.unit = u;
    if (this.type === SHAPE_Type.CALIBRATION)
      MLineShape.pixelRange = (r * scale) / this.line.getLength();
  }
  moveTo(pt) {
    this.line.clear();
    this.line.addPoint(pt);
    this.line.addPoint(pt.clone());
  }
  lineTo(pt) {
    this.line.ptArray[1].x = pt.x;
    this.line.ptArray[1].y = pt.y;
  }
  contains(pt) {
    if (super.contains(pt) >= 0) {
      var distance = this.line.distance(pt);
      var tolW = BaseShape.getTolerance();
      var tolerance = tolW * tolW;
      if (distance < tolerance) {
        for (var i = 0; i < this.line.ptArray.length; i++) {
          distance = pt.distance2(this.line.ptArray[i]);
          if (distance < tolerance) {
            return i + 1;
          }
        }
        return 0;
      }
    }
    return -1;
  }
  drawTextOnLine(ctx, ptArray, msg) {
    var x2 = (ptArray[0].x + ptArray[1].x) / 2;
    var y2 = (ptArray[0].y + ptArray[1].y) / 2;
    ctx.save();
    ctx.translate(x2, y2);
    if (ptArray[0].x - ptArray[1].x > 0)
      ctx.rotate(
        Math.atan2(ptArray[0].y - ptArray[1].y, ptArray[0].x - ptArray[1].x)
      );
    else
      ctx.rotate(
        Math.atan2(-ptArray[0].y + ptArray[1].y, -ptArray[0].x + ptArray[1].x)
      );
    ctx.font = BaseShape.mTextHeight + "px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = this.color;
    var metrics = ctx.measureText(msg);
    var testWidth = metrics.width;
    ctx.fillText(msg, 0, BaseShape.mTextHeight / 2);
    const arrowSize = 8;
    var d = Math.max(0.1, Math.sqrt(ptArray[0].distance2(ptArray[1])));
    ctx.strokeStyle = this.color;
    ctx.lineWidth = MLineShape.mLineWidth;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-d / 2, 0);
    ctx.lineTo(-testWidth / 2 - 4, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(testWidth / 2 + 4, 0);
    ctx.lineTo(d / 2, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-d / 2, -arrowSize);
    ctx.lineTo(-d / 2, arrowSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(d / 2, -arrowSize);
    ctx.lineTo(d / 2, arrowSize);
    ctx.stroke();
    if (this.type === SHAPE_Type.CALIBRATION) {
      ctx.beginPath();
      ctx.moveTo(-d / 2 + arrowSize / 2, -arrowSize * 0.8);
      ctx.lineTo(-d / 2 - arrowSize / 2, arrowSize * 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(d / 2 + arrowSize / 2, -arrowSize * 0.8);
      ctx.lineTo(d / 2 - arrowSize / 2, arrowSize * 0.8);
      ctx.stroke();
    }
    ctx.restore();
  }
  drawShape(ctx, coords) {
    var ptArray = coords.DocPolygonToScreen(this.line.ptArray);
    var range;
    range = this.line.getLength() * MLineShape.pixelRange;
    this.drawTextOnLine(ctx, ptArray, range.toFixed(1) + "m");
    super.drawShape(ctx, coords);
  }
  drawPdfShape(page) {
    var rgbColor = toRGB(this.color);
    var pdfColor = rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255);
    const { width, height } = page.getSize();
    var range;
    range = this.line.getLength() * MLineShape.pixelRange;
    var msg = range.toFixed(1) + "m";
    var ptArray = Coords.DocPolygonToPdfScreen(this.line.ptArray, height);

    const arrowSize = 12;
    var moveVector = { x: arrowSize, y: 0 };
    var x2, y2, x3, y3;
    var d = Math.max(0.1, Math.sqrt(ptArray[0].distance2(ptArray[1])));
    var cosA = (ptArray[0].x - ptArray[1].x) / d;
    var sinA = (ptArray[0].y - ptArray[1].y) / d;
    x2 = cosA * moveVector.x - sinA * moveVector.y;
    y2 = sinA * moveVector.x + cosA * moveVector.y;
    moveVector.x = x2;
    moveVector.y = y2;

    page.doc.embedFont(StandardFonts.Helvetica).then((pdfFont) => {
      var testWidth =
        pdfFont.widthOfTextAtSize(msg, BaseShape.mTextHeight) + 10;
      page.pushOperators(pushGraphicsState());
      page.pushOperators(setLineWidth(MLineShape.mLineWidth));
      page.pushOperators(setStrokingColor(pdfColor));
      page.pushOperators(setLineCap(LineCapStyle.Round));
      page.pushOperators(moveTo(ptArray[0].x, ptArray[0].y));
      page.pushOperators(
        lineTo(
          (-cosA * (d - testWidth)) / 2 + ptArray[0].x,
          (-sinA * (d - testWidth)) / 2 + ptArray[0].y
        )
      );
      page.pushOperators(stroke());
      page.pushOperators(moveTo(ptArray[1].x, ptArray[1].y));
      page.pushOperators(
        lineTo(
          (cosA * (d - testWidth)) / 2 + ptArray[1].x,
          (sinA * (d - testWidth)) / 2 + ptArray[1].y
        )
      );
      page.pushOperators(stroke());

      x2 =
        Math.cos(Math.PI / 2) * moveVector.x -
        Math.sin(Math.PI / 2) * moveVector.y;
      y2 =
        Math.sin(Math.PI / 2) * moveVector.x +
        Math.cos(Math.PI / 2) * moveVector.y;

      x3 =
        Math.cos(-Math.PI / 2) * moveVector.x -
        Math.sin(-Math.PI / 2) * moveVector.y;
      y3 =
        Math.sin(-Math.PI / 2) * moveVector.x +
        Math.cos(-Math.PI / 2) * moveVector.y;

      page.drawText(msg, {
        x:
          (x2 * BaseShape.mTextHeight) / arrowSize / 2 +
          (-cosA * (d - testWidth + 5)) / 2 +
          ptArray[0].x,
        y:
          (y2 * BaseShape.mTextHeight) / arrowSize / 2 +
          (-sinA * (d - testWidth + 5)) / 2 +
          ptArray[0].y,
        size: BaseShape.mTextHeight,
        color: pdfColor,
        rotate: radians(Math.acos(-cosA)),
        lineHeight: BaseShape.mTextHeight + 2,
      });

      page.pushOperators(
        moveTo(x2 + ptArray[1].x, y2 + ptArray[1].y),
        lineTo(x3 + ptArray[1].x, y3 + ptArray[1].y),
        stroke()
      );
      page.pushOperators(
        moveTo(x2 + ptArray[0].x, y2 + ptArray[0].y),
        lineTo(x3 + ptArray[0].x, y3 + ptArray[0].y),
        stroke()
      );

      if (this.type === SHAPE_Type.CALIBRATION) {
        x2 =
          Math.cos(Math.PI / 3) * moveVector.x -
          Math.sin(Math.PI / 3) * moveVector.y;
        y2 =
          Math.sin(Math.PI / 3) * moveVector.x +
          Math.cos(Math.PI / 3) * moveVector.y;

        x3 =
          Math.cos(Math.PI + Math.PI / 3) * moveVector.x -
          Math.sin(Math.PI + Math.PI / 3) * moveVector.y;
        y3 =
          Math.sin(Math.PI + Math.PI / 3) * moveVector.x +
          Math.cos(Math.PI + Math.PI / 3) * moveVector.y;

        page.pushOperators(
          moveTo(x2 + ptArray[1].x, y2 + ptArray[1].y),
          lineTo(x3 + ptArray[1].x, y3 + ptArray[1].y),
          stroke()
        );
        page.pushOperators(
          moveTo(x2 + ptArray[0].x, y2 + ptArray[0].y),
          lineTo(x3 + ptArray[0].x, y3 + ptArray[0].y),
          stroke()
        );
      }
      page.pushOperators(popGraphicsState());
    });
  }
  drawBound(ctx, coords) {
    if (super.drawBound(ctx, coords)) {
      ctx.fillStyle = "green";
      var line = coords.DocPolygonToScreen(this.line.ptArray);
      ctx.fillRect(
        line[0].x - BaseShape.markWidth / 2,
        line[0].y - BaseShape.markWidth / 2,
        BaseShape.markWidth,
        BaseShape.markWidth
      );
      ctx.fillRect(
        line[1].x - BaseShape.markWidth / 2,
        line[1].y - BaseShape.markWidth / 2,
        BaseShape.markWidth,
        BaseShape.markWidth
      );
    }
    return false;
  }
  mouseDown(pt) {
    this.moveTo(pt.clone());
  }
  mouseMove(pt) {
    this.lineTo(pt.clone());
  }
  mouseUp(pt) {
    this.setUnit(MEASURE_Unit.METER);
    if (this.type === SHAPE_Type.CALIBRATION) {
      var range = 1; // 1m
      this.setRange(range, MEASURE_Unit.METER);
    }
    this.boundRect.invalidate();
    this.boundRect.extendArray(this.line.ptArray);
    return true;
  }
  shiftBy(dx, dy) {
    this.line.shiftBy(dx, dy);
    super.shiftBy(dx, dy);
  }
  shiftPointAt(id, dx, dy) {
    this.line.shiftPointAt(id, dx, dy);
    this.boundRect.invalidate();
    this.boundRect.extendArray(this.line.ptArray);
  }
  intersects(pt1, pt2) {
    return SegmentIntersectsPolyline(pt1, pt2, this.line.ptArray, false);
  }
}
MLineShape.pixelRange = 0;
MLineShape.mLineWidth = 1;
