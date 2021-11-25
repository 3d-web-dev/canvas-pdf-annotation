import { BaseShape, SHAPE_Type, toRGB } from "./BaseShape";
import { Point, Polygon, SegmentIntersectsPolyline } from "./Point";
import { Coords } from "./Coords";
import {
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
export class RectShape extends BaseShape {
  constructor() {
    super();
    this.poly = new Polygon();
    this.type = SHAPE_Type.RECT;
    this.link = "";
  }
  static from(json) {
    var rectShape = new RectShape();
    rectShape.type = json.type;
    rectShape.color = json.color;
    rectShape.link = json.link;
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
  isHighlight() {
    return (
      this.type === SHAPE_Type.RECT_Highlight ||
      this.type === SHAPE_Type.ELLIPSE_Highlight ||
      this.type === SHAPE_Type.CLOUD_Highlight
    );
  }
  setHighlight(link) {
    this.link = link;
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
    switch (this.type) {
      case SHAPE_Type.RECT:
      case SHAPE_Type.RECT_Highlight:
        page.pushOperators(pushGraphicsState());
        page.pushOperators(setLineWidth(BaseShape.penWidth));
        page.pushOperators(setStrokingColor(pdfColor));
        page.pushOperators(moveTo(ptArray[0].x, ptArray[0].y));
        for (var i = 1; i < ptArray.length; i++)
          page.pushOperators(lineTo(ptArray[i].x, ptArray[i].y));
        page.pushOperators(closePath());
        page.pushOperators(setLineCap(LineCapStyle.Round));
        if (this.type === SHAPE_Type.RECT_Highlight) {
          page.pushOperators(setFillingColor(pdfColor));
          page.node.setExtGState(PDFName.of("GS-1234"), extGState);
          page.pushOperators(setGraphicsState("GS-1234"));
          page.pushOperators(fillAndStroke());
        } else page.pushOperators(stroke());
        page.pushOperators(popGraphicsState());
        break;
      case SHAPE_Type.CROSS:
        page.pushOperators(pushGraphicsState());
        page.pushOperators(setLineWidth(BaseShape.penWidth));
        page.pushOperators(setStrokingColor(pdfColor));
        page.pushOperators(moveTo(ptArray[0].x, ptArray[0].y));
        page.pushOperators(lineTo(ptArray[2].x, ptArray[2].y));
        page.pushOperators(setLineCap(LineCapStyle.Round));
        page.pushOperators(stroke());
        page.pushOperators(moveTo(ptArray[1].x, ptArray[1].y));
        page.pushOperators(lineTo(ptArray[3].x, ptArray[3].y));
        page.pushOperators(setLineCap(LineCapStyle.Round));
        page.pushOperators(stroke());
        page.pushOperators(popGraphicsState());
        break;
      case SHAPE_Type.ELLIPSE:
        var cx = (ptArray[0].x + ptArray[2].x) / 2;
        var cy = (ptArray[0].y + ptArray[2].y) / 2;
        var a = Math.abs(ptArray[2].x - cx);
        var b = Math.abs(ptArray[2].y - cy);
        page.drawEllipse({
          x: cx,
          y: cy,
          xScale: a,
          yScale: b,
          borderWidth: BaseShape.penWidth,
          borderColor: pdfColor,
        });
        break;
      case SHAPE_Type.ELLIPSE_Highlight:
        var cx = (ptArray[0].x + ptArray[2].x) / 2;
        var cy = (ptArray[0].y + ptArray[2].y) / 2;
        var a = Math.abs(ptArray[2].x - cx);
        var b = Math.abs(ptArray[2].y - cy);
        page.drawEllipse({
          x: cx,
          y: cy,
          xScale: a,
          yScale: b,
          borderWidth: BaseShape.penWidth,
          borderColor: pdfColor,
          color: pdfColor,
          opacity: BaseShape.transparent,
        });
        break;
      case SHAPE_Type.CLOUD:
      case SHAPE_Type.CLOUD_Highlight:
        page.pushOperators(pushGraphicsState());
        page.pushOperators(setLineCap(LineCapStyle.Round));
        page.pushOperators(setLineWidth(BaseShape.penWidth));
        page.pushOperators(setStrokingColor(pdfColor));
        page.pushOperators(setFillingColor(pdfColor));
        page.node.setExtGState(PDFName.of("GS-1234"), extGState);
        page.pushOperators(setGraphicsState("GS-1234"));
        ptArray[0].x += 5;
        ptArray[0].y += 5;
        ptArray[1].x -= 5;
        ptArray[1].y += 5;
        ptArray[2].x -= 5;
        ptArray[2].y -= 5;
        ptArray[3].x += 5;
        ptArray[3].y -= 5;
        var bezierWidth = 15;
        var xLen = Math.abs(ptArray[0].x - ptArray[2].x);
        var xNum = Math.max(1, xLen / bezierWidth) | 0;
        var yLen = Math.abs(ptArray[0].y - ptArray[2].y);
        var yNum = Math.max(1, yLen / bezierWidth) | 0;
        var dx = (ptArray[1].x - ptArray[0].x) / xNum;
        var factor = 1;
        if (ptArray[0].y - ptArray[2].y > 0) factor = -1;
        for (var i = 0; i < xNum; i++) {
          page.pushOperators(moveTo(ptArray[0].x + dx * i, ptArray[0].y));
          page.pushOperators(
            appendBezierCurve(
              ptArray[0].x + dx * i,
              ptArray[0].y - factor * bezierWidth,
              ptArray[0].x + dx * (i + 1),
              ptArray[0].y - factor * bezierWidth,
              ptArray[0].x + dx * (i + 1),
              ptArray[0].y
            )
          );
          if (this.type === SHAPE_Type.CLOUD_Highlight) {
            page.pushOperators(fillAndStroke());
          } else page.pushOperators(stroke());
        }
        var dy = (ptArray[2].y - ptArray[1].y) / yNum;
        factor = 1;
        if (ptArray[0].x - ptArray[2].x > 0) factor = -1;
        for (i = 0; i < yNum; i++) {
          page.pushOperators(moveTo(ptArray[1].x, ptArray[1].y + dy * i));
          page.pushOperators(
            appendBezierCurve(
              ptArray[1].x + factor * bezierWidth,
              ptArray[1].y + dy * i,
              ptArray[1].x + factor * bezierWidth,
              ptArray[1].y + dy * (i + 1),
              ptArray[1].x,
              ptArray[1].y + dy * (i + 1)
            )
          );
          if (this.type === SHAPE_Type.CLOUD_Highlight) {
            page.pushOperators(fillAndStroke());
          } else page.pushOperators(stroke());
        }
        dx = (ptArray[3].x - ptArray[2].x) / xNum;
        factor = 1;
        if (ptArray[0].y - ptArray[2].y > 0) factor = -1;
        for (i = 0; i < xNum; i++) {
          page.pushOperators(moveTo(ptArray[2].x + dx * i, ptArray[2].y));
          page.pushOperators(
            appendBezierCurve(
              ptArray[2].x + dx * i,
              ptArray[2].y + factor * bezierWidth,
              ptArray[2].x + dx * (i + 1),
              ptArray[2].y + factor * bezierWidth,
              ptArray[2].x + dx * (i + 1),
              ptArray[2].y
            )
          );
          if (this.type === SHAPE_Type.CLOUD_Highlight) {
            page.pushOperators(fillAndStroke());
          } else page.pushOperators(stroke());
        }
        dy = (ptArray[0].y - ptArray[3].y) / yNum;
        factor = 1;
        if (ptArray[0].x - ptArray[2].x > 0) factor = -1;
        for (i = 0; i < yNum; i++) {
          page.pushOperators(moveTo(ptArray[3].x, ptArray[3].y + dy * i));
          page.pushOperators(
            appendBezierCurve(
              ptArray[3].x - factor * bezierWidth,
              ptArray[3].y + dy * i,
              ptArray[3].x - factor * bezierWidth,
              ptArray[3].y + dy * (i + 1),
              ptArray[3].x,
              ptArray[3].y + dy * (i + 1)
            )
          );
          if (this.type === SHAPE_Type.CLOUD_Highlight) {
            page.pushOperators(fillAndStroke());
          } else page.pushOperators(stroke());
        }
        if (this.type === SHAPE_Type.CLOUD_Highlight) {
          page.pushOperators(moveTo(ptArray[0].x, ptArray[0].y));
          for (var i = 1; i < ptArray.length; i++)
            page.pushOperators(lineTo(ptArray[i].x, ptArray[i].y));
          page.pushOperators(closePath());
          page.pushOperators(fill());
        }
        page.pushOperators(popGraphicsState());
        break;
      default:
        break;
    }
  }
  drawShape(ctx, coords) {
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = BaseShape.penWidth;
    ctx.lineCap = "round";
    var ptArray = coords.DocPolygonToScreen(this.poly.ptArray);
    let region;
    switch (this.type) {
      case SHAPE_Type.RECT:
      case SHAPE_Type.RECT_Highlight:
        ctx.beginPath();
        ctx.moveTo(ptArray[0].x, ptArray[0].y);
        ctx.lineTo(ptArray[1].x, ptArray[1].y);
        ctx.lineTo(ptArray[2].x, ptArray[2].y);
        ctx.lineTo(ptArray[3].x, ptArray[3].y);
        ctx.lineTo(ptArray[0].x, ptArray[0].y);
        ctx.stroke();
        if (this.type === SHAPE_Type.RECT_Highlight) {
          ctx.fillStyle = this.color;
          ctx.globalAlpha = BaseShape.transparent;
          ctx.fill("evenodd");
        }
        break;
      case SHAPE_Type.CROSS:
        ctx.beginPath();
        ctx.moveTo(ptArray[0].x, ptArray[0].y);
        ctx.lineTo(ptArray[2].x, ptArray[2].y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ptArray[1].x, ptArray[1].y);
        ctx.lineTo(ptArray[3].x, ptArray[3].y);
        ctx.stroke();
        break;
      case SHAPE_Type.ELLIPSE:
      case SHAPE_Type.ELLIPSE_Highlight:
        var cx = (ptArray[0].x + ptArray[2].x) / 2;
        var cy = (ptArray[0].y + ptArray[2].y) / 2;
        var a = Math.abs(ptArray[2].x - cx);
        var b = Math.abs(ptArray[2].y - cy);
        region = new Path2D();
        ctx.beginPath();
        ctx.ellipse(cx, cy, a, b, 0, 0, 2 * Math.PI);
        ctx.stroke();
        if (this.type === SHAPE_Type.ELLIPSE_Highlight) {
          ctx.fillStyle = this.color;
          ctx.globalAlpha = BaseShape.transparent;
          ctx.fill("evenodd");
        }
        break;
      case SHAPE_Type.CLOUD:
      case SHAPE_Type.CLOUD_Highlight:
        ptArray[0].x += 5;
        ptArray[0].y += 5;
        ptArray[1].x -= 5;
        ptArray[1].y += 5;
        ptArray[2].x -= 5;
        ptArray[2].y -= 5;
        ptArray[3].x += 5;
        ptArray[3].y -= 5;
        var bezierWidth = 15;
        var xLen = Math.abs(ptArray[0].x - ptArray[2].x);
        var xNum = Math.max(1, xLen / bezierWidth) | 0;
        var yLen = Math.abs(ptArray[0].y - ptArray[2].y);
        var yNum = Math.max(1, yLen / bezierWidth) | 0;
        var dx = (ptArray[1].x - ptArray[0].x) / xNum;
        var factor = 1;
        if (ptArray[0].y - ptArray[2].y > 0) factor = -1;
        for (var i = 0; i < xNum; i++) {
          region = new Path2D();
          region.moveTo(ptArray[0].x + dx * i, ptArray[0].y);
          region.bezierCurveTo(
            ptArray[0].x + dx * i,
            ptArray[0].y - factor * bezierWidth,
            ptArray[0].x + dx * (i + 1),
            ptArray[0].y - factor * bezierWidth,
            ptArray[0].x + dx * (i + 1),
            ptArray[0].y
          );
          ctx.stroke(region);
          if (this.type === SHAPE_Type.CLOUD_Highlight) {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = BaseShape.transparent;
            ctx.fill(region, "evenodd");
            ctx.globalAlpha = 1;
          }
        }
        var dy = (ptArray[2].y - ptArray[1].y) / yNum;
        factor = 1;
        if (ptArray[0].x - ptArray[2].x > 0) factor = -1;
        for (i = 0; i < yNum; i++) {
          region = new Path2D();
          region.moveTo(ptArray[1].x, ptArray[1].y + dy * i);
          region.bezierCurveTo(
            ptArray[1].x + factor * bezierWidth,
            ptArray[1].y + dy * i,
            ptArray[1].x + factor * bezierWidth,
            ptArray[1].y + dy * (i + 1),
            ptArray[1].x,
            ptArray[1].y + dy * (i + 1)
          );
          ctx.stroke(region);
          if (this.type === SHAPE_Type.CLOUD_Highlight) {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = BaseShape.transparent;
            ctx.fill(region, "evenodd");
            ctx.globalAlpha = 1;
          }
        }
        dx = (ptArray[3].x - ptArray[2].x) / xNum;
        factor = 1;
        if (ptArray[0].y - ptArray[2].y > 0) factor = -1;
        for (i = 0; i < xNum; i++) {
          region = new Path2D();
          region.moveTo(ptArray[2].x + dx * i, ptArray[2].y);
          region.bezierCurveTo(
            ptArray[2].x + dx * i,
            ptArray[2].y + factor * bezierWidth,
            ptArray[2].x + dx * (i + 1),
            ptArray[2].y + factor * bezierWidth,
            ptArray[2].x + dx * (i + 1),
            ptArray[2].y
          );
          ctx.stroke(region);
          if (this.type === SHAPE_Type.CLOUD_Highlight) {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = BaseShape.transparent;
            ctx.fill(region, "evenodd");
            ctx.globalAlpha = 1;
          }
        }
        dy = (ptArray[0].y - ptArray[3].y) / yNum;
        factor = 1;
        if (ptArray[0].x - ptArray[2].x > 0) factor = -1;
        for (i = 0; i < yNum; i++) {
          region = new Path2D();
          region.moveTo(ptArray[3].x, ptArray[3].y + dy * i);
          region.bezierCurveTo(
            ptArray[3].x - factor * bezierWidth,
            ptArray[3].y + dy * i,
            ptArray[3].x - factor * bezierWidth,
            ptArray[3].y + dy * (i + 1),
            ptArray[3].x,
            ptArray[3].y + dy * (i + 1)
          );
          ctx.stroke(region);
          if (this.type === SHAPE_Type.CLOUD_Highlight) {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = BaseShape.transparent;
            ctx.fill(region, "evenodd");
            ctx.globalAlpha = 1;
          }
        }
        if (this.type === SHAPE_Type.CLOUD_Highlight) {
          region = new Path2D();
          region.moveTo(ptArray[0].x, ptArray[0].y);
          region.lineTo(ptArray[1].x, ptArray[1].y);
          region.lineTo(ptArray[2].x, ptArray[2].y);
          region.lineTo(ptArray[3].x, ptArray[3].y);
          region.lineTo(ptArray[0].x, ptArray[0].y);
          ctx.fillStyle = this.color;
          ctx.globalAlpha = BaseShape.transparent;
          ctx.fill(region, "evenodd");
          ctx.globalAlpha = 1;
        }
        break;
      default:
        ctx.beginPath();
        ctx.moveTo(ptArray[0].x, ptArray[0].y);
        ctx.lineTo(ptArray[1].x, ptArray[1].y);
        ctx.lineTo(ptArray[2].x, ptArray[2].y);
        ctx.lineTo(ptArray[3].x, ptArray[3].y);
        ctx.lineTo(ptArray[0].x, ptArray[0].y);
        ctx.stroke();
        break;
    }
    ctx.restore();
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
    if (this.type === SHAPE_Type.CLOUD) {
      if (
        this.boundRect.rightBottom.distance2(this.boundRect.leftTop) <
        4 * BaseShape.penWidth * BaseShape.penWidth
      ) {
        this.boundRect.invalidate();
        return false;
      }
    }
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
      switch (this.type) {
        case SHAPE_Type.CROSS:
          var line1 = new Polygon();
          line1.addPoint(this.poly.first());
          line1.addPoint(this.poly.third());
          var line2 = new Polygon();
          line2.addPoint(this.poly.second());
          line2.addPoint(this.poly.fourth());
          var distance1 = line1.distance(pt);
          var distance2 = line2.distance(pt);
          if (distance1 < tolerance || distance2 < tolerance) {
            for (var i = 0; i < this.poly.ptArray.length; i++) {
              var distance = pt.distance2(this.poly.ptArray[i]);
              if (distance < tolerance) {
                return i + 1;
              }
            }
            return 0;
          }
          break;
        case SHAPE_Type.RECT_Highlight:
        case SHAPE_Type.ELLIPSE_Highlight:
        case SHAPE_Type.CLOUD_Highlight:
          if (super.contains(pt) >= 0) {
            for (i = 0; i < this.poly.ptArray.length; i++) {
              distance = pt.distance2(this.poly.ptArray[i]);
              if (distance < tolerance) {
                return i + 1;
              }
            }
            return 0;
          }
          break;
        case SHAPE_Type.ELLIPSE:
          var cx = (this.poly.first().x + this.poly.third().x) / 2;
          var cy = (this.poly.first().y + this.poly.third().y) / 2;
          var a2 = (this.poly.third().x - cx) * (this.poly.third().x - cx);
          var b2 = (this.poly.third().y - cy) * (this.poly.third().y - cy);
          var r2 = (pt.x - cx) * (pt.x - cx) + (pt.y - cy) * (pt.y - cy);
          var cos2A = ((pt.x - cx) * (pt.x - cx)) / r2;
          var sin2A = 1 - cos2A;
          var R2 = (a2 * b2) / (b2 * cos2A + a2 * sin2A);
          if (R2 + r2 - 2 * Math.sqrt(R2) * Math.sqrt(r2) < tolerance) {
            for (i = 0; i < this.poly.ptArray.length; i++) {
              distance = pt.distance2(this.poly.ptArray[i]);
              if (distance < tolerance) {
                return i + 1;
              }
            }
            return 0;
          } else {
            for (i = 0; i < this.poly.ptArray.length; i++) {
              distance = pt.distance2(this.poly.ptArray[i]);
              if (distance < tolerance) {
                return i + 1;
              }
            }
          }
          break;
        case SHAPE_Type.CLOUD:
        default:
          line1 = new Polygon();
          line1.addPoint(this.poly.first());
          line1.addPoint(this.poly.second());
          line2 = new Polygon();
          line2.addPoint(this.poly.second());
          line2.addPoint(this.poly.third());
          var line3 = new Polygon();
          line3.addPoint(this.poly.third());
          line3.addPoint(this.poly.fourth());
          var line4 = new Polygon();
          line4.addPoint(this.poly.fourth());
          line4.addPoint(this.poly.first());
          if (
            line1.distance(pt) < tolerance ||
            line2.distance(pt) < tolerance ||
            line3.distance(pt) < tolerance ||
            line4.distance(pt) < tolerance
          ) {
            for (i = 0; i < this.poly.ptArray.length; i++) {
              distance = pt.distance2(this.poly.ptArray[i]);
              if (distance < tolerance) {
                return i + 1;
              }
            }
            return 0;
          }
          break;
      }
    }
    return -1;
  }
  intersects(pt1, pt2) {
    return SegmentIntersectsPolyline(pt1, pt2, this.poly.ptArray, true);
  }
}
