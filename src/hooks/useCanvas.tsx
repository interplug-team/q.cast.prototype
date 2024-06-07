import { useEffect, useState } from 'react'
import { fabric } from 'fabric'
import { v4 as uuidv4 } from 'uuid'

export function useCanvas(
  id: string,
): [
  fabric.Canvas | undefined,
  (figure: fabric.Object) => void,
  () => void,
  () => void,
  () => void,
  () => void,
  () => void,
] {
  const [canvas, setCanvas] = useState<fabric.Canvas | undefined>()
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [history, setHistory] = useState<fabric.Object[] | undefined>([])

  /**
   * 처음 셋팅
   */
  useEffect(() => {
    const c = new fabric.Canvas(id, {
      height: 800,
      width: 800,
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
      canvas.on('object:modified', onChange)
      canvas.on('object:removed', onChange)
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
        name: uuidv4(),
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
        name: uuidv4(),
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
    if (target) {
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
   * redo, undo가 필요한 곳에서 사용한다.
   */
  const handleRedo = (): void => {
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

  const handleUndo = (): void => {
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
    const targetObj = canvas?.getActiveObject()
    if (!targetObj) {
      alert('복사할 대상을 선택해주세요.')
      return
    }

    targetObj.clone((cloned: fabric.Object) => {
      cloned.left! += 10
      cloned.top! += 10
      canvas?.add(cloned)
      canvas?.setActiveObject(cloned)
    })
  }

  /**
   * 선택한 도형을 삭제한다.
   */
  const handleDelete = (): void => {
    const targetObj = canvas?.getActiveObject()
    if (!targetObj) {
      alert('삭제할 대상을 선택해주세요.')
      return
    }
    canvas?.remove(targetObj)
  }

  return [
    canvas,
    createFigure,
    handleRedo,
    handleUndo,
    handleClear,
    handleCopy,
    handleDelete,
  ]
}
