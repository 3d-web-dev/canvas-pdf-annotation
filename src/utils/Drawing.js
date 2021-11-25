import { RectShape } from "./RectShape";
import { TextShape } from "./TextShape";
import { SHAPE_Type } from "./BaseShape";
import { LineShape } from "./LineShape";
import { PolylineShape } from "./PolylineShape";
import { Point, Rect } from "./Point";
import { EditShapes, ACTION_Option, ACTION_Flag, ACTION } from "./EditShape";
import { Coords } from "./Coords";

import { MRectShape } from "./MRectShape";
import { MLineShape } from "./MLineShape";
import { MPolylineShape } from "./MPolyShape";
import { SymbolShape } from "./SymbolShape";
import { CameraShape } from "./CameraShape";

import download from "downloadjs";
import {
  degrees,
  PDFDocument,
  rgb,
  StandardFonts,
  pushGraphicsState,
  drawImage,
  moveTo,
  lineTo,
  closePath,
  setFillingColor,
  setStrokingColor,
  fill,
  stroke,
  setLineWidth,
  popGraphicsState,
} from "pdf-lib";

import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default class Drawing {
  static self = null;
  static bDrawPdf = false;
  static apis = {
    w3: {
      fullscreen: "fullscreen",
      enabled: "fullscreenEnabled",
      element: "fullscreenElement",
      request: "requestFullscreen",
      exit: "exitFullscreen",
      events: { change: "fullscreenchange", error: "fullscreenerror" },
    },
    webkit: {
      fullscreen: "webkitIsFullScreen",
      enabled: "webkitFullscreenEnabled",
      element: "webkitCurrentFullScreenElement",
      request: "webkitRequestFullscreen",
      exit: "webkitExitFullscreen",
      events: {
        change: "webkitfullscreenchange",
        error: "webkitfullscreenerror",
      },
    },
    moz: {
      fullscreen: "mozFullScreen",
      enabled: "mozFullScreenEnabled",
      element: "mozFullScreenElement",
      request: "mozRequestFullScreen",
      exit: "mozCancelFullScreen",
      events: { change: "mozfullscreenchange", error: "mozfullscreenerror" },
    },
    ms: {
      fullscreen: "",
      enabled: "msFullscreenEnabled",
      element: "msFullscreenElement",
      request: "msRequestFullscreen",
      exit: "msExitFullscreen",
      events: { change: "MSFullscreenChange", error: "MSFullscreenError" },
    },
  };
  constructor(container, callback) {
    Drawing.self = this;
    this.dlgCallback = callback;
    this.docUrl = null;
    this.docType = "png";
    this.docPageNum = 1;

    this.container = container;
    this.container.style.padding = "8px";

    const w = container.clientWidth;
    const h = container.clientHeight;
    if (document.getElementById("abc") != null)
      this.container.removeChild(document.getElementById("abc"));
    this.containerElement = document.createElement("div");
    this.containerElement.setAttribute("id", "abc");
    this.containerElement.style.width = "100%";
    this.containerElement.style.height = "100%";
    this.container.appendChild(this.containerElement);
    this.containerElement.style.position = "relative";

    this.pdfCanvas = document.createElement("canvas");
    this.pdfCanvas.width = w;
    this.pdfCanvas.height = h;
    this.pdfCanvas.style.width = w + "px";
    this.pdfCanvas.style.height = h + "px";
    this.pdfCtx = this.pdfCanvas.getContext("2d");

    this.pdfDocProxy = null;
    this.pdfPageProxy = null;
    this.pdfRenderTask = null;
    this.bLoading = false;
    this.keyDownValue = "";
    this.keyPoint = null;

    this.bgCanvas = document.createElement("canvas");
    this.bgCanvas.width = w;
    this.bgCanvas.height = h;
    this.bgCanvas.style.position = "absolute";
    this.bgCanvas.style.top = "0px";
    this.bgCanvas.style.left = "0px";
    this.bgCanvas.style.width = w + "px";
    this.bgCanvas.style.height = h + "px";
    this.bgCanvas.style.zIndex = "1";
    this.bgCanvas.style.touchAction = "none";
    this.bgCtx = this.bgCanvas.getContext("2d");
    this.containerElement.appendChild(this.bgCanvas);
    this.symCanvas = document.createElement("canvas");
    this.symCanvas.width = w;
    this.symCanvas.height = h;
    this.symCanvas.style.position = "absolute";
    this.symCanvas.style.top = "0px";
    this.symCanvas.style.left = "0px";
    this.symCanvas.style.width = w + "px";
    this.symCanvas.style.height = h + "px";
    this.symCanvas.style.zIndex = "2";
    this.symCanvas.style.touchAction = "none";
    this.symCtx = this.symCanvas.getContext("2d");
    this.containerElement.appendChild(this.symCanvas);
    this.editCanvas = document.createElement("canvas");
    this.editCanvas.width = w;
    this.editCanvas.height = h;
    this.editCanvas.style.position = "absolute";
    this.editCanvas.style.top = "0px";
    this.editCanvas.style.left = "0px";
    this.editCanvas.style.width = w + "px";
    this.editCanvas.style.height = h + "px";
    this.editCanvas.style.zIndex = "3";
    this.editCtx = this.editCanvas.getContext("2d");
    this.containerElement.appendChild(this.editCanvas);
    this.deleteButton = document.createElement("button");
    this.popup = document.createElement("div");
    this.popup.style.position = "absolute";
    this.popup.style.top = "0px";
    this.popup.style.left = "0px";
    this.popup.style.width = 100 + "px";
    this.popup.style.height = 40 + "px";
    this.popup.style.zIndex = "4";
    this.popup.style.display = "none";
    this.popup.style.background = "#1f323d";
    this.containerElement.appendChild(this.popup);
    this.popup.appendChild(this.deleteButton);
    this.deleteButton.innerHTML = "Delete";
    this.deleteButton.style.paddingLeft = "4px";
    this.deleteButton.style.paddingRight = "4px";
    this.deleteButton.style.paddingTop = "4px";
    this.deleteButton.style.paddingBottom = "4px";
    this.deleteButton.style.width = "100%";
    this.deleteButton.style.height = "100%";
    this.deleteButton.style.cursor = "pointer";
    this.deleteButton.style.color = "white";
    // this.trash = document.createElement('img');
    // this.trash.src = 'http://localhost/61.svg';
    // this.deleteButton.appendChild(this.trash);
    this.shapeEditor = new EditShapes(this);
    this.coords = new Coords();
    window.addEventListener("resize", this.resize.bind(this));
    this.editCanvas.addEventListener("wheel", this.zoom.bind(this));
    this.editCanvas.addEventListener("pointerdown", this.mouseDown.bind(this));
    this.editCanvas.addEventListener("pointermove", this.mouseMove.bind(this));
    this.editCanvas.addEventListener("pointerup", this.mouseUp.bind(this));
    this.editCanvas.tabIndex = 1;
    this.editCanvas.addEventListener("keydown", this.keyDown.bind(this));
    this.editCanvas.addEventListener("keyup", this.keyUp.bind(this));
    this.deleteButton.addEventListener("click", this.deleteShapes.bind(this));

    for (var e in Drawing.apis) {
      if (Drawing.apis[e].enabled in document) {
        this.api = Drawing.apis[e];
        break;
      }
    }
    this.fullscreenEnabled = false;
    localStorage.setItem('fullscreen', false)
  }
  containsType(type) {
    const exist = (element) => element.getType() === type;
    return this.shapeArray.some(exist);
  }
  deleteShapeObjAt(id) {
    this.shapeArray.splice(id, 1);
    this.drawCanvases(false, true);
  }
  deleteShapes() {
    // if (confirm("Are you sure to delete?"))
    if (this.shapeEditor.isValid()) {
      this.shapeEditor.selShapeIdArray.sort();
      while (this.shapeEditor.selShapeIdArray.length > 0) {
        var id = this.shapeEditor.selShapeIdArray.pop();
        this.deleteShapeObjAt(id);
      }
      this.shapeEditor.reset();
      this.drawCanvases(false, true);
    }
    this.hidePopupMenu();
  }
  deleteShape(param) {
    this.deleteShapes();
  }
  hidePopupMenu() {
    this.popup.style.display = "none";
    if (this.dlgCallback) this.dlgCallback(undefined);
  }
  showPopupMenu(x, y) {
    this.popup.style.top = y + "px";
    this.popup.style.left = x + "px";
    this.popup.style.display = "block";
    if (this.shapeEditor.selObjArray.length > 1)
      this.deleteButton.innerHTML =
        "Delete (" + this.shapeEditor.selObjArray.length + ")";
    else this.deleteButton.innerHTML = "Delete";

    if (this.dlgCallback) {
      if (this.shapeEditor.selObjArray.length === 1) {
        var shape = this.shapeEditor.selObjArray[0];
        this.dlgCallback({ id: 0, type: shape.getType(), obj: shape });
      } else {
        this.dlgCallback({ id: this.shapeEditor.selObjArray.length, type: -1 });
      }
    }
  }
  drawSnapGrid() {
    if (this.keyPoint != null) {
      var w0 = this.image.width * this.coords.scale;
      var h0 = this.image.height * this.coords.scale;
      var sx = this.coords.offset.x;
      var sy = this.coords.offset.y;
      var w = this.bgCanvas.width - sx;
      var h = this.bgCanvas.height - sy;
      w = Math.min(w0, w);
      h = Math.min(h0, h);

      this.editCtx.save();

      this.editCtx.strokeStyle = "red";
      this.editCtx.lineWidth = 1;
      this.editCtx.lineCap = "round";
      this.editCtx.setLineDash([20, 5]);

      this.editCtx.beginPath();
      this.editCtx.moveTo(sx, this.keyPoint.y);
      this.editCtx.lineTo(sx + w, this.keyPoint.y);
      this.editCtx.stroke();

      this.editCtx.beginPath();
      this.editCtx.moveTo(this.keyPoint.x, sy);
      this.editCtx.lineTo(this.keyPoint.x, sy + h);
      this.editCtx.stroke();

      this.editCtx.restore();
    }
  }
  drawShapes(bRefresh, bCanvasRefresh) {
    this.bgCtx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
    if (bRefresh || bCanvasRefresh) {
      var w0 = this.image.width * this.coords.scale;
      var h0 = this.image.height * this.coords.scale;
      var sx = this.coords.offset.x;
      var sy = this.coords.offset.y;
      var w = this.bgCanvas.width - sx;
      var h = this.bgCanvas.height - sy;
      w = Math.min(w0, w);
      h = Math.min(h0, h);
      this.bgCtx.drawImage(this.pdfCanvas, sx, sy, w, h, sx, sy, w, h);
    } else {
      // this.image.style.width = this.bgCanvas.width * this.coords.scale;
      // this.image.style.height = this.bgCanvas.height * this.coords.scale;
      this.bgCtx.drawImage(
        this.image,
        this.coords.offset.x,
        this.coords.offset.y,
        this.image.width * this.coords.scale,
        this.image.height * this.coords.scale
      ); //, this.bgCanvas.clientWidth, this.bgCanvas.clientHeight);
    }

    this.symCtx.clearRect(0, 0, this.symCanvas.width, this.symCanvas.height);
    var canvasRect = new Rect();
    canvasRect.leftTop.x = 0;
    canvasRect.leftTop.y = 0;
    canvasRect.rightBottom.x = this.symCanvas.clientWidth;
    canvasRect.rightBottom.y = this.symCanvas.clientHeight;
    for (var i = 0; i < this.shapeArray.length; i++) {
      if (!this.shapeEditor.contains(this.shapeArray[i])) {
        if (
          canvasRect.intersects(
            this.coords.DocRectToScreen(this.shapeArray[i].boundRect)
          )
        )
          this.shapeArray[i].drawShape(this.symCtx, this.coords);
      }
    }
    this.shapeEditor.draw(this.editCanvas, this.editCtx, this.coords);
    this.drawSnapGrid();
    this.showCursor();
  }
  drawCanvases(bPdfRefresh, bCanvasRefresh) {
    if (Drawing.bDrawing) return;

    Drawing.bDrawing = true;

    if (this.docType === "png" || !Drawing.bDrawPdf) {
      this.drawShapes(false, false);
      Drawing.bDrawing = false;
    } else {
      if (bPdfRefresh) {
        var viewport = this.pdfPageProxy.getViewport({
          scale: this.coords.scale,
          offsetX: this.coords.offset.x,
          offsetY: this.coords.offset.y,
        });
        var renderContext = {
          canvasContext: this.pdfCtx,
          viewport: viewport,
        };
        this.pdfRenderTask = this.pdfPageProxy.render(renderContext);
        this.pdfRenderTask.promise.then(() => {
          this.drawShapes(bPdfRefresh, bCanvasRefresh);
          Drawing.bDrawing = false;
        });
      } else {
        this.drawShapes(bPdfRefresh, bCanvasRefresh);
        Drawing.bDrawing = false;
      }
    }
  }
  showCursor() {
    var cursor = "grab"; //default
    switch (this.shapeEditor.getAction()) {
      case ACTION.NONE:
        cursor = "grab";
        if (this.shapeEditor.getOption() === ACTION_Option.MOVING) {
          cursor = "grabbing";
        }
        break;
      case ACTION.DRAW:
      case ACTION.MULTI_SELECT:
        cursor = "crosshair";
        break;
      case ACTION.SELECT:
        cursor = "grab";
        if (this.shapeEditor.getOption() === ACTION_Option.MOVING) {
          cursor = "grab";
        }
        switch (this.shapeEditor.getFlag()) {
          case ACTION_Flag.CAPTURED:
            cursor = "pointer";
            break;
          case ACTION_Flag.SELECTED:
            cursor = "pointer";
            switch (this.shapeEditor.getOption()) {
              case ACTION_Option.NONE:
                var selId = this.shapeEditor.getSelPointId();
                if (selId > 0) {
                  cursor = "move";
                }
                break;
              default:
                break;
            }
            break;
          case ACTION_Flag.MULTI_SELECTED:
            cursor = "default";
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
    this.containerElement.style.cursor = cursor;
  }
  resizeCanvases(w, h) {
    this.pdfCanvas.width = w;
    this.pdfCanvas.height = h;

    this.bgCanvas.width = w;
    this.bgCanvas.height = h;
    this.bgCanvas.style.width = w + "px";
    this.bgCanvas.style.height = h + "px";
    this.symCanvas.width = w;
    this.symCanvas.height = h;
    this.symCanvas.style.width = w + "px";
    this.symCanvas.style.height = h + "px";
    this.editCanvas.width = w;
    this.editCanvas.height = h;
    this.editCanvas.style.width = w + "px";
    this.editCanvas.style.height = h + "px";
  }
  downloadToPdf() {
    if (this.docType === "pdf" && this.pdfDocProxy !== null) {
      this.pdfDocProxy.getData().then((data) => {
        PDFDocument.load(data).then((pdfDoc) => {
          const pages = pdfDoc.getPages();
          const editPage = pages[this.docPageNum - 1];
          for (var i = 0; i < this.shapeArray.length; i++) {
            this.shapeArray[i].drawPdfShape(editPage);
          }
          pdfDoc.save().then((pdfBytes) => {
            download(pdfBytes, "test.pdf", "application/pdf");
          });
        });
      });
    } else {
      PDFDocument.create().then((pdfDoc) => {
        const firstPage = pdfDoc.addPage([this.image.width, this.image.height]);
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        canvas.width = this.image.width;
        canvas.height = this.image.height;
        ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
        var url = canvas.toDataURL();

        pdfDoc.embedPng(url).then((embedPng) => {
          firstPage.drawImage(embedPng, {
            x: 0,
            y: 0,
            width: this.image.width,
            height: this.image.height,
          });
          for (var i = 0; i < this.shapeArray.length; i++) {
            this.shapeArray[i].drawPdfShape(firstPage);
          }
          pdfDoc.save().then((pdfBytes) => {
            download(pdfBytes, "test.pdf", "application/pdf");
          });
        });
      });
      // var doc = new jsPDF({
      //   unit: "px",
      //   format: [this.docWidth, this.docHeight],
      //   orientation: "l",
      //   floatPrecision: 2,
      // });
      // var canvas = document.createElement("canvas");
      // var ctx = canvas.getContext("2d");
      // canvas.width = this.image.width;
      // canvas.height = this.image.height;
      // ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
      // var coords = new Coords();
      // for (var i = 0; i < this.shapeArray.length; i++) {
      //   if (this.shapeArray[i].type !== SHAPE_Type.TEXT)
      //     this.shapeArray[i].drawShape(ctx, coords);
      // }
      // var image = new Image();
      // image.onload = (e) => {
      //   doc.addImage(image, 0, 0, this.docWidth, this.docHeight);
      //   var ctx = doc.canvas.getContext("2d");
      //   var coords = new Coords();
      //   for (var i = 0; i < this.shapeArray.length; i++) {
      //     if (this.shapeArray[i].type === SHAPE_Type.TEXT)
      //       this.shapeArray[i].drawShape(ctx, coords);
      //   }
      //   doc.save("demo.pdf");
      // };
      // image.src = canvas.toDataURL();
    }
  }
  loadPng(url) {
    if (this.bLoading) return;

    if (this.pdfPageProxy != null) {
      this.pdfPageProxy = null;
    }
    if (this.pdfDocProxy != null) {
      this.pdfDocProxy.destroy();
      this.pdfDocProxy = null;
    }
    this.bLoading = true;
    this.image = new Image();
    this.image.onload = (e) => {
      this.docWidth = this.image.width;
      this.docHeight = this.image.height;
      var w = this.containerElement.clientWidth;
      var h = this.containerElement.clientHeight;
      var scale = Math.min(w / this.docWidth, h / this.docHeight);
      this.resizeCanvases(w, h);
      this.coords.reset();
      this.coords.scale = scale;
      this.coords.offset.x = (w - this.docWidth * scale) / 2;
      this.coords.offset.y = (h - this.docHeight * scale) / 2;
      this.drawCanvases(true, true);
      this.bLoading = false;
    };
    this.image.src = url;
  }
  loadPdf(url, pageNum) {
    if (this.bLoading) return;

    if (this.pdfPageProxy != null) {
      this.pdfPageProxy = null;
    }
    if (this.pdfDocProxy != null) {
      this.pdfDocProxy.destroy();
      this.pdfDocProxy = null;
    }
    this.bLoading = true;
    var loadingTask = pdfjs.getDocument(url);
    loadingTask.promise.then(
      (pdf) => {
        // Load information from the first page.
        this.pdfDocProxy = pdf;
        pdf.getPage(pageNum).then((page) => {
          this.pdfPageProxy = page;
          var viewport = this.pdfPageProxy.getViewport({ scale: 1 });
          this.docWidth = viewport.width;
          this.docHeight = viewport.height;

          var w = this.containerElement.clientWidth;
          var h = this.containerElement.clientHeight;
          var scale = Math.min(w / this.docWidth, h / this.docHeight);
          this.resizeCanvases(w, h);
          this.coords.reset();
          this.coords.scale = scale;
          this.coords.offset.x = (w - this.docWidth * scale) / 2;
          this.coords.offset.y = (h - this.docHeight * scale) / 2;

          var canvas = document.createElement("canvas");
          var ctx = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          var renderContext = {
            canvasContext: ctx,
            viewport: viewport,
          };
          page.render(renderContext).promise.then(() => {
            this.image = new Image();
            this.image.onload = (e) => {
              this.drawCanvases(true, true);

              this.bLoading = false;
            };
            this.image.src = canvas.toDataURL();
          });
        });
      },
      function (reason) {
        console.error(reason);
        this.bLoading = false;
      }
    );
  }
  async loadDocument(type, imgPath, pageNum, jsonData) {
    this.containerElement.style.cursor = "wait";
    MLineShape.pixelRange = 0;
    this.docType = type;
    this.docUrl = imgPath;
    this.docPageNum = pageNum;
    this.color = "red";
    this.drawingShape = null;
    this.shapeEditor.reset();
    this.hidePopupMenu();
    this.shapeArray = new Array(0);
    if (jsonData != null) {
      var loadData = JSON.parse(jsonData);
      MLineShape.pixelRange = loadData.scale;
      var objArray = loadData.annotationArray;
      for (var i = 0; i < objArray.length; i++) {
        var obj = objArray[i];
        switch (obj.type) {
          case SHAPE_Type.LINE:
          case SHAPE_Type.ARROW:
            this.shapeArray.push(LineShape.from(obj));
            break;
          case SHAPE_Type.CALIBRATION:
            this.shapeArray.push(MLineShape.from(obj));
            break;
          case SHAPE_Type.LINE_MEASURE:
            this.shapeArray.push(MLineShape.from(obj));
            break;
          case SHAPE_Type.RECT:
          case SHAPE_Type.ELLIPSE:
          case SHAPE_Type.CLOUD:
          case SHAPE_Type.CROSS:
          case SHAPE_Type.RECT_Highlight:
          case SHAPE_Type.ELLIPSE_Highlight:
          case SHAPE_Type.CLOUD_Highlight:
            this.shapeArray.push(RectShape.from(obj));
            break;
          case SHAPE_Type.RECT_MEASURE:
            this.shapeArray.push(MRectShape.from(obj));
            break;
          case SHAPE_Type.POLY_LINE:
          case SHAPE_Type.POLY_BRUSH:
            this.shapeArray.push(PolylineShape.from(obj));
            break;
          case SHAPE_Type.POLYLINE_MEASURE:
          case SHAPE_Type.POLYGON_MEASURE:
            this.shapeArray.push(MPolylineShape.from(obj));
            break;
          case SHAPE_Type.TEXT:
            this.shapeArray.push(TextShape.from(obj));
            break;
          case SHAPE_Type.SYMBOL:
            var symbol = SymbolShape.from(obj);
            while (symbol.image === null) {
              const sleep = (delay) =>
                new Promise((res) => {
                  setTimeout(res, delay);
                });
              await sleep(1);
            }
            this.shapeArray.push(symbol);
            break;
          case SHAPE_Type.CAMERA:
            var camera = CameraShape.from(obj);
            while (camera.image === null) {
              const sleep = (delay) =>
                new Promise((res) => {
                  setTimeout(res, delay);
                });
              await sleep(1);
            }
            this.shapeArray.push(camera);
            break;
          default:
            break;
        }
      }
    }
    if (this.docType === "png") this.loadPng(imgPath);
    else this.loadPdf(imgPath, pageNum);
  }
  zoom(event) {
    if (Drawing.bDrawing) return;
    if (this.coords.zoom(event)) {
      this.drawCanvases(true, true);
    }
  }
  selectShapes(line) {
    if (this.shapeArray.length === 0) return;
    for (var i = 0; i < this.shapeArray.length; i++) {
      if (!this.shapeEditor.contains(this.shapeArray[i])) {
        if (
          this.shapeArray[i].intersects(line.line.first(), line.line.last())
        ) {
          this.shapeEditor.setObj(this.shapeArray[i], i);
        }
      }
    }
  }
  mouseDown(event) {
    this.hidePopupMenu();
    var mousePt = new Point(event.offsetX, event.offsetY);
    var curPt = this.coords.screenPtToDoc(mousePt);
    if (this.keyDownValue === "Shift") this.keyPoint = mousePt.clone();
    else this.keyPoint = null;
    this.prevX = mousePt.x;
    this.prevY = mousePt.y;
    if (
      this.drawingShape === null &&
      this.shapeEditor.getAction() === ACTION.DRAW
    ) {
      switch (this.shapeEditor.getDrawType()) {
        case SHAPE_Type.LINE:
          this.drawingShape = new LineShape();
          this.drawingShape.setType(SHAPE_Type.LINE);
          break;
        case SHAPE_Type.ARROW:
          this.drawingShape = new LineShape();
          this.drawingShape.setType(SHAPE_Type.ARROW);
          break;
        case SHAPE_Type.CALIBRATION:
          this.drawingShape = new MLineShape();
          this.drawingShape.setType(SHAPE_Type.CALIBRATION);
          break;
        case SHAPE_Type.LINE_MEASURE:
          this.drawingShape = new MLineShape();
          this.drawingShape.setType(SHAPE_Type.LINE_MEASURE);
          break;
        case SHAPE_Type.POLY_LINE:
          this.drawingShape = new PolylineShape();
          this.drawingShape.setType(SHAPE_Type.POLY_LINE);
          break;
        case SHAPE_Type.POLY_BRUSH:
          this.drawingShape = new PolylineShape();
          this.drawingShape.setType(SHAPE_Type.POLY_BRUSH);
          break;
        case SHAPE_Type.POLYLINE_MEASURE:
          this.drawingShape = new MPolylineShape();
          this.drawingShape.setType(SHAPE_Type.POLYLINE_MEASURE);
          break;
        case SHAPE_Type.POLYGON_MEASURE:
          this.drawingShape = new MPolylineShape();
          this.drawingShape.setType(SHAPE_Type.POLYGON_MEASURE);
          break;
        case SHAPE_Type.TEXT:
          this.drawingShape = new TextShape();
          this.drawingShape.setType(SHAPE_Type.TEXT);
          this.drawingShape.setText("");
          break;
        case SHAPE_Type.RECT:
          this.drawingShape = new RectShape();
          this.drawingShape.setType(SHAPE_Type.RECT);
          break;
        case SHAPE_Type.RECT_Highlight:
          this.drawingShape = new RectShape();
          this.drawingShape.setType(SHAPE_Type.RECT_Highlight);
          this.drawingShape.setHighlight("");
          break;
        case SHAPE_Type.ELLIPSE:
          this.drawingShape = new RectShape();
          this.drawingShape.setType(SHAPE_Type.ELLIPSE);
          break;
        case SHAPE_Type.ELLIPSE_Highlight:
          this.drawingShape = new RectShape();
          this.drawingShape.setType(SHAPE_Type.ELLIPSE_Highlight);
          this.drawingShape.setHighlight("");
          break;
        case SHAPE_Type.CLOUD:
          this.drawingShape = new RectShape();
          this.drawingShape.setType(SHAPE_Type.CLOUD);
          break;
        case SHAPE_Type.CLOUD_Highlight:
          this.drawingShape = new RectShape();
          this.drawingShape.setType(SHAPE_Type.CLOUD_Highlight);
          this.drawingShape.setHighlight("");
          break;
        case SHAPE_Type.CROSS:
          this.drawingShape = new RectShape();
          this.drawingShape.setType(SHAPE_Type.CROSS);
          break;
        case SHAPE_Type.RECT_MEASURE:
          this.drawingShape = new MRectShape();
          this.drawingShape.setType(SHAPE_Type.RECT_MEASURE);
          break;
        case SHAPE_Type.SYMBOL:
          this.drawingShape = new SymbolShape();
          this.drawingShape.setType(SHAPE_Type.SYMBOL);
          this.drawingShape.setId(this.shapeEditor.symId);
          this.drawingShape.setColor(this.color);
          break;
        case SHAPE_Type.CAMERA:
          this.drawingShape = new CameraShape();
          this.drawingShape.setType(SHAPE_Type.CAMERA);
          this.drawingShape.setColor(this.color);
          break;

        default:
          break;
      }
      this.drawingShape.setColor(this.color);
      this.drawingShape.mouseDown(curPt);
    } else if (this.shapeEditor.getAction() === ACTION.SELECT) {
      if (this.shapeEditor.getFlag() === ACTION_Flag.CAPTURED) {
        this.shapeEditor.setFlag(ACTION_Flag.SELECTED);
        this.drawCanvases(false, true);
      } else if (this.shapeEditor.getFlag() === ACTION_Flag.SELECTED) {
        if (this.shapeEditor.isValid()) {
          if (!this.shapeEditor.containsPtAt(0, curPt)) {
            this.shapeEditor.reset();
            this.drawCanvases(false, true);
          } else {
            if (this.shapeEditor.getSelPointId() > 0) {
              this.shapeEditor.setOption(ACTION_Option.CAN_CHANGE);
            } else this.shapeEditor.setOption(ACTION_Option.CAN_MOVE);
            this.showCursor();
          }
        }
      } else if (this.shapeEditor.getFlag() === ACTION_Flag.MULTI_SELECTED) {
        if (this.shapeEditor.isValid()) {
          if (!this.shapeEditor.containsPt(curPt)) {
            this.shapeEditor.reset();
            this.drawCanvases(false, true);
          }
        }
      } else {
        this.shapeEditor.setOption(ACTION_Option.MOVING);
        this.coords.mouseDown(mousePt);
      }
    } else if (this.shapeEditor.getAction() === ACTION.MULTI_SELECT) {
      this.shapeEditor.selectLine.mouseDown(curPt);
    } else if (this.shapeEditor.getAction() === ACTION.NONE) {
      this.shapeEditor.setOption(ACTION_Option.MOVING);
      this.coords.mouseDown(mousePt);
    }
  }
  mouseMove(event) {
    var mousePt = new Point(event.offsetX, event.offsetY);
    if (this.keyDownValue === "Shift") {
      if (this.keyPoint == null) this.keyPoint = mousePt.clone();
    } else this.keyPoint = null;

    if (this.keyPoint != null) {
      if (Math.abs(event.offsetX - this.keyPoint.x) < EditShapes.snapWidth) {
        mousePt.x = this.keyPoint.x;
      } else {
        mousePt.y = this.keyPoint.y;
      }
    }

    var curPt = this.coords.screenPtToDoc(mousePt);
    if (this.drawingShape != null) {
      if (this.shapeEditor.getAction() === ACTION.DRAW) {
        this.drawingShape.mouseMove(curPt);
        this.editCtx.clearRect(
          0,
          0,
          this.editCanvas.clientWidth,
          this.editCanvas.clientHeight
        );
        this.drawingShape.drawShape(this.editCtx, this.coords);
        this.drawSnapGrid();
      }
    } else if (this.shapeEditor.getAction() === ACTION.SELECT) {
      if (this.shapeEditor.getOption() === ACTION_Option.MOVING) {
        this.coords.mouseMove(mousePt);
        this.drawCanvases(false, false);
        this.showCursor();
      } else if (
        this.shapeEditor.getFlag() === ACTION_Flag.NONE ||
        this.shapeEditor.getFlag() === ACTION_Flag.CAPTURED
      ) {
        this.shapeEditor.setFlag(ACTION_Flag.NONE);
        this.shapeEditor.reset();
        for (var i = 0; i < this.shapeArray.length; i++) {
          var selId = this.shapeArray[i].contains(curPt);
          if (selId >= 0) {
            this.shapeEditor.setFlag(ACTION_Flag.CAPTURED);
            this.shapeEditor.setObj(this.shapeArray[i], i);
            break;
          }
        }
        this.showCursor();
      } else if (this.shapeEditor.getFlag() === ACTION_Flag.SELECTED) {
        switch (this.shapeEditor.getOption()) {
          case ACTION_Option.CAN_MOVE:
            var dx = mousePt.x - this.prevX;
            var dy = mousePt.y - this.prevY;
            this.shapeEditor.selObjArray[0].shiftBy(
              dx / this.coords.scale,
              dy / this.coords.scale
            );
            this.drawCanvases(false, false);
            this.prevX = mousePt.x;
            this.prevY = mousePt.y;
            break;
          case ACTION_Option.CAN_CHANGE:
            dx = mousePt.x - this.prevX;
            dy = mousePt.y - this.prevY;
            this.shapeEditor.selObjArray[0].shiftPointAt(
              this.shapeEditor.getSelPointId() - 1,
              dx / this.coords.scale,
              dy / this.coords.scale
            );
            this.drawCanvases(false, false);
            this.prevX = mousePt.x;
            this.prevY = mousePt.y;
            break;
          case ACTION_Option.NONE:
            if (
              this.shapeEditor.selObjArray[0].getType() !==
                SHAPE_Type.POLY_LINE &&
              this.shapeEditor.selObjArray[0].getType() !==
                SHAPE_Type.POLY_BRUSH
            ) {
              selId = this.shapeEditor.selObjArray[0].contains(curPt);
              this.shapeEditor.setSelPointId(selId);
            }
            break;
          default:
            break;
        }
        this.showCursor();
      }
    } else if (this.shapeEditor.getAction() === ACTION.MULTI_SELECT) {
      if (this.shapeEditor.selectLine.getSize() > 0) {
        this.shapeEditor.selectLine.mouseMove(curPt);
        var line = new LineShape();
        line.moveTo(this.shapeEditor.selectLine.poly.preLast());
        line.lineTo(this.shapeEditor.selectLine.poly.last());
        this.selectShapes(line);
        this.shapeEditor.draw(this.editCanvas, this.editCtx, this.coords);
      }
    } else if (this.shapeEditor.getAction() === ACTION.NONE) {
      if (this.shapeEditor.getOption() === ACTION_Option.MOVING) {
        this.coords.mouseMove(mousePt);
        this.drawCanvases(false, false);
      }
    }
  }
  mouseUp(event) {
    var mousePt = new Point(event.offsetX, event.offsetY);
    if (this.keyPoint != null) {
      if (Math.abs(event.offsetX - this.keyPoint.x) < EditShapes.snapWidth) {
        mousePt.x = this.keyPoint.x;
      } else {
        mousePt.y = this.keyPoint.y;
      }
    }
    this.keyPoint = null;
    var curPt = this.coords.screenPtToDoc(mousePt);
    if (this.drawingShape != null) {
      if (this.drawingShape.mouseUp(curPt)) {
        this.editCtx.clearRect(
          0,
          0,
          this.editCanvas.clientWidth,
          this.editCanvas.clientHeight
        );
        this.shapeArray.push(this.drawingShape);
        var bHighlight = this.drawingShape.isHighlight();
        var bCalibration =
          this.drawingShape.getType() === SHAPE_Type.CALIBRATION;
        var bSymbol = this.drawingShape.getType() === SHAPE_Type.SYMBOL;
        var bCamera = this.drawingShape.getType() === SHAPE_Type.CAMERA;
        var bText = this.drawingShape.getType() === SHAPE_Type.TEXT;
        this.drawingShape = null;
        this.shapeEditor.setAction(ACTION.SELECT);
        if (bHighlight || bCalibration || bSymbol || bCamera || bText) {
          var id = this.shapeArray.length - 1;
          this.shapeEditor.setObj(this.shapeArray[id], id);
          this.shapeEditor.setFlag(ACTION_Flag.SELECTED);
          var rect = this.coords.DocRectToScreen(
            this.shapeEditor.getSelBoundRect()
          );
          var x = (rect.leftTop.x + rect.rightBottom.x) / 2;
          x -= 100 / 2;
          var y = rect.rightBottom.y + 5;
          this.showPopupMenu(x, y);
        }
      } else {
        this.drawingShape = null;
        this.shapeEditor.setAction(ACTION.SELECT);
      }
      this.showCursor();
    } else {
      if (this.shapeEditor.getAction() === ACTION.SELECT) {
        if (this.shapeEditor.getOption() === ACTION_Option.MOVING) {
          this.coords.mouseUp(mousePt);
          this.shapeEditor.setOption(ACTION_Option.NONE);
        } else if (this.shapeEditor.getFlag() === ACTION_Flag.SELECTED) {
          this.shapeEditor.setOption(ACTION_Option.NONE);
          if (this.shapeEditor.isValid()) {
            rect = this.coords.DocRectToScreen(
              this.shapeEditor.getSelBoundRect()
            );
            x = (rect.leftTop.x + rect.rightBottom.x) / 2;
            x -= 100 / 2;
            y = rect.rightBottom.y + 5;
            this.showPopupMenu(x, y);
          }
        }
        this.showCursor();
      } else if (this.shapeEditor.getAction() === ACTION.MULTI_SELECT) {
        this.shapeEditor.selectLine.reset();
        this.shapeEditor.setAction(ACTION.SELECT);
        if (this.shapeEditor.isValid()) {
          if (this.shapeEditor.selObjArray.length === 1)
            this.shapeEditor.setFlag(ACTION_Flag.SELECTED);
          else this.shapeEditor.setFlag(ACTION_Flag.MULTI_SELECTED);
          rect = this.coords.DocRectToScreen(
            this.shapeEditor.getSelBoundRect()
          );
          x = (rect.leftTop.x + rect.rightBottom.x) / 2;
          x -= 100 / 2;
          y = rect.rightBottom.y + 5;
          this.showPopupMenu(x, y);
        }
        this.showCursor();
      } else if (this.shapeEditor.getAction() === ACTION.NONE) {
        if (this.shapeEditor.getOption() === ACTION_Option.MOVING) {
          this.coords.mouseUp(mousePt);
          this.shapeEditor.setOption(ACTION_Option.NONE);
          this.showCursor();
        }
      }
    }
    this.drawCanvases(true, true);
  }
  keyDown(event) {
    this.keyDownValue = event.key;
  }
  keyUp(event) {
    this.keyDownValue = "";
  }
  editTextShape(label, sizeId, bShowBorder) {
    var textShape = this.shapeEditor.selObjArray[0];
    textShape.setText(label);
    textShape.setTextSize(TextShape.txtSizeArray[sizeId]);
    textShape.showBorder(bShowBorder);
    this.shapeEditor.draw(this.editCanvas, this.editCtx, this.coords);
  }
  resize(event) {
    var w = this.containerElement.clientWidth;
    var h = this.containerElement.clientHeight;
    this.resizeCanvases(w, h);
    this.drawCanvases(true, true);
  }
  save() {
    var data = {
      scale: MLineShape.pixelRange,
      annotationArray: this.shapeArray,
    };
    return JSON.stringify(data);
  }
  leftZoomIn() {
    if (Drawing.bDrawing) return;
    var result = this.coords.zoomByScale(
      this.editCanvas.clientWidth / 2,
      this.editCanvas.clientHeight / 2,
      this.coords.scale * 1.1892071150027210667174999705605
    );
    if (result) this.drawCanvases(true, true);
  }
  leftZoomOut() {
    if (Drawing.bDrawing) return;
    var result = this.coords.zoomByScale(
      this.editCanvas.clientWidth / 2,
      this.editCanvas.clientHeight / 2,
      this.coords.scale / 1.1892071150027210667174999705605
    );
    if (result) this.drawCanvases(true, true);
  }
  leftZoomFull() {
    if (Drawing.bDrawing) return;

    var w = this.containerElement.clientWidth;
    var h = this.containerElement.clientHeight;
    var scale = Math.min(w / this.docWidth, h / this.docHeight);
    this.coords.scale = scale;
    this.coords.offset.x = (w - this.docWidth * scale) / 2;
    this.coords.offset.y = (h - this.docHeight * scale) / 2;
    this.drawCanvases(true, true);
  }
  leftFullscreen() {
    if (!this.fullscreenEnabled) {
      this.container[this.api.request]();
    } else {
      document[this.api.exit]();
    }
    this.fullscreenEnabled = !this.fullscreenEnabled;
    localStorage.setItem('fullscreen', this.fullscreenEnabled);
  }
}
