import { Point, Polygon, SegmentIntersectsPolyline } from "./Point";
import { BaseShape, SHAPE_Type, toRGB } from "./BaseShape";
import { Coords } from "./Coords";
import {
  pushGraphicsState,
  moveTo,
  lineTo,
  closePath,
  setFillingColor,
  setStrokingColor,
  rgb,
  fill,
  stroke,
  setLineWidth,
  popGraphicsState,
} from "pdf-lib";

const ARROW_SIZE = 9;
export class LineShape extends BaseShape {
  constructor() {
    super();
    this.line = new Polygon();
    this.type = SHAPE_Type.LINE;
  }
  static from(json) {
    var lineShape = new LineShape();
    lineShape.type = json.type;
    lineShape.color = json.color;
    for (var i = 0; i < json.line.ptArray.length; i++)
      lineShape.line.addPoint(
        new Point(json.line.ptArray[i].x, json.line.ptArray[i].y)
      );
    lineShape.boundRect.leftTop = new Point(
      json.boundRect.leftTop.x,
      json.boundRect.leftTop.y
    );
    lineShape.boundRect.rightBottom = new Point(
      json.boundRect.rightBottom.x,
      json.boundRect.rightBottom.y
    );
    return lineShape;
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
  drawShape(ctx, coords) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = BaseShape.penWidth;
    ctx.lineCap = "round";
    var ptArray = coords.DocPolygonToScreen(this.line.ptArray);
    switch (this.type) {
      case SHAPE_Type.LINE:
        ctx.beginPath();
        ctx.moveTo(ptArray[0].x, ptArray[0].y);
        ctx.lineTo(ptArray[1].x, ptArray[1].y);
        ctx.stroke();
        break;
      case SHAPE_Type.ARROW:
        const arrowSize = BaseShape.penWidth * ARROW_SIZE;
        var moveVector = { x: arrowSize, y: 0 };
        var x2, y2;
        var d = Math.max(0.1, Math.sqrt(ptArray[0].distance2(ptArray[1])));
        var cosA = (ptArray[0].x - ptArray[1].x) / d;
        var sinA = (ptArray[0].y - ptArray[1].y) / d;
        x2 = cosA * moveVector.x - sinA * moveVector.y;
        y2 = sinA * moveVector.x + cosA * moveVector.y;
        moveVector.x = x2;
        moveVector.y = y2;
        ctx.beginPath();
        ctx.moveTo(ptArray[1].x, ptArray[1].y);
        x2 =
          Math.cos(Math.PI / 6) * moveVector.x -
          Math.sin(Math.PI / 6) * moveVector.y;
        y2 =
          Math.sin(Math.PI / 6) * moveVector.x +
          Math.cos(Math.PI / 6) * moveVector.y;
        ctx.lineTo(x2 + ptArray[1].x, y2 + ptArray[1].y);
        x2 =
          Math.cos(-Math.PI / 6) * moveVector.x -
          Math.sin(-Math.PI / 6) * moveVector.y;
        y2 =
          Math.sin(-Math.PI / 6) * moveVector.x +
          Math.cos(-Math.PI / 6) * moveVector.y;
        ctx.lineTo(x2 + ptArray[1].x, y2 + ptArray[1].y);
        ctx.lineTo(ptArray[1].x, ptArray[1].y);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill("evenodd");

        ctx.beginPath();
        ctx.moveTo(ptArray[0].x, ptArray[0].y);
        moveVector = { x: (arrowSize * Math.sqrt(3)) / 2, y: 0 };
        x2 = cosA * moveVector.x - sinA * moveVector.y;
        y2 = sinA * moveVector.x + cosA * moveVector.y;
        ctx.lineTo(x2 + ptArray[1].x, y2 + ptArray[1].y);
        ctx.stroke();
        break;
      default:
        break;
    }
    super.drawShape(ctx, coords);
  }
  drawPdfShape(page) {
    var rgbColor = toRGB(this.color);
    var pdfColor = rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255);
    const { width, height } = page.getSize();
    var ptArray = Coords.DocPolygonToPdfScreen(this.line.ptArray, height);
    switch (this.type) {
      case SHAPE_Type.LINE:
        page.setStrokeWidth();
        page.pushOperators(
          pushGraphicsState(),
          moveTo(ptArray[0].x, ptArray[0].y),
          lineTo(ptArray[1].x, ptArray[1].y),
          setStrokingColor(pdfColor),
          setLineWidth(BaseShape.penWidth),
          stroke(),
          popGraphicsState()
        );
        break;
      case SHAPE_Type.ARROW:
        const arrowSize = BaseShape.penWidth * ARROW_SIZE;
        var moveVector = { x: arrowSize, y: 0 };
        var x2, y2, x3, y3;
        var d = Math.max(0.1, Math.sqrt(ptArray[0].distance2(ptArray[1])));
        var cosA = (ptArray[0].x - ptArray[1].x) / d;
        var sinA = (ptArray[0].y - ptArray[1].y) / d;
        x2 = cosA * moveVector.x - sinA * moveVector.y;
        y2 = sinA * moveVector.x + cosA * moveVector.y;
        moveVector.x = x2;
        moveVector.y = y2;

        x2 =
          Math.cos(Math.PI / 6) * moveVector.x -
          Math.sin(Math.PI / 6) * moveVector.y;
        y2 =
          Math.sin(Math.PI / 6) * moveVector.x +
          Math.cos(Math.PI / 6) * moveVector.y;

        x3 =
          Math.cos(-Math.PI / 6) * moveVector.x -
          Math.sin(-Math.PI / 6) * moveVector.y;
        y3 =
          Math.sin(-Math.PI / 6) * moveVector.x +
          Math.cos(-Math.PI / 6) * moveVector.y;

        page.pushOperators(
          pushGraphicsState(),
          moveTo(ptArray[1].x, ptArray[1].y),
          lineTo(x2 + ptArray[1].x, y2 + ptArray[1].y),
          lineTo(x3 + ptArray[1].x, y3 + ptArray[1].y),
          closePath(),
          setFillingColor(pdfColor),
          fill(),
          popGraphicsState()
        );

        moveVector = { x: (arrowSize * Math.sqrt(3)) / 2, y: 0 };
        x2 = cosA * moveVector.x - sinA * moveVector.y;
        y2 = sinA * moveVector.x + cosA * moveVector.y;
        page.pushOperators(
          pushGraphicsState(),
          moveTo(ptArray[0].x, ptArray[0].y),
          lineTo(x2 + ptArray[1].x, y2 + ptArray[1].y),
          setStrokingColor(pdfColor),
          setLineWidth(BaseShape.penWidth),
          stroke(),
          popGraphicsState()
        );
        break;
      default:
        break;
    }
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
    this.boundRect.invalidate();
    this.boundRect.extendArray(this.line.ptArray);
    if (this.type === SHAPE_Type.ARROW) {
      const arrowSize = BaseShape.penWidth * ARROW_SIZE;
      if (
        this.boundRect.rightBottom.distance2(this.boundRect.leftTop) <
        (3 * arrowSize * arrowSize) / 4
      ) {
        this.boundRect.invalidate();
        return false;
      }
    }
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
