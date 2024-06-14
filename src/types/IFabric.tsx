import { Polygon, Control } from 'fabric/fabric-impl'

export interface IPolygon extends Polygon {
  edit: Boolean
}

export interface IPartial extends Partial<Control> {
  pointIndex: number
}
