'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  chart: string
  id?: string
}

export function MermaidDiagram({ chart, id }: MermaidDiagramProps) {
  const diagramRef = useRef<HTMLDivElement>(null)
  const renderedRef = useRef(false)

  useEffect(() => {
    if (!diagramRef.current || renderedRef.current) return

    const diagramId = id || `mermaid-${Math.random().toString(36).substr(2, 9)}`
    
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#fff',
        primaryBorderColor: '#2563eb',
        lineColor: '#64748b',
        secondaryColor: '#e0e7ff',
        tertiaryColor: '#c7d2fe',
        background: '#ffffff',
        mainBkg: '#ffffff',
        secondBkg: '#f8fafc',
        textColor: '#1e293b',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px'
      }
    })

    const renderDiagram = async () => {
      try {
        if (diagramRef.current) {
          const container = diagramRef.current.querySelector('.mermaid-container')
          if (container) {
            container.innerHTML = ''
            const { svg } = await mermaid.render(diagramId, chart)
            container.innerHTML = svg
            const svgElement = container.querySelector('svg')
            if (svgElement) {
              svgElement.style.maxWidth = '100%'
              svgElement.style.height = 'auto'
              svgElement.style.display = 'block'
              svgElement.style.margin = '0 auto'
            }
            renderedRef.current = true
          }
        }
      } catch (error) {
        const container = diagramRef.current?.querySelector('.mermaid-container')
        if (container) {
          container.innerHTML = `<div class="text-red-500 p-4 text-sm">Error rendering diagram. Please check the diagram syntax.</div>`
        }
      }
    }

    renderDiagram()
  }, [chart, id])

  return (
    <div className="w-full border rounded-lg overflow-auto bg-background p-4">
      <div
        ref={diagramRef}
        className="w-full flex items-center justify-center"
      >
        <div className="mermaid-container w-full" />
      </div>
    </div>
  )
}
