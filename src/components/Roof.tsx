import { useCanvas } from '@/hooks/useCanvas'
import { fabric } from 'fabric'
import { v4 as uuidv4 } from 'uuid'

export default function Roof() {
  const {
    canvas,
    createFigure,
    handleUndo,
    handleRedo,
    handleClear,
    handleCopy,
    handleDelete,
    handleSave,
    handlePaste,
    handleRotate,
  } = useCanvas('canvas')

  const addRect = () => {
    const rect = new fabric.Rect({
      height: 200,
      width: 200,
      top: 10,
      left: 10,
      opacity: 0.4,
      fill: randomColor(),
      stroke: 'red',
      name: uuidv4(),
    })

    createFigure(rect)
  }

  const addHorizontalLine = () => {
    /**
     * 시작X,시작Y,도착X,도착Y 좌표
     */
    const horizontalLine = new fabric.Line([20, 20, 100, 20], {
      name: uuidv4(),
      stroke: 'red',
      strokeWidth: 3,
      selectable: true,
    })

    createFigure(horizontalLine)
  }

  const addVerticalLine = () => {
    const verticalLine = new fabric.Line([10, 10, 10, 100], {
      name: uuidv4(),
      stroke: 'red',
      strokeWidth: 3,
      selectable: true,
    })

    createFigure(verticalLine)
  }

  const addTriangle = () => {
    const triangle = new fabric.Triangle({
      name: uuidv4(),
      top: 50,
      left: 50,
      width: 100,
      stroke: randomColor(),
      strokeWidth: 3,
    })

    createFigure(triangle)
  }

  const addTrapezoid = () => {
    // create a polygon object
    let points = [
      { x: 100, y: 4 },
      { x: 200, y: 4 },
      { x: 250, y: 100 },
      { x: 100, y: 100 },
    ]

    let polygon = new fabric.Polygon(points, {
      left: 100,
      top: 50,
      fill: 'transparent',
      strokeWidth: 1,
      stroke: 'green',
      scaleX: 4,
      scaleY: 4,
      objectCaching: false,
      transparentCorners: false,
      cornerColor: 'blue',
      edit: false,
    })

    canvas?.add(polygon)
  }

  function edit() {
    const poly = canvas?.getActiveObject()
    poly.edit = !poly.edit
    if (poly.edit) {
      var lastControl = poly.points.length - 1
      poly.cornerStyle = 'rect'
      poly.cornerColor = 'rgba(0,0,255,0.5)'
      poly.controls = poly.points.reduce(function (acc, point, index) {
        acc['p' + index] = new fabric.Control({
          positionHandler: polygonPositionHandler,
          actionHandler: anchorWrapper(
            index > 0 ? index - 1 : lastControl,
            actionHandler,
          ),
          actionName: 'modifyPolygon',
          pointIndex: index,
        })
        return acc
      }, {})
    } else {
      poly.cornerColor = 'blue'
      poly.cornerStyle = 'rect'
      poly.controls = fabric.Object.prototype.controls
    }
    poly.hasBorders = !poly.edit
    canvas?.requestRenderAll()
  }

  // define a function that can locate the controls
  function polygonPositionHandler(
    dim: any,
    finalMatrix: any,
    fabricObject: any,
  ) {
    let x = fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x,
      y = fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y
    return fabric.util.transformPoint(
      {
        x,
        y,
        type: '',
        add: function (that: fabric.IPoint): fabric.Point {
          throw new Error('Function not implemented.')
        },
        addEquals: function (that: fabric.IPoint): fabric.Point {
          throw new Error('Function not implemented.')
        },
        scalarAdd: function (scalar: number): fabric.Point {
          throw new Error('Function not implemented.')
        },
        scalarAddEquals: function (scalar: number): fabric.Point {
          throw new Error('Function not implemented.')
        },
        subtract: function (that: fabric.IPoint): fabric.Point {
          throw new Error('Function not implemented.')
        },
        subtractEquals: function (that: fabric.IPoint): fabric.Point {
          throw new Error('Function not implemented.')
        },
        scalarSubtract: function (scalar: number): fabric.Point {
          throw new Error('Function not implemented.')
        },
        scalarSubtractEquals: function (scalar: number): fabric.Point {
          throw new Error('Function not implemented.')
        },
        multiply: function (scalar: number): fabric.Point {
          throw new Error('Function not implemented.')
        },
        multiplyEquals: function (scalar: number): fabric.Point {
          throw new Error('Function not implemented.')
        },
        divide: function (scalar: number): fabric.Point {
          throw new Error('Function not implemented.')
        },
        divideEquals: function (scalar: number): fabric.Point {
          throw new Error('Function not implemented.')
        },
        eq: function (that: fabric.IPoint): fabric.Point {
          throw new Error('Function not implemented.')
        },
        lt: function (that: fabric.IPoint): fabric.Point {
          throw new Error('Function not implemented.')
        },
        lte: function (that: fabric.IPoint): fabric.Point {
          throw new Error('Function not implemented.')
        },
        gt: function (that: fabric.IPoint): fabric.Point {
          throw new Error('Function not implemented.')
        },
        gte: function (that: fabric.IPoint): fabric.Point {
          throw new Error('Function not implemented.')
        },
        lerp: function (that: fabric.IPoint, t: number): fabric.Point {
          throw new Error('Function not implemented.')
        },
        distanceFrom: function (that: fabric.IPoint): number {
          throw new Error('Function not implemented.')
        },
        midPointFrom: function (that: fabric.IPoint): fabric.Point {
          throw new Error('Function not implemented.')
        },
        min: function (that: fabric.IPoint): fabric.Point {
          throw new Error('Function not implemented.')
        },
        max: function (that: fabric.IPoint): fabric.Point {
          throw new Error('Function not implemented.')
        },
        setXY: function (x: number, y: number): fabric.Point {
          throw new Error('Function not implemented.')
        },
        setX: function (x: number): fabric.Point {
          throw new Error('Function not implemented.')
        },
        setY: function (y: number): fabric.Point {
          throw new Error('Function not implemented.')
        },
        setFromPoint: function (that: fabric.IPoint): fabric.Point {
          throw new Error('Function not implemented.')
        },
        swap: function (that: fabric.IPoint): fabric.Point {
          throw new Error('Function not implemented.')
        },
        clone: function (): fabric.Point {
          throw new Error('Function not implemented.')
        },
      },
      fabric.util.multiplyTransformMatrices(
        fabricObject.canvas.viewportTransform,
        fabricObject.calcTransformMatrix(),
      ),
    )
  }

  function getObjectSizeWithStroke(object: any) {
    let stroke = new fabric.Point(
      object.strokeUniform ? 1 / object.scaleX : 1,
      object.strokeUniform ? 1 / object.scaleY : 1,
    ).multiply(object.strokeWidth)
    return new fabric.Point(object.width + stroke.x, object.height + stroke.y)
  }

  // define a function that will define what the control does
  function actionHandler(eventData: any, transform: any, x: number, y: number) {
    let polygon = transform.target,
      currentControl = polygon.controls[polygon.__corner],
      mouseLocalPosition = polygon.toLocalPoint(
        new fabric.Point(x, y),
        'center',
        'center',
      ),
      polygonBaseSize = getObjectSizeWithStroke(polygon),
      size = polygon._getTransformedDimensions(0, 0),
      finalPointPosition = {
        x:
          (mouseLocalPosition.x * polygonBaseSize.x) / size.x +
          polygon.pathOffset.x,
        y:
          (mouseLocalPosition.y * polygonBaseSize.y) / size.y +
          polygon.pathOffset.y,
      }
    polygon.points[currentControl.pointIndex] = finalPointPosition
    return true
  }

  // define a function that can keep the polygon in the same position when we change its width/height/top/left
  function anchorWrapper(anchorIndex: number, fn: any) {
    return function (eventData: any, transform: any, x: number, y: number) {
      let fabricObject = transform.target
      let originX =
        fabricObject?.points[anchorIndex].x - fabricObject.pathOffset.x
      let originY =
        fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y
      let absolutePoint = fabric.util.transformPoint(
        {
          x: originX,
          y: originY,
          type: '',
          add: function (that: fabric.IPoint): fabric.Point {
            throw new Error('Function not implemented.')
          },
          addEquals: function (that: fabric.IPoint): fabric.Point {
            throw new Error('Function not implemented.')
          },
          scalarAdd: function (scalar: number): fabric.Point {
            throw new Error('Function not implemented.')
          },
          scalarAddEquals: function (scalar: number): fabric.Point {
            throw new Error('Function not implemented.')
          },
          subtract: function (that: fabric.IPoint): fabric.Point {
            throw new Error('Function not implemented.')
          },
          subtractEquals: function (that: fabric.IPoint): fabric.Point {
            throw new Error('Function not implemented.')
          },
          scalarSubtract: function (scalar: number): fabric.Point {
            throw new Error('Function not implemented.')
          },
          scalarSubtractEquals: function (scalar: number): fabric.Point {
            throw new Error('Function not implemented.')
          },
          multiply: function (scalar: number): fabric.Point {
            throw new Error('Function not implemented.')
          },
          multiplyEquals: function (scalar: number): fabric.Point {
            throw new Error('Function not implemented.')
          },
          divide: function (scalar: number): fabric.Point {
            throw new Error('Function not implemented.')
          },
          divideEquals: function (scalar: number): fabric.Point {
            throw new Error('Function not implemented.')
          },
          eq: function (that: fabric.IPoint): fabric.Point {
            throw new Error('Function not implemented.')
          },
          lt: function (that: fabric.IPoint): fabric.Point {
            throw new Error('Function not implemented.')
          },
          lte: function (that: fabric.IPoint): fabric.Point {
            throw new Error('Function not implemented.')
          },
          gt: function (that: fabric.IPoint): fabric.Point {
            throw new Error('Function not implemented.')
          },
          gte: function (that: fabric.IPoint): fabric.Point {
            throw new Error('Function not implemented.')
          },
          lerp: function (that: fabric.IPoint, t: number): fabric.Point {
            throw new Error('Function not implemented.')
          },
          distanceFrom: function (that: fabric.IPoint): number {
            throw new Error('Function not implemented.')
          },
          midPointFrom: function (that: fabric.IPoint): fabric.Point {
            throw new Error('Function not implemented.')
          },
          min: function (that: fabric.IPoint): fabric.Point {
            throw new Error('Function not implemented.')
          },
          max: function (that: fabric.IPoint): fabric.Point {
            throw new Error('Function not implemented.')
          },
          setXY: function (x: number, y: number): fabric.Point {
            throw new Error('Function not implemented.')
          },
          setX: function (x: number): fabric.Point {
            throw new Error('Function not implemented.')
          },
          setY: function (y: number): fabric.Point {
            throw new Error('Function not implemented.')
          },
          setFromPoint: function (that: fabric.IPoint): fabric.Point {
            throw new Error('Function not implemented.')
          },
          swap: function (that: fabric.IPoint): fabric.Point {
            throw new Error('Function not implemented.')
          },
          clone: function (): fabric.Point {
            throw new Error('Function not implemented.')
          },
        },
        fabricObject.calcTransformMatrix(),
      )
      let actionPerformed = fn(eventData, transform, x, y)
      let newDim = fabricObject._setPositionDimensions({})
      let polygonBaseSize = getObjectSizeWithStroke(fabricObject)
      let newX =
        (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) /
        polygonBaseSize.x
      let newY =
        (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) /
        polygonBaseSize.y
      fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5)
      return actionPerformed
    }
  }

  const randomColor = () => {
    return '#' + Math.round(Math.random() * 0xffffff).toString(16)
  }

  return (
    <>
      <div className="flex justify-center my-8">
        <div className="flex justify-center my-8">
          <p>
            ctrl을 누른 채로 클릭하면 점이 생성되고 점을 하나 더 만들면 선이
            생성됩니다.
          </p>
        </div>
        <button
          className="w-30 mx-2 p-2 rounded bg-blue-500 text-white"
          onClick={addRect}
        >
          ADD RECTANGLE
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-blue-500 text-white"
          onClick={addHorizontalLine}
        >
          ADD HORIZONTAL LINE
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-blue-500 text-white"
          onClick={addVerticalLine}
        >
          ADD VERTICALITY LINE
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-blue-500 text-white"
          onClick={addTriangle}
        >
          ADD TRIANGLE
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-blue-500 text-white"
          onClick={addTrapezoid}
        >
          사다리꼴
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-black text-white"
          onClick={handleCopy}
        >
          COPY FIGURE
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-red-500 text-white"
          onClick={handleDelete}
        >
          DELETE
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-red-500 text-white"
          onClick={handleClear}
        >
          CLEAR
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-green-500 text-white"
          onClick={handleUndo}
        >
          UNDO
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-green-300 text-white"
          onClick={handleRedo}
        >
          REDO
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-black text-white"
          onClick={handleSave}
        >
          저장
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-black text-white"
          onClick={handlePaste}
        >
          붙여넣기
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-black text-white"
          onClick={() => handleRotate()}
        >
          45도 회전
        </button>
      </div>
      <div
        className="flex justify-center"
        style={{
          border: '1px solid',
          width: 1000,
          height: 1000,
          margin: 'auto',
        }}
      >
        <canvas id="canvas" />
      </div>
    </>
  )
}
