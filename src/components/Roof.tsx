import { fabric } from 'fabric'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function Roof() {
  const [canvas, setCanvas] = useState<fabric.Canvas>()
  const [isLocked, setIsLocked] = useState(false)
  const [history, setHistory] = useState<fabric.Object[] | undefined>([])

  useEffect(() => {
    const c = new fabric.Canvas('canvas', {
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

  const addRect = (canvas?: fabric.Canvas) => {
    const rect = new fabric.Rect({
      height: 200,
      width: 200,
      top: 10,
      left: 10,
      stroke: randomColor(),
      fill: 'white',
      name: uuidv4(),
    })

    createFigure(rect)
  }

  const addHorizontalLine = (canvas?: fabric.Canvas) => {
    /**
     * 시작X,시작Y,도착X,도착Y 좌표
     */
    const horizontalLine = new fabric.Line([20, 20, 100, 20], {
      name: uuidv4(),
      stroke: randomColor(),
      strokeWidth: 3,
      selectable: true,
    })

    createFigure(horizontalLine)
  }

  const addVerticalLine = (canvas?: fabric.Canvas) => {
    const verticalLine = new fabric.Line([10, 10, 10, 100], {
      name: uuidv4(),
      stroke: randomColor(),
      strokeWidth: 3,
      selectable: true,
    })

    createFigure(verticalLine)
  }

  const addTriangle = (canvas?: fabric.Canvas) => {
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

  const createFigure = (figure: any) => {
    canvas?.add(figure)
    canvas?.requestRenderAll()
  }

  const handleClear = (canvas?: fabric.Canvas) => {
    canvas?.clear()
  }

  const handleCopyFigure = (canvas?: fabric.Canvas) => {
    const targetObj = canvas?.getActiveObject()
    if (!targetObj) {
      alert('복사할 대상을 선택해주세요.')
      return
    }

    targetObj.clone((cloned: fabric.Object) => {
      cloned.left! += 10
      cloned.top! += 10
      canvas?.add(cloned)
    })
  }

  const handleDelete = (canvas?: fabric.Canvas) => {
    const targetObj = canvas?.getActiveObject()
    if (!targetObj) {
      alert('삭제할 대상을 선택해주세요.')
      return
    }
    canvas?.remove(targetObj)
  }

  const handleSave = (canvas?: fabric.Canvas) => {
    const objects = canvas?.getObjects()

    if (objects?.length === 0) {
      alert('저장할 대상이 없습니다.')
      return
    }
    const jsonStr = JSON.stringify(canvas)
    localStorage.setItem('canvas', jsonStr)
    canvas?.clear()
  }

  const handlePaste = (canvas?: fabric.Canvas) => {
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

  const randomColor = () => {
    return '#' + Math.round(Math.random() * 0xffffff).toString(16)
  }

  const handleUndo = () => {
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

  const handleRedo = () => {
    if (canvas && history) {
      if (history.length > 0) {
        setIsLocked(true)
        canvas.add(history[history.length - 1])
        const newHistory = history.slice(0, -1)
        setHistory(newHistory)
      }
    }
  }

  const onChange = () => {
    if (!isLocked) {
      setHistory([])
    }
    setIsLocked(false)
  }

  useEffect(() => {
    if (!canvas) {
      return
    }

    canvas.on('object:added', onChange)
    canvas.on('object:modified', onChange)
    canvas.on('object:removed', onChange)
  }, [canvas])

  return (
    <>
      <div className="flex justify-center my-8">
        <button
          className="w-30 mx-2 p-2 rounded bg-blue-500 text-white"
          onClick={() => addRect(canvas)}
        >
          ADD RECTANGLE
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-blue-500 text-white"
          onClick={() => {
            addHorizontalLine(canvas)
          }}
        >
          ADD HORIZONTAL LINE
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-blue-500 text-white"
          onClick={() => {
            addVerticalLine(canvas)
          }}
        >
          ADD VERTICALITY LINE
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-blue-500 text-white"
          onClick={() => {
            addTriangle(canvas)
          }}
        >
          ADD TRIANGLE
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-black text-white"
          onClick={() => {
            handleCopyFigure(canvas)
          }}
        >
          COPY FIGURE
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-red-500 text-white"
          onClick={() => {
            handleDelete(canvas)
          }}
        >
          DELETE
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-red-500 text-white"
          onClick={() => {
            handleClear(canvas)
          }}
        >
          CLEAR
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-green-500 text-white"
          onClick={() => {
            handleUndo()
          }}
        >
          UNDO
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-green-300 text-white"
          onClick={() => {
            handleRedo()
          }}
        >
          REDO
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-black text-white"
          onClick={() => {
            handleSave(canvas)
          }}
        >
          저장
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-black text-white"
          onClick={() => {
            handlePaste(canvas)
          }}
        >
          붙여넣기
        </button>
      </div>
      <div
        className="flex justify-center"
        style={{ border: '1px solid', width: 800, height: 800, margin: 'auto' }}
      >
        <canvas id="canvas" />
      </div>
    </>
  )
}
