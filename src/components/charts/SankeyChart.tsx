import { Paper, Text, Box, Stack } from '@mantine/core';
import type { SankeyData, SankeyNode, SankeyLink } from '@/core/types';
import { formatCurrencyCompact } from '@/utils/currency';

interface SankeyChartProps {
  data: SankeyData;
  height?: number;
}

interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

function calculateNodePositions(
  nodes: readonly SankeyNode[],
  _links: readonly SankeyLink[],
  chartWidth: number,
  chartHeight: number
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();

  const categories = ['income', 'expense', 'savings'] as const;

  const categoryXPositions: Record<string, number> = {
    income: chartWidth * 0.1,
    expense: chartWidth * 0.5,
    savings: chartWidth * 0.9,
  };

  const categoryNodes: Record<string, SankeyNode[]> = {
    income: [],
    expense: [],
    savings: [],
  };

  for (const node of nodes) {
    if (node.category in categoryNodes) {
      categoryNodes[node.category].push(node);
    }
  }

  for (const category of categories) {
    const categoryNodesList = categoryNodes[category];
    const totalValue = categoryNodesList.reduce((sum, n) => sum + n.value, 0);
    const availableHeight = chartHeight * 0.8;
    const startY = chartHeight * 0.1;

    let currentY = startY;

    for (const node of categoryNodesList) {
      const nodeHeight =
        totalValue > 0 ? (node.value / totalValue) * availableHeight : 10;

      positions.set(node.id, {
        x: categoryXPositions[category],
        y: currentY,
        width: 20,
        height: Math.max(nodeHeight, 5),
      });

      currentY += nodeHeight + 10;
    }
  }

  return positions;
}

function generateLinkPaths(
  links: readonly SankeyLink[],
  nodePositions: Map<string, NodePosition>
): string[] {
  const paths: string[] = [];

  for (const link of links) {
    const sourcePos = nodePositions.get(link.source);
    const targetPos = nodePositions.get(link.target);

    if (!sourcePos || !targetPos) {
      continue;
    }

    const sourceX = sourcePos.x + sourcePos.width;
    const sourceY = sourcePos.y + sourcePos.height / 2;
    const targetX = targetPos.x;
    const targetY = targetPos.y + targetPos.height / 2;

    const midX = (sourceX + targetX) / 2;

    const path = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;

    paths.push(path);
  }

  return paths;
}

export function SankeyChart({ data, height = 400 }: SankeyChartProps) {
  const chartWidth = 800;
  const chartHeight = height;

  const nodePositions = calculateNodePositions(
    data.nodes,
    data.links,
    chartWidth,
    chartHeight
  );
  const linkPaths = generateLinkPaths(data.links, nodePositions);

  if (!data || data.nodes.length === 0) {
    return (
      <Paper p="xl" ta="center" withBorder>
        <Text c="dimmed">
          Enter your financial details to see cash flow analysis
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder radius="md">
      <Stack>
        <Text size="lg" fw={600}>
          Cash Flow Sankey Diagram
        </Text>
        <Box style={{ overflowX: 'auto' }}>
          <svg
            width={chartWidth}
            height={chartHeight}
            style={{ minWidth: chartWidth }}
          >
            {linkPaths.map((path, index) => (
              <path
                key={`link-${index}`}
                d={path}
                fill="none"
                stroke="#adb5bd"
                strokeWidth={2}
                opacity={0.5}
              />
            ))}

            {data.nodes.map((node) => {
              const pos = nodePositions.get(node.id);
              if (!pos) return null;

              return (
                <g key={node.id}>
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={pos.width}
                    height={pos.height}
                    fill={node.color ?? '#6c757d'}
                    opacity={0.8}
                    rx={2}
                  />
                  <text
                    x={pos.x + pos.width + 10}
                    y={pos.y + pos.height / 2}
                    fontSize="12"
                    fill="#495057"
                    dominantBaseline="middle"
                  >
                    {node.name} ({formatCurrencyCompact(node.value)})
                  </text>
                </g>
              );
            })}
          </svg>
        </Box>
        <Text size="xs" c="dimmed" ta="center">
          Year {data.year}
        </Text>
      </Stack>
    </Paper>
  );
}
