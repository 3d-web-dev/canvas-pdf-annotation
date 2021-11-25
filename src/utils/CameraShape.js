import { BaseShape, SHAPE_Type } from "./BaseShape";
import { Point, Rect, SegmentIntersectsPolyline } from "./Point";
import Drawing from "./Drawing";

export class CameraShape extends BaseShape {
  constructor() {
    super();
    this.pt = new Point(0, 0);
    this.type = SHAPE_Type.CAMERA;
    this.image = null; //new Image();
  }
  load() {
    var result = BaseShape.svgImages[0].slice();
    var data = result.replace(/currentColor/gi, this.color);
    data = data.replace(/#FFFFFF/gi, this.color);
    data = data.replace(/white/gi, this.color);
    var DOMURL = window.URL || window.webkitURL || window;
    var svg = new Blob([data], { type: "image/svg+xml" });
    var url = DOMURL.createObjectURL(svg);

    const _image = new Image();
    _image.onload = () => {
      this.image = _image;
    };
    _image.src = url;
  }
  setColor(col) {
    super.setColor(col);
    this.load();
  }
  static from(json) {
    var cameraShape = new CameraShape();
    cameraShape.type = json.type;
    cameraShape.color = json.color;
    cameraShape.pt.x = json.pt.x;
    cameraShape.pt.y = json.pt.y;
    cameraShape.load();
    cameraShape.boundRect.leftTop = new Point(
      json.boundRect.leftTop.x,
      json.boundRect.leftTop.y
    );
    cameraShape.boundRect.rightBottom = new Point(
      json.boundRect.rightBottom.x,
      json.boundRect.rightBottom.y
    );
    return cameraShape;
  }
  drawPdfShape(page) {
    const { height } = page.getSize();
    var w = this.image.width;
    var h = this.image.height;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = this.image.width;
    canvas.height = this.image.height;
    ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
    var url = canvas.toDataURL();

    page.doc.embedPng(url).then((embedPng) => {
      page.drawImage(embedPng, {
        x: this.pt.x - w / 2,
        y: height - this.pt.y - h / 2,
        width: w,
        height: h,
      });
    });
  }
  drawShape(ctx, coords) {
    var pt = coords.DocPtToScreen(this.pt);
    var w = this.image.width;
    var h = this.image.height;
    ctx.fillStyle = this.color;
    ctx.drawImage(this.image, pt.x - w / 2, pt.y - h / 2, w, h);
    super.drawShape(ctx, coords);
  }
  drawBound(ctx, coords) {
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    var pt = coords.DocPtToScreen(this.pt);
    var w = this.image.width;
    var h = this.image.height;
    ctx.rect(pt.x - w / 2, pt.y - h / 2, w, h);
    ctx.stroke();
    return true;
  }
  mouseDown(pt) {
    this.pt.x = pt.x;
    this.pt.y = pt.y;
  }
  mouseMove(pt) {}
  mouseUp(pt) {
    this.boundRect.invalidate();
    var w = this.image.width;
    var h = this.image.height;
    this.boundRect.leftTop.x = this.pt.x - w / 2;
    this.boundRect.leftTop.y = this.pt.y - h / 2;
    this.boundRect.rightBottom.x = this.pt.x + w / 2;
    this.boundRect.rightBottom.y = this.pt.y + h / 2;
    return true;
  }
  shiftBy(dx, dy) {
    this.pt.x += dx;
    this.pt.y += dy;
    super.shiftBy(dx, dy);
  }
  contains(pt) {
    var w = this.image.width;
    var h = this.image.height;
    w = w / Drawing.self.coords.scale;
    h = h / Drawing.self.coords.scale;
    var rect = new Rect();
    rect.leftTop.x = this.pt.x - w / 2;
    rect.leftTop.y = this.pt.y - h / 2;
    rect.rightBottom.x = this.pt.x + w / 2;
    rect.rightBottom.y = this.pt.y + w / 2;
    if (rect.contains(pt, BaseShape.getTolerance())) return 0;
    return -1;
  }
  intersects(pt1, pt2) {
    var ptArray = new Array(0);
    var w = this.image.width;
    var h = this.image.height;
    w = w / Drawing.self.coords.scale;
    h = h / Drawing.self.coords.scale;
    var rect = new Rect();
    rect.leftTop.x = this.pt.x - w / 2;
    rect.leftTop.y = this.pt.y - h / 2;
    rect.rightBottom.x = this.pt.x + w / 2;
    rect.rightBottom.y = this.pt.y + w / 2;
    ptArray.push(new Point(rect.leftTop.x, rect.leftTop.y));
    ptArray.push(new Point(rect.rightBottom.x, rect.leftTop.y));
    ptArray.push(new Point(rect.rightBottom.x, rect.rightBottom.y));
    ptArray.push(new Point(rect.leftTop.x, rect.rightBottom.y));
    return SegmentIntersectsPolyline(pt1, pt2, ptArray, true);
  }
}
