import { Point, Rect } from "./Point";
export class Coords {
  constructor() {
    this.scale = 1;
    this.offset = new Point(0, 0);
    this.prevPt = new Point(0, 0);
  }
  reset() {
    this.scale = 1;
    this.offset = new Point(0, 0);
    this.prevPt = new Point(0, 0);
  }
  zoomByScale(x, y, scale) {
    // if(scale>10) return false;
    // if(scale<0.2) return false;
    var prevScale = this.scale;
    this.scale = scale;
    this.offset.x = x + ((this.offset.x - x) * this.scale) / prevScale;
    this.offset.y = y + ((this.offset.y - y) * this.scale) / prevScale;
    return true;
  }
  zoom(event) {
    var delta = (this.scale * event.deltaY) / 500;
    // if (this.scale - delta > 10)
    //     return false;
    // if (this.scale - delta < 0.2)
    //     return false;
    var prevScale = this.scale;
    this.scale -= delta;
    this.offset.x =
      event.offsetX +
      ((this.offset.x - event.offsetX) * this.scale) / prevScale;
    this.offset.y =
      event.offsetY +
      ((this.offset.y - event.offsetY) * this.scale) / prevScale;
    return true;
  }
  mouseDown(pt) {
    this.prevPt.x = pt.x;
    this.prevPt.y = pt.y;
  }
  mouseMove(pt) {
    this.offset.x += pt.x - this.prevPt.x;
    this.offset.y += pt.y - this.prevPt.y;
    this.prevPt.x = pt.x;
    this.prevPt.y = pt.y;
  }
  mouseUp(pt) {
    this.offset.x += pt.x - this.prevPt.x;
    this.offset.y += pt.y - this.prevPt.y;
    this.prevPt.x = pt.x;
    this.prevPt.y = pt.y;
  }
  screenPtToDoc(pt) {
    var s = 1.0 / this.scale;
    return pt.sub(this.offset).scale(s);
  }
  DocPtToScreen(pt) {
    return pt.scale(this.scale).add(this.offset);
  }
  DocRectToScreen(rect) {
    var rt = new Rect();
    rt.leftTop.assign(rect.leftTop.scale(this.scale));
    rt.rightBottom.assign(rect.rightBottom.scale(this.scale));
    rt.shiftBy(this.offset.x, this.offset.y);
    rt.rightBottom.add(this.offset);
    return rt;
  }
  DocPolygonToScreen(poly) {
    var polyline = new Array(0);
    for (var i = 0; i < poly.length; i++) {
      polyline.push(poly[i].scale(this.scale).add(this.offset));
    }
    return polyline;
  }
  static DocPolygonToPdfScreen(poly, height) {
    var polyline = new Array(0);
    for (var i = 0; i < poly.length; i++) {
      polyline.push(new Point(poly[i].x, height - poly[i].y));
    }
    return polyline;
  }
}
