import { simplify } from './simplify-js/simplify';

export class Point {
    constructor(x, y) {
        if (x === null)
            x = 0;
        if (y === null)
            y = 0;
        this.x = x;
        this.y = y;
    }
    clone() {
        return new Point(this.x, this.y);
    }
    shiftBy(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    distance2(pt) {
        return (this.x - pt.x) * (this.x - pt.x) + (this.y - pt.y) * (this.y - pt.y);
    }
    sub(pt) {
        var point = this.clone();
        point.x -= pt.x;
        point.y -= pt.y;
        return point;
    }
    add(pt) {
        var point = this.clone();
        point.x += pt.x;
        point.y += pt.y;
        return point;
    }
    assign(pt) {
        this.x = pt.x;
        this.y = pt.y;
        return this;
    }
    scale(s) {
        var point = this.clone();
        point.x *= s;
        point.y *= s;
        return point;
    }
}
export class Rect {
    constructor() {
        this.leftTop = new Point(100000, 100000);
        this.rightBottom = new Point(-100000, -100000);
    }
    clone() {
        var rect = new Rect();
        rect.leftTop = this.leftTop;
        rect.rightBottom = this.rightBottom;
        return rect;
    }
    isValid() {
        if (this.rightBottom.x < this.leftTop.x)
            return false;
        if (this.rightBottom.y < this.leftTop.y)
            return false;
        return true;
    }
    getCenter() {
        return new Point((this.leftTop.x + this.rightBottom.x) / 2, (this.leftTop.y + this.rightBottom.y) / 2);
    }
    invalidate() {
        this.leftTop.x = 100000;
        this.leftTop.y = 100000;
        this.rightBottom.x = -100000;
        this.rightBottom.y = -100000;
    }
    getWidth() {
        if (this.isValid()) {
            return this.rightBottom.x - this.leftTop.x;
        }
        return 0;
    }
    getHeight() {
        if (this.isValid()) {
            return this.rightBottom.y - this.leftTop.y;
        }
        return 0;
    }
    contains(pt, tolerance) {
        if (pt.x < this.leftTop.x - tolerance)
            return false;
        if (pt.x > this.rightBottom.x + tolerance)
            return false;
        if (pt.y < this.leftTop.y - tolerance)
            return false;
        if (pt.y > this.rightBottom.y + tolerance)
            return false;
        return true;
    }
    extendPt(pt) {
        if (!this.isValid()) {
            this.leftTop.x = pt.x;
            this.leftTop.y = pt.y;
            this.rightBottom.x = pt.x;
            this.rightBottom.y = pt.y;
        }
        else if (this.contains(pt, 0)) {
            return;
        }
        else {
            if (pt.x < this.leftTop.x)
                this.leftTop.x = pt.x;
            else if (pt.x > this.rightBottom.x)
                this.rightBottom.x = pt.x;
            if (pt.y < this.leftTop.y)
                this.leftTop.y = pt.y;
            else if (pt.y > this.rightBottom.y)
                this.rightBottom.y = pt.y;
        }
    }
    extendArray(ptArray) {
        var len = ptArray.length;
        for (var i = 0; i < len; i++) {
            this.extendPt(ptArray[i]);
        }
    }
    extendRect(rect) {
        this.extendPt(rect.leftTop);
        this.extendPt(rect.rightBottom);
    }
    shiftBy(dx, dy) {
        this.leftTop.shiftBy(dx, dy);
        this.rightBottom.shiftBy(dx, dy);
    }
    intersects(rect) {
        if (this.rightBottom.x < rect.leftTop.x || this.leftTop.x > rect.rightBottom.x)
            return false;
        if (this.rightBottom.y < rect.leftTop.y || this.leftTop.y > rect.rightBottom.y)
            return false;
        return true;
    }
}
function Distance2(p0, p1) {
    return (p0.x - p1.x) * (p0.x - p1.x) + (p0.y - p1.y) * (p0.y - p1.y);
}
function DistanceToSegment2(_ptA, _ptB, _pt, _ptNearest) {
    const dx = (_ptB.x - _ptA.x);
    const dy = _ptB.y - _ptA.y;
    const D2 = dx * dx + dy * dy;
    if (D2 < 1e-12) {
        _ptNearest = _ptA;
        return Distance2(_pt, _ptA);
    }
    const dxa = (_pt.x - _ptA.x);
    const dya = _pt.y - _ptA.y;
    var t = (dxa * dx + dya * dy) / D2;
    if (t < 0)
        t = 0;
    else if (t > 1)
        t = 1;
    _ptNearest.x = _ptA.x + dx * t;
    _ptNearest.y = _ptA.y + dy * t;
    return Distance2(_pt, _ptNearest);
}
function GetNearestPointOfPolyline(points, cBegin, cEnd, pt, ptNearest, cNearestSegment) {
    if (points.length === 0)
        return -1;
    if (cEnd >= points.length)
        cEnd = points.length;
    if (cBegin >= cEnd)
        return -1;
    var fMinD2 = -1;
    for (var c = cBegin; c + 1 < cEnd; ++c) {
        const ptA = points[c];
        const ptB = points[c + 1];
        ptNearest = new Point(0, 0);
        const fD2 = DistanceToSegment2(ptA, ptB, pt, ptNearest);
        if (fMinD2 > fD2 || fMinD2 < 0) {
            fMinD2 = fD2;
            cNearestSegment = c;
        }
    }
    return fMinD2;
}
function Distance2ToPolyline(points, pt) {
    var ptNearest = new Point(0, 0);
    var cNearestSegment = 0;
    return GetNearestPointOfPolyline(points, 0, points.length, pt, ptNearest, cNearestSegment);
}
// function PolygonContainsPt(_polygon, _p) {
//     if (_polygon.length === 0)
//         return -1;
//     var cc = 0;
//     var iLastTouchingLinkSide = 0;
//     var cFirstPoint = 0;
//     var bFirstPointPassed = false;
//     var cNodesWithEqualY = 0;
//     const cPoints = _polygon.length;
//     for (var cPoint = 1; cPoint !== cFirstPoint + 1 || !bFirstPointPassed; ++cPoint) {
//         // Get the first point of leg.
//         var cPoint0 = cPoint - 1;
//         while (cPoint0 >= cPoints)
//             cPoint0 -= cPoints;
//         const p0 = _polygon[cPoint0];
//         // Get the second point of leg.
//         while (cPoint >= cPoints)
//             cPoint -= cPoints;
//         const p1 = _polygon[cPoint];
//         if (p0 === p1) {
//             // Infinite loop protection.
//             ++cNodesWithEqualY;
//             if (cNodesWithEqualY > cPoints)
//                 return -1;
//             continue;
//         }
//         if ((p0.y < _p.y && _p.y < p1.y) ||
//             (p0.y > _p.y && _p.y > p1.y)) {
//             // Leg crosses point's latitude.
//             const x = p0.x + (_p.y - p0.y) * (p1.x - p0.x) / (p1.y - p0.y);
//             if (x === _p.x)
//                 // Leg crosses the point.
//                 return 0;
//             else if (x < _p.x)
//                 // Leg passes under the point.
//                 ++cc;
//             bFirstPointPassed = true;
//         }
//         else if (p0.y === _p.y && p1.y === _p.y) {
//             // Leg is entirely within point's latitude.
//             if ((p0.x <= _p.x && p1.x >= _p.x) ||
//                 (p0.x >= _p.x && p1.x <= _p.x))
//                 // Leg crosses the point.
//                 return 0;
//             if (cFirstPoint === cPoint - 1 && p1.x < _p.x)
//                 // There was no any link that crosses point's latitude or finishes at it yet.
//                 ++cFirstPoint;
//             // Infinite loop protection.
//             assert(p0.y === p1.y);
//             ++cNodesWithEqualY;
//             if (cNodesWithEqualY > cPoints)
//                 return -1;
//         }
//         else if (p0.y !== _p.y && p1.y === _p.y) {
//             // Leg finishes at point's latitude.
//             if (p1.x === _p.x)
//                 // Leg crosses the point.
//                 return 0;
//             else if (p1.x < _p.x)
//                 // Remember last touching leg side.
//                 iLastTouchingLinkSide = p0.y < _p.y ? -1 : 1;
//             bFirstPointPassed = true;
//         }
//         else if (p0.y === _p.y && p1.y !== _p.y) {
//             // Leg starts at point's latitude.
//             if (p0.x === _p.x)
//                 // Leg crosses the point.
//                 return 0;
//             else if (p0.x < _p.x)
//                 if (iLastTouchingLinkSide === 0)
//                     // There was no touching leg yet.
//                     // We should loop through the polygon 'till this point.
//                     cFirstPoint = cPoint;
//                 else if (iLastTouchingLinkSide === -1 && p1.y > _p.y ||
//                     iLastTouchingLinkSide === 1 && p1.y < _p.y)
//                     // This links with previous touching leg together cross point's latitude.
//                     ++cc;
//         }
//         else
//             // Leg does not cross point's latitude.
//             bFirstPointPassed = true;
//     }
//     return (cc & 0x1) ? 1 : -1;
// }
// function Distance2ToPolygon(_points, _p) {
//     if (PolygonContainsPt(_points, _p) >= 0)
//         return 0;
//     const fD2_1 = Distance2ToPolyline(_points, _p);
//     const cPoints = _points.length;
//     if (cPoints <= 2)
//         return fD2_1;
//     var ptNearest = new Point(0, 0);
//     const fD2_2 = DistanceToSegment2(_points[0], _points[cPoints - 1], _p, ptNearest);
//     return Math.min(fD2_1, fD2_2);
// }

function SegmentIntersectsSegment(a, b, c, d, pIntersection) {
    const tolerance = 1e-10;
    const t = (d.x - c.x) * (b.y - a.y) - (d.y - c.y) * (b.x - a.x);
    if (Math.abs(t) < tolerance)
        return false;
    const p = ((c.y - a.y) * (b.x - a.x) - (c.x - a.x) * (b.y - a.y));
    if (p / t <= tolerance || p / t >= 1 - tolerance)
        return false;
    const q = ((c.y - a.y) * (d.x - c.x) - (c.x - a.x) * (d.y - c.y));
    if (q / t <= tolerance || q / t >= 1 - tolerance)
        return false;
    pIntersection.x = a.x + (b.x - a.x) * (q / t);
    pIntersection.y = a.y + (b.y - a.y) * (q / t);
    return true;
}
export function SegmentIntersectsPolyline(a, b, points, bClosed) {
    const cPoints = points.length;
    const cPoints_e = bClosed ? cPoints : cPoints - 1;
    for (var n = 0; n < cPoints_e; ++n) {
        const c = points[n];
        const d = points[n + 1 < cPoints ? n + 1 : 0];
        var pIntersection = new Point(0, 0);
        if (SegmentIntersectsSegment(a, b, c, d, pIntersection))
            return true;
    }
    return false;
}
export class Polygon {
    constructor() {
        this.ptArray = new Array(0);
    }
    clear() {
        for (; this.ptArray.length > 0;)
            this.ptArray.pop();
    }
    removeLast() {
        var len = this.ptArray.length;
        if (len > 1) {
            this.ptArray.pop();
        }
    }
    addPoint(pt) {
        this.ptArray.push(pt);
    }
    first() {
        return this.ptArray[0];
    }
    second() {
        return this.ptArray[1];
    }
    third() {
        return this.ptArray[2];
    }
    fourth() {
        return this.ptArray[3];
    }
    last() {
        return this.ptArray[this.ptArray.length - 1];
    }
    preLast() {
        return this.ptArray[this.ptArray.length - 2];
    }
    distance(pt) {
        return Distance2ToPolyline(this.ptArray, pt);
    }
    getLength() {
        var dist = 0;
        if (this.ptArray.length > 1) {
            for (var i = 0; i < this.ptArray.length - 1; i++) {
                dist += Math.sqrt(this.ptArray[i].distance2(this.ptArray[i + 1]));
            }
        }
        return dist;
    }
    GetArea() {
        if (this.ptArray.length <= 2)
            return 0;
        var area = 0;
        var count = this.ptArray.length;
        for (var i = 0; i < count; ++i) {
            var p0 = this.ptArray[i];
            var p1 = this.ptArray[i + 1 === count ? 0 : i + 1];
            area += (p1.x - p0.x) * (p0.y + p1.y);
        }
        return Math.abs(area) * 0.5;
    }
    GetCenter() {
        var x = 0;
        var y = 0;
        var count = this.ptArray.length;
        for (var i = 0; i < count; ++i) {
            var p0 = this.ptArray[i];
            x += p0.x;
            y += p0.y;
        }
        return new Point(x / count, y / count);
    }
    GetCentroid() {
        var _ptCentroid = new Point(0, 0);
        const count = this.ptArray.length;
        if (count === 0)
            return null;
        else if (count === 1) {
            return this.ptArray[0];
        }
        else if (count === 2) {
            _ptCentroid.x = (this.ptArray[0].x + this.ptArray[1].x) / 2;
            _ptCentroid.y = (this.ptArray[0].y + this.ptArray[1].y) / 2;
            return _ptCentroid;
        }
        var xc = 0;
        var yc = 0;
        var fA = 0;
        for (var i = 0; i < count; ++i) {
            const p0 = this.ptArray[i];
            const p1 = this.ptArray[i + 1 === count ? 0 : i + 1];
            xc += (p0.x + p1.x) * (p0.x * p1.y - p1.x * p0.y);
            yc += (p0.y + p1.y) * (p0.x * p1.y - p1.x * p0.y);
            fA += (p1.x - p0.x) * (p0.y + p1.y);
        }
        fA *= 0.5;
        fA = -fA;
        if (Math.abs(fA) < 1e-11) {
            var rectBound = new Rect();
            rectBound.extendArray(this.ptArray);
            _ptCentroid.x = rectBound.getCenter().x;
            _ptCentroid.y = rectBound.getCenter().y;
            return _ptCentroid;
        }
        _ptCentroid.x = xc / (6 * fA);
        _ptCentroid.y = yc / (6 * fA);
        return _ptCentroid;
    }
    shiftBy(dx, dy) {
        var len = this.ptArray.length;
        for (var i = 0; i < len; i++) {
            this.ptArray[i].shiftBy(dx, dy);
        }
    }
    shiftPointAt(id, dx, dy) {
        this.ptArray[id].shiftBy(dx, dy);
    }
    smooth() {
        var ptArray = new Array(0);
        for (var i = 0; i < this.ptArray.length; i++) {
            ptArray.push({ x: this.ptArray[i].x, y: this.ptArray[i].y });
        }
        var ptArray1 = simplify(ptArray);
        // console.log(ptArray1.length, ptArray.length);
        this.ptArray.splice(0, this.ptArray.length);
        for (i = 0; i < ptArray1.length; i++) {
            this.ptArray.push(new Point(ptArray1[i].x, ptArray1[i].y));
        }
    }
}
