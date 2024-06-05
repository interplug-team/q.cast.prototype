import { fabric } from 'fabric'
import { useEffect, useState } from 'react'

export default function Roof() {
  const [canvas, setCanvas] = useState<fabric.Canvas>()

  useEffect(() => {
    const c = new fabric.Canvas('canvas', {
      height: 800,
      width: 800,
      backgroundColor: 'black',
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
      stroke: '#2BEBC8',
    })
    canvas?.add(rect)
    canvas?.requestRenderAll()
  }

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
          onClick={() => {}}
        >
          ADD HORIZONTAL LINE
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-blue-500 text-white"
          onClick={() => {}}
        >
          ADD VERTICALITY LINE
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-red-500 text-white"
          onClick={() => {}}
        >
          CLEAR
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-green-500 text-white"
          onClick={() => {}}
        >
          UNDO
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-green-300 text-white"
          onClick={() => {}}
        >
          REDO
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-black text-white"
          onClick={() => {}}
        >
          저장
        </button>
        <button
          className="w-30 mx-2 p-2 rounded bg-black text-white"
          onClick={() => {}}
        >
          붙여넣기
        </button>
      </div>
      <div className="flex justify-center">
        <canvas id="canvas" />
      </div>
    </>
  )
}
