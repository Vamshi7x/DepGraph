import { useRef, useEffect, useCallback, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const NODE_COLORS = {
  root: '#6366F1',
  direct: '#818CF8',
  transitive: '#C7D2FE',
  vulnerable: '#EF4444',
  affected: '#F59E0B',
  default: '#D1D5DB',
};

const NODE_SIZES = {
  root: 8,
  vulnerable: 8,
  direct: 6,
  affected: 5,
  transitive: 4,
  default: 4,
};

export default function GraphCanvas({ 
  graphData, 
  onNodeClick, 
  highlightNodes = new Set(),
  legendItems = [],
  width,
  height,
}) {
  const graphRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    function updateDimensions() {
      if (containerRef.current) {
        setDimensions({
          width: width || containerRef.current.offsetWidth,
          height: height || containerRef.current.offsetHeight || 500,
        });
      }
    }

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [width, height]);

  // Center graph after data loads
  useEffect(() => {
    if (graphRef.current && graphData?.nodes?.length) {
      setTimeout(() => {
        graphRef.current.zoomToFit(400, 60);
      }, 500);
    }
  }, [graphData]);

  const paintNode = useCallback((node, ctx, globalScale) => {
    const group = node.group || 'default';
    const size = NODE_SIZES[group] || NODE_SIZES.default;
    const color = NODE_COLORS[group] || NODE_COLORS.default;
    const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(node.id);
    const alpha = isHighlighted ? 1 : 0.2;

    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fill();

    // Glow for root/vulnerable
    if ((group === 'root' || group === 'vulnerable') && isHighlighted) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.15;
      ctx.fill();
    }

    // Label
    const label = node.id || '';
    const fontSize = Math.max(10 / globalScale, 3);
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#2B2E33';
    ctx.globalAlpha = alpha;
    ctx.fillText(label, node.x, node.y + size + 2);

    ctx.globalAlpha = 1;
  }, [highlightNodes]);

  const paintLink = useCallback((link, ctx) => {
    const isHighlighted = highlightNodes.size === 0 || 
      (highlightNodes.has(link.source.id || link.source) && 
       highlightNodes.has(link.target.id || link.target));

    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    ctx.strokeStyle = isHighlighted ? '#6366F1' : '#E5E7EB';
    ctx.globalAlpha = isHighlighted ? 0.6 : 0.1;
    ctx.lineWidth = isHighlighted ? 1.5 : 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, [highlightNodes]);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="graph-container" ref={containerRef}>
        <div className="empty-state">
          <div className="empty-state-icon">🕸️</div>
          <div className="empty-state-title">No graph data</div>
          <div className="empty-state-desc">Select a package to visualize its dependency graph</div>
        </div>
      </div>
    );
  }

  return (
    <div className="graph-container" ref={containerRef}>
      {legendItems.length > 0 && (
        <div className="graph-legend">
          {legendItems.map((item, i) => (
            <div key={i} className="graph-legend-item">
              <span className="graph-legend-dot" style={{ backgroundColor: item.color }}></span>
              {item.label}
            </div>
          ))}
        </div>
      )}
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeCanvasObject={paintNode}
        linkCanvasObject={paintLink}
        onNodeClick={(node) => onNodeClick && onNodeClick(node)}
        nodeLabel={(node) => `${node.id}${node.group ? ` (${node.group})` : ''}`}
        cooldownTicks={100}
        d3AlphaDecay={0.04}
        d3VelocityDecay={0.3}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
    </div>
  );
}
