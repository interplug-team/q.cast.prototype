import { useEffect, useRef, useState } from 'react'

import { fabric } from 'fabric'
import { Point } from 'fabric/fabric-impl'
import { IPartial, IPolygon } from '@/types/IFabric'

const CANVAS = {
  WIDTH: 1000,
  HEIGHT: 1000,
}

export function useCanvas(id: string) {
  const [canvas, setCanvas] = useState<fabric.Canvas | undefined>()
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [history, setHistory] = useState<fabric.Object[] | undefined>([])

  const connectMode = useRef<boolean>(false)
  const points = useRef<fabric.Object[]>([])

  /**
   * 처음 셋팅
   */
  useEffect(() => {
    const c = new fabric.Canvas(id, {
      height: CANVAS.HEIGHT,
      width: CANVAS.WIDTH,
    })

    // settings for all canvas in the app
    fabric.Object.prototype.transparentCorners = false
    fabric.Object.prototype.cornerColor = '#2BEBC8'
    fabric.Object.prototype.cornerStyle = 'rect'
    fabric.Object.prototype.cornerStrokeColor = '#2BEBC8'
    fabric.Object.prototype.cornerSize = 6

    setCanvas(c)
    return () => {
      c.dispose()
    }
  }, [])

  /**
   * 캔버스 초기화
   */
  useEffect(() => {
    if (canvas) {
      initialize()
      canvas.on('object:added', onChange)
      canvas.on('object:added', () => {
        document.addEventListener('keydown', handleKeyDown)
      })
      canvas.on('object:modified', onChange)
      canvas.on('object:removed', onChange)
      // canvas.on('mouse:down', onClick)
    }
  }, [canvas])

  /**
   * 눈금 그리기
   */
  const initialize = (): void => {
    canvas?.clear()

    const width = canvas?.getWidth()
    const height = canvas?.getHeight()

    let startX = 0

    let startY = 0

    while (startX <= width!) {
      startX += 10
      const verticalLine = new fabric.Line([startX, 0, startX, height!], {
        name: 'defaultLine',
        stroke: 'black',
        strokeWidth: 1,
        selectable: false,
        opacity: 0.5,
      })

      createFigure(verticalLine)
    }

    while (startY <= height!) {
      startY += 10
      const verticalLine = new fabric.Line([0, startY, width!, startY], {
        name: 'defaultLine',
        stroke: 'black',
        strokeWidth: 1,
        selectable: false,
        opacity: 0.5,
      })

      createFigure(verticalLine)
    }
  }

  /**
   * 캔버스에 도형을 추가한다. 도형은 사용하는 페이지에서 만들어서 파라미터로 넘겨주어야 한다.
   */
  const createFigure = (figure: fabric.Object): void => {
    canvas?.add(figure)
    canvas?.setActiveObject(figure)
    canvas?.requestRenderAll()
  }

  const onChange = (e: fabric.IEvent): void => {
    const target = e.target
    const action = e.action
    if (target) {
      switch (action) {
        case 'modifyPolygon':
          settleDownPolygon(target as IPolygon)
          break
      }
      settleDown(target)
    }

    if (!isLocked) {
      setHistory([])
    }
    setIsLocked(false)
  }

  /**
   * 눈금 모양에 맞게 움직이도록 한다.
   */
  const settleDown = (figure: fabric.Object): void => {
    const left = Math.round(figure?.left! / 10) * 10
    const top = Math.round(figure?.top! / 10) * 10

    figure?.set({ left: left, top: top })
  }

  /**
   * polygon용
   */
  const settleDownPolygon = (polygon: IPolygon) => {
    const points = polygon.points

    const settledPoints = points?.map((point) => {
      return {
        x: Math.round(point.x / 10) * 10,
        y: Math.round(point.y / 10) * 10,
      }
    }) as Point[]

    polygon.set({ points: settledPoints })
  }

  /**
   * redo, undo가 필요한 곳에서 사용한다.
   */
  const handleUndo = (): void => {
    if (canvas) {
      if (canvas._objects.length > 0) {
        const poppedObject = canvas._objects.pop()
        setHistory((prev: fabric.Object[] | undefined) => {
          if (prev === undefined) {
            return poppedObject ? [poppedObject] : []
          }
          return poppedObject ? [...prev, poppedObject] : prev
        })
        canvas.renderAll()
      }
    }
  }

  const handleRedo = (): void => {
    if (canvas && history) {
      if (history.length > 0) {
        setIsLocked(true)
        canvas.add(history[history.length - 1])
        const newHistory = history.slice(0, -1)
        setHistory(newHistory)
      }
    }
  }

  /**
   * 해당 캔버스를 비운다.
   */
  const handleClear = (): void => {
    canvas?.clear()
    initialize()
  }

  /**
   * 선택한 도형을 복사한다.
   */
  const handleCopy = (): void => {
    const activeObjects = canvas?.getActiveObjects()

    if (activeObjects?.length === 0) {
      return
    }

    activeObjects?.forEach((obj: fabric.Object) => {
      obj.clone((cloned: fabric.Object) => {
        cloned.set({ left: obj.left! + 10, top: obj.top! + 10 })
        createFigure(cloned)
      })
    })
  }

  /**
   * 선택한 도형을 삭제한다.
   */
  const handleDelete = (): void => {
    const targets = canvas?.getActiveObjects()
    if (targets?.length === 0) {
      alert('삭제할 대상을 선택해주세요.')
      return
    }

    if (!confirm('정말로 삭제하시겠습니까?')) {
      return
    }

    targets?.forEach((target) => {
      canvas?.remove(target)
    })
  }

  /**
   * 페이지 내 캔버스 저장
   * todo : 현재는 localStorage에 그냥 저장하지만 나중에 변경해야함
   */
  const handleSave = () => {
    const objects = canvas?.getObjects()

    if (objects?.length === 0) {
      alert('저장할 대상이 없습니다.')
      return
    }
    const jsonStr = JSON.stringify(canvas)
    localStorage.setItem('canvas', jsonStr)
    handleClear()
  }

  /**
   * 페이지 내 캔버스에 저장한 내용 불러오기
   * todo : 현재는 localStorage에 그냥 저장하지만 나중에 변경해야함
   */

  const handlePaste = () => {
    const jsonStr = localStorage.getItem('canvas')
    if (!jsonStr) {
      alert('붙여넣기 할 대상이 없습니다.')
      return
    }

    canvas?.loadFromJSON(JSON.parse(jsonStr), () => {
      localStorage.removeItem('canvas')
      console.log('paste done')
    })
  }

  const moveDown = () => {
    const targetObj = canvas?.getActiveObject()
    if (!targetObj) {
      return
    }

    let top = targetObj.top! + 10

    if (top > CANVAS.HEIGHT) {
      top = CANVAS.HEIGHT
    }

    targetObj.set({ top: top })
    canvas?.renderAll()
  }

  const moveUp = () => {
    const targetObj = canvas?.getActiveObject()
    if (!targetObj) {
      return
    }

    let top = targetObj.top! - 10

    if (top < 0) {
      top = 0
    }

    targetObj.set({ top: top })
    canvas?.renderAll()
  }

  const moveLeft = () => {
    const targetObj = canvas?.getActiveObject()
    if (!targetObj) {
      return
    }

    let left = targetObj.left! - 10

    if (left < 0) {
      left = 0
    }

    targetObj.set({ left: left })
    canvas?.renderAll()
  }

  const moveRight = () => {
    const targetObj = canvas?.getActiveObject()
    if (!targetObj) {
      return
    }

    let left = targetObj.left! + 10

    if (left > CANVAS.WIDTH) {
      left = CANVAS.WIDTH
    }

    targetObj.set({ left: left })
    canvas?.renderAll()
  }

  /**
   * 각종 키보드 이벤트
   * https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key

    switch (key) {
      case 'Delete':
      case 'Backspace':
        handleDelete()
        break
      case 'Down': // IE/Edge에서 사용되는 값
      case 'ArrowDown':
        // "아래 화살표" 키가 눌렸을 때의 동작입니다.
        moveDown()
        break
      case 'Up': // IE/Edge에서 사용되는 값
      case 'ArrowUp':
        // "위 화살표" 키가 눌렸을 때의 동작입니다.
        moveUp()
        break
      case 'Left': // IE/Edge에서 사용되는 값
      case 'ArrowLeft':
        // "왼쪽 화살표" 키가 눌렸을 때의 동작입니다.
        moveLeft()
        break
      case 'Right': // IE/Edge에서 사용되는 값
      case 'ArrowRight':
        // "오른쪽 화살표" 키가 눌렸을 때의 동작입니다.
        moveRight()
        break
      case 'Enter':
        // "enter" 또는 "return" 키가 눌렸을 때의 동작입니다.
        break
      case 'Esc': // IE/Edge에서 사용되는 값
      case 'Escape':
        break
      default:
        return // 키 이벤트를 처리하지 않는다면 종료합니다.
    }
    e.preventDefault()
  }

  const handleRotate = (degree: number = 45) => {
    const target = canvas?.getActiveObject()

    if (!target) {
      return
    }

    const currentAngle = target.angle

    target.set({ angle: currentAngle! + degree })
    canvas?.renderAll()
  }

  /**
   * Polygon 타입만 가능
   * 생성한 polygon을 넘기면 해당 polygon은 꼭지점으로 컨트롤 가능한 polygon이 됨
   */
  const attachCustomContolOnPolygon = (poly: IPolygon) => {
    const lastControl = poly.points?.length! - 1
    poly.cornerStyle = 'rect'
    poly.cornerColor = 'rgba(0,0,255,0.5)'
    poly.controls = poly.points!.reduce(function (acc: any, point, index) {
      acc['p' + index] = new fabric.Control({
        positionHandler: polygonPositionHandler,
        actionHandler: anchorWrapper(
          index > 0 ? index - 1 : lastControl,
          actionHandler,
        ),
        actionName: 'modifyPolygon',
        pointIndex: index,
      } as IPartial)
      return acc
    }, {})

    poly.hasBorders = !poly.edit
    canvas?.requestRenderAll()
  }

  // define a function that can locate the controls
  function polygonPositionHandler(
    dim: any,
    finalMatrix: any,
    fabricObject: any,
  ) {
    // @ts-ignore
    let x = fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x
    // @ts-ignore
    let y = fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y
    return fabric.util.transformPoint(
      { x, y } as Point,
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
      size = polygon._getTransformedDimensions(0, 0)
    polygon.points[currentControl.pointIndex] = {
      x:
        (mouseLocalPosition.x * polygonBaseSize.x) / size.x +
        polygon.pathOffset.x,
      y:
        (mouseLocalPosition.y * polygonBaseSize.y) / size.y +
        polygon.pathOffset.y,
    }
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
        } as Point,
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

  return {
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
    attachCustomContolOnPolygon,
  } as const
}
