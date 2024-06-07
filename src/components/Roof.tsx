import { useCanvas } from '@/hooks/useCanvas'
import { fabric } from 'fabric'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function Roof() {
  const [
    canvas,
    createFigure,
    handleUndo,
    handleRedo,
    handleClear,
    handleCopy,
    handleDelete,
    handleSave,
    handlePaste,
  ] = useCanvas('canvas')

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

  const randomColor = () => {
    return '#' + Math.round(Math.random() * 0xffffff).toString(16)
  }

  return (
    <>
      <div className="flex justify-center my-8">
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
      </div>
      <div
        className="flex justify-center"
        style={{
          border: '1px solid',
          width: 800,
          height: 800,
          margin: 'auto',
        }}
      >
        <canvas id="canvas" />
      </div>
    </>
  )
}
