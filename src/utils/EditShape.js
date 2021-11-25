import { Rect } from "./Point";
import { BaseShape, SHAPE_Type } from "./BaseShape";
import { PolylineShape } from "./PolylineShape";

export var ACTION;
(function (ACTION) {
  ACTION[(ACTION["NONE"] = 0)] = "NONE";
  ACTION[(ACTION["DRAW"] = 1)] = "DRAW";
  ACTION[(ACTION["SELECT"] = 2)] = "SELECT";
  ACTION[(ACTION["MULTI_SELECT"] = 3)] = "MULTI_SELECT";
})(ACTION || (ACTION = {}));
export var ACTION_Flag;
(function (ACTION_Flag) {
  ACTION_Flag[(ACTION_Flag["NONE"] = 0)] = "NONE";
  ACTION_Flag[(ACTION_Flag["CAPTURED"] = 1)] = "CAPTURED";
  ACTION_Flag[(ACTION_Flag["SELECTED"] = 2)] = "SELECTED";
  ACTION_Flag[(ACTION_Flag["MULTI_SELECTED"] = 3)] = "MULTI_SELECTED";
})(ACTION_Flag || (ACTION_Flag = {}));
export var ACTION_Option;
(function (ACTION_Option) {
  ACTION_Option[(ACTION_Option["NONE"] = 0)] = "NONE";
  ACTION_Option[(ACTION_Option["CAN_MOVE"] = 1)] = "CAN_MOVE";
  ACTION_Option[(ACTION_Option["CAN_CHANGE"] = 2)] = "CAN_CHANGE";
  ACTION_Option[(ACTION_Option["MOVING"] = 3)] = "MOVING";
})(ACTION_Option || (ACTION_Option = {}));
export class EditStatus {
  constructor() {
    this.action = ACTION.NONE;
    this.flag = ACTION_Flag.NONE;
    this.option = ACTION_Option.NONE;
    this.drawType = SHAPE_Type.NONE;
  }
  reset() {
    this.action = ACTION.SELECT;
    this.flag = ACTION_Flag.NONE;
    this.option = ACTION_Option.NONE;
  }
  setDrawType(type) {
    this.drawType = type;
  }
  getDrawType() {
    return this.drawType;
  }
  setAction(action) {
    this.action = action;
  }
  getAction() {
    return this.action;
  }
  setFlag(flag) {
    this.flag = flag;
  }
  getFlag() {
    return this.flag;
  }
  setOption(option) {
    this.option = option;
  }
  getOption() {
    return this.option;
  }
}
export class EditShapes {
  constructor(main) {
    this.selPointId = -1;
    this.selObjArray = new Array(0);
    this.selShapeIdArray = new Array(0);
    this.editStatus = new EditStatus();
    this.selectLine = new PolylineShape();
    this.selectLine.setToDash();
    this.selectLine.setColor("grey");
    this.selectLine.reset();
    this.main = main;
    this.symId = 0;
  }
  draw(canvas, ctx, coords) {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    if (this.isValid()) {
      for (var i = 0; i < this.selObjArray.length; i++) {
        this.selObjArray[i].drawShape(ctx, coords);
        this.selObjArray[i].drawBound(ctx, coords);
      }
    }
    this.selectLine.drawShape(ctx, coords);
  }
  contains(obj) {
    const exist = (element) => element === obj;
    return this.selObjArray.some(exist);
  }
  containsPtAt(id, pt) {
    return this.selObjArray[id].boundRect.contains(
      pt,
      BaseShape.getTolerance()
    );
  }
  containsPt(pt) {
    for (var i = 0; i < this.selObjArray.length; i++) {
      if (this.selObjArray[i].boundRect.contains(pt, BaseShape.getTolerance()))
        return true;
    }
    return false;
  }
  setObj(obj, id) {
    this.selObjArray.push(obj);
    this.selShapeIdArray.push(id);
  }
  setSelPointId(id) {
    this.selPointId = id;
  }
  getSelPointId() {
    return this.selPointId;
  }
  reset() {
    while (this.selObjArray.length > 0) this.selObjArray.pop();
    while (this.selShapeIdArray.length > 0) this.selShapeIdArray.pop();
    this.selPointId = -1;
    this.editStatus.reset();
  }
  isValid() {
    return this.selObjArray.length > 0;
  }
  setAction(a) {
    this.editStatus.setAction(a);
  }
  getAction() {
    return this.editStatus.getAction();
  }
  setDrawType(a) {
    this.editStatus.setDrawType(a);
  }
  getDrawType() {
    return this.editStatus.getDrawType();
  }
  setFlag(a) {
    this.editStatus.setFlag(a);
  }
  getFlag() {
    return this.editStatus.getFlag();
  }
  setOption(a) {
    this.editStatus.setOption(a);
  }
  getOption() {
    return this.editStatus.getOption();
  }
  getSelBoundRect() {
    var rect = new Rect();
    if (this.isValid()) {
      for (var i = 0; i < this.selObjArray.length; i++) {
        rect.extendRect(this.selObjArray[i].boundRect);
      }
    }
    return rect;
  }
}

EditShapes.snapWidth = 20;
