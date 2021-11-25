import { Rect } from "./Point";
import Drawing from "./Drawing";
import { SymbolList } from "../components/RightControls";

// enumerate shape's types
export var SHAPE_Type;
(function (SHAPE_Type) {
  SHAPE_Type[(SHAPE_Type["NONE"] = 0)] = "NONE";
  SHAPE_Type[(SHAPE_Type["LINE"] = 1)] = "LINE";
  SHAPE_Type[(SHAPE_Type["ARROW"] = 2)] = "ARROW";
  SHAPE_Type[(SHAPE_Type["CALIBRATION"] = 3)] = "CALIBRATION";
  SHAPE_Type[(SHAPE_Type["LINE_MEASURE"] = 4)] = "LINE_MEASURE";
  SHAPE_Type[(SHAPE_Type["RECT"] = 5)] = "RECT";
  SHAPE_Type[(SHAPE_Type["ELLIPSE"] = 6)] = "ELLIPSE";
  SHAPE_Type[(SHAPE_Type["CLOUD"] = 7)] = "CLOUD";
  SHAPE_Type[(SHAPE_Type["CROSS"] = 8)] = "CROSS";
  SHAPE_Type[(SHAPE_Type["RECT_Highlight"] = 9)] = "RECT_Highlight";
  SHAPE_Type[(SHAPE_Type["ELLIPSE_Highlight"] = 10)] = "ELLIPSE_Highlight";
  SHAPE_Type[(SHAPE_Type["CLOUD_Highlight"] = 11)] = "CLOUD_Highlight";
  SHAPE_Type[(SHAPE_Type["RECT_MEASURE"] = 12)] = "RECT_MEASURE";
  SHAPE_Type[(SHAPE_Type["POLY_LINE"] = 13)] = "POLY_LINE";
  SHAPE_Type[(SHAPE_Type["POLY_BRUSH"] = 14)] = "POLY_BRUSH";
  SHAPE_Type[(SHAPE_Type["POLYLINE_MEASURE"] = 15)] = "POLYLINE_MEASURE";
  SHAPE_Type[(SHAPE_Type["POLYGON_MEASURE"] = 16)] = "POLYGON_MEASURE";
  SHAPE_Type[(SHAPE_Type["TEXT"] = 17)] = "TEXT";
  SHAPE_Type[(SHAPE_Type["SYMBOL"] = 18)] = "SYMBOL";
  SHAPE_Type[(SHAPE_Type["CAMERA"] = 19)] = "CAMERA";
})(SHAPE_Type || (SHAPE_Type = {}));
export var MEASURE_Unit;
(function (MEASURE_Unit) {
  MEASURE_Unit[(MEASURE_Unit["METER"] = 1)] = "METER";
  MEASURE_Unit[(MEASURE_Unit["FEET"] = 2)] = "FEET";
})(MEASURE_Unit || (MEASURE_Unit = {}));

const colors = {
  black: { r: 0, g: 0, b: 0 },
  white: { r: 255, g: 255, b: 255 },
  red: { r: 255, g: 0, b: 0 },
  lime: { r: 0, g: 255, b: 0 },
  blue: { r: 0, g: 0, b: 255 },
  yellow: { r: 255, g: 255, b: 0 },
  cyan: { r: 0, g: 255, b: 255 },
  magenta: { r: 255, g: 0, b: 255 },
  silver: { r: 192, g: 192, b: 192 },
  gray: { r: 128, g: 128, b: 128 },
  maroon: { r: 128, g: 0, b: 0 },
  olive: { r: 128, g: 128, b: 0 },
  green: { r: 0, g: 128, b: 0 },
  purple: { r: 128, g: 0, b: 128 },
  teal: { r: 0, g: 128, b: 128 },
  navy: { r: 0, g: 0, b: 128 },
};

export function toRGB(color_str) {
  const _color = color_str.toLowerCase();

  if (_color.includes("#")) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color_str);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  } else if (_color.includes("rgb")) {
    result = _color
      .replace("rgb", "")
      .replace("(", "")
      .replace(")", "")
      .split(",");
    return result
      ? {
          r: parseInt(result[0]),
          g: parseInt(result[1]),
          b: parseInt(result[2]),
        }
      : null;
  } else {
    return Object.keys(colors).includes(_color) ? colors[_color] : null;
  }
}

export class BaseShape {
  constructor() {
    this.boundRect = new Rect();
    this.color = "red";
    this.type = SHAPE_Type.NONE;
  }
  static svgImages = new Array(0);
  static async loadSvgs() {
    var count = 18;
    for (var i = 0; i < count; i++) {
      fetch(SymbolList[i])
        .then((response) => response.body)
        .then((rb) => {
          const reader = rb.getReader();
          return new ReadableStream({
            start(controller) {
              // The following function handles each data chunk
              function push() {
                // "done" is a Boolean and value a "Uint8Array"
                reader.read().then(({ done, value }) => {
                  // If there is no more data to read
                  if (done) {
                    // console.log('done', done);
                    controller.close();
                    return;
                  }
                  // Get the data and send it to the browser via the controller
                  controller.enqueue(value);
                  // Check chunks by logging to the console
                  // console.log(done, value);
                  push();
                });
              }

              push();
            },
          });
        })
        .then((stream) => {
          // Respond with our stream
          return new Response(stream, {
            headers: { "Content-Type": "text/html" },
          }).text();
        })
        .then((result) => {
          // Do things with result
          BaseShape.svgImages.push(result);
        });
    }
    while (BaseShape.svgImages.length < count) {
      const sleep = (delay) =>
        new Promise((res) => {
          setTimeout(res, delay);
        });
      await sleep(1);
    }
  }
  setType(type) {
    this.type = type;
  }
  getType() {
    return this.type;
  }
  setColor(col) {
    this.color = col;
  }
  mouseDown(pt) {}
  mouseMove(pt) {}
  mouseUp(pt) {
    return false;
  }
  isHighlight() {
    return false;
  }
  invalidateRect(ctx) {
    if (this.boundRect.isValid()) {
      ctx.clearRect(
        this.boundRect.leftTop.x,
        this.boundRect.leftTop.y,
        this.boundRect.getWidth(),
        this.boundRect.getHeight()
      );
    }
  }
  drawBound(ctx, coords) {
    if (this.boundRect.isValid()) {
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.strokeStyle = "blue";
      ctx.beginPath();
      var rect = coords.DocRectToScreen(this.boundRect);
      ctx.rect(
        rect.leftTop.x,
        rect.leftTop.y,
        rect.getWidth(),
        rect.getHeight()
      );
      ctx.stroke();
      return true;
    }
    return false;
  }
  drawShape(ctx, coords) {}
  drawPdfShape(page) {}
  // check point is contained in bound rect
  contains(pt) {
    if (this.boundRect.isValid()) {
      if (this.boundRect.contains(pt, BaseShape.getTolerance())) return 0;
    }
    return -1;
  }
  intersects(pt1, pt2) {
    return false;
  }
  // shift bound rect by (x, y)
  shiftBy(dx, dy) {
    this.boundRect.shiftBy(dx, dy);
  }
  shiftPointAt(id, dx, dy) {}
  static getTolerance() {
    return BaseShape.snapWidth / Drawing.self.coords.scale;
  }
}
BaseShape.penWidth = 2;
BaseShape.markWidth = 10;
BaseShape.mTextHeight = 12;
BaseShape.transparent = 0.3;
BaseShape.snapWidth = 20;
BaseShape.highlightWidth = 20;
