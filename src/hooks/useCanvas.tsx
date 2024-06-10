import { useEffect, useState } from 'react'
import { fabric } from 'fabric'
import { v4 as uuidv4 } from 'uuid'

const CANVAS = {
  WIDTH: 1000,
  HEIGHT: 1000,
}

export function useCanvas(id: string) {
  const [canvas, setCanvas] = useState<fabric.Canvas | undefined>()
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [history, setHistory] = useState<fabric.Object[] | undefined>([])

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

  const handleRotate = () => {
    const target = canvas?.getActiveObject()

    if (!target) {
      return
    }

    const currentAngle = target.angle

    target.set({ angle: currentAngle! + 45 })
    canvas?.renderAll()
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
  } as const
}
