import { BaseShape, SHAPE_Type, toRGB } from "./BaseShape";
import { Point, Polygon, SegmentIntersectsPolyline } from "./Point";
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
export class TextShape extends BaseShape {
  constructor() {
    super();
    this.poly = new Polygon();
    this.type = SHAPE_Type.TEXT;
    this.text = "";
    this.border = true;
    this.textSize = 20;
  }
  static txtSizeArray = [20, 30, 40, 50];
  static txtSizeMap = { 20: 0, 30: 1, 40: 2, 50: 3 };
  static from(json) {
    var textShape = new TextShape();
    textShape.type = json.type;
    textShape.color = json.color;
    textShape.text = json.text;
    textShape.border = json.border;
    textShape.textSize = json.textSize;
    for (var i = 0; i < json.poly.ptArray.length; i++)
      textShape.poly.addPoint(
        new Point(json.poly.ptArray[i].x, json.poly.ptArray[i].y)
      );
    textShape.boundRect.leftTop = new Point(
      json.boundRect.leftTop.x,
      json.boundRect.leftTop.y
    );
    textShape.boundRect.rightBottom = new Point(
      json.boundRect.rightBottom.x,
      json.boundRect.rightBottom.y
    );
    return textShape;
  }
  setText(txt) {
    this.text = txt;
  }
  setTextSize(size) {
    this.textSize = size;
  }
  showBorder(bShow) {
    this.border = bShow;
  }
  drawPdfShape(page) {
    var rgbColor = toRGB(this.color);
    var pdfColor = rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255);
    var pdfBlueColor = rgb(0.0, 0.0, 1.0);
    const { width, height } = page.getSize();
    var ptArray = Coords.DocPolygonToPdfScreen(this.poly.ptArray, height);
    page.doc.embedFont(StandardFonts.Helvetica).then((pdfFont) => {
      page.pushOperators(pushGraphicsState());
      if (this.border) {
        page.pushOperators(setLineWidth(1));
        page.pushOperators(setStrokingColor(pdfBlueColor));
        page.pushOperators(moveTo(ptArray[0].x, ptArray[0].y));
        for (var i = 1; i < ptArray.length; i++)
          page.pushOperators(lineTo(ptArray[i].x, ptArray[i].y));
        page.pushOperators(closePath());
        page.pushOperators(setLineCap(LineCapStyle.Round));
        page.pushOperators(stroke());
      }
      page.pushOperators(popGraphicsState());
      var x = 2 + Math.min(ptArray[0].x, ptArray[2].x);
      var y = Math.max(ptArray[0].y, ptArray[2].y) - this.textSize - 2;
      var maxWidth = Math.abs(ptArray[0].x - ptArray[2].x) - 4;
      var line = "";
      page.setFont(pdfFont);
      for (var n = 0; n < this.text.length; n++) {
        var testLine = line + this.text[n];
        var testWidth = pdfFont.widthOfTextAtSize(testLine, this.textSize);
        if (testWidth > maxWidth && n > 0) {
          page.drawText(line, {
            x: x,
            y: y,
            size: this.textSize,
            color: pdfColor,
            lineHeight: this.textSize + 2,
          });
          line = "";
          y -= this.textSize + 2;
        } else {
          line = testLine;
        }
      }
      page.drawText(line, {
        x: x,
        y: y,
        size: this.textSize,
        color: pdfColor,
        lineHeight: this.textSize + 2,
      });
    });
  }
  drawShape(ctx, coords) {
    var ptArray = coords.DocPolygonToScreen(this.poly.ptArray);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ptArray[0].x, ptArray[0].y);
    ctx.lineTo(ptArray[1].x, ptArray[1].y);
    ctx.lineTo(ptArray[2].x, ptArray[2].y);
    ctx.lineTo(ptArray[3].x, ptArray[3].y);
    ctx.lineTo(ptArray[0].x, ptArray[0].y);
    if (this.border) {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    var textSize = this.textSize * coords.scale;
    ctx.font = textSize + "px Arial";
    ctx.fillStyle = this.color;
    ctx.clip("evenodd");
    var x = 2 + Math.min(ptArray[0].x, ptArray[2].x);
    var y = 2 + Math.min(ptArray[0].y, ptArray[2].y) + textSize;
    var lineHeight = textSize + 2;
    var line = "";
    var maxWidth = Math.abs(ptArray[0].x - ptArray[2].x) - 4;
    for (var n = 0; n < this.text.length; n++) {
      var testLine = line + this.text[n];
      var metrics = ctx.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = "";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
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
    this.poly.addPoint(pt.clone());
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
