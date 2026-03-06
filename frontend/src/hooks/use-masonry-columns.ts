import React from 'react'
import { getColumnsForWidth } from '../helpers/masonry'

type MasonryColumnsState = {
  columns: number
  containerWidth: number
}

const useMasonryColumns = (
  containerRef: React.RefObject<HTMLDivElement | null>
) => {
  const [state, setState] = React.useState<MasonryColumnsState>({
    columns: 1,
    containerWidth: 0
  })

  React.useEffect(() => {
    const element = containerRef.current

    if (!element) {
      return () => {}
    }

    const handleResize = (width: number) => {
      setState((prev) => {
        const newColumns = getColumnsForWidth(width)

        if (prev.columns === newColumns && prev.containerWidth === width) {
          return prev
        }

        return { columns: newColumns, containerWidth: width }
      })
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]

      if (entry) {
        handleResize(entry.contentRect.width)
      }
    })

    observer.observe(element)

    handleResize(element.clientWidth)

    return () => {
      observer.disconnect()
    }
  }, [containerRef])

  return state
}

export { useMasonryColumns }
