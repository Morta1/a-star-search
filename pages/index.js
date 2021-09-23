import styled from 'styled-components';
import { useEffect, useState } from "react";

class Node {
  gCost = 0;
  hCost = 0;
  parent;

  constructor(_walkable, _position) {
    this.walkable = _walkable;
    this.position = _position;
  }

  fCost = () => {
    return this.gCost + this.hCost;
  }
}

const Home = () => {
  const [gridSize] = useState({ x: 15, y: 15 });
  const [grid, setGrid] = useState();
  const [startPos] = useState({ x: 5, y: 14 });
  const [targetPos] = useState({ x: 0, y: 0 });
  const [neighbours, setNeighbours] = useState();

  useEffect(() => {
    let tempGrid = [];
    for (let i = 0; i < gridSize.x; i++) {
      tempGrid[i] = [];
      for (let j = 0; j < gridSize.y; j++) {
        tempGrid[i][j] = new Node(true, { x: i, y: j });
      }
    }
    setGrid(tempGrid);
  }, [gridSize.x, gridSize.y]);


  const getNeighbours = (gridSize, grid, node) => {
    let neighbours = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (x === 0 && y === 0) {
          continue;
        }
        const checkX = node.position.x + x;
        const checkY = node.position.y + y;

        if (checkX >= 0 && checkX < gridSize.x && checkY >= 0 && checkY < gridSize.y) {
          neighbours = [...neighbours, grid[checkX][checkY]];
        }
      }
    }
    return neighbours;
  }

  const getDistance = (nodeA, nodeB) => {
    const distanceX = Math.abs(nodeA.position.x - nodeB.position.x);
    const distanceY = Math.abs(nodeA.position.y - nodeB.position.y);
    if (distanceX > distanceY) {
      return 14 * distanceY + 10 * (distanceX - distanceY);
    }
    return 14 * distanceX + 10 * (distanceY - distanceX);
  }

  const retracePath = (startNode, endNode) => {
    let path = [];
    let currentNode = endNode;

    while (startNode.position.x === currentNode.position.x && startNode.position.y === currentNode.position.y) {
      path = [...path, currentNode];
      currentNode = currentNode.parent;
    }

    return path.reverse();
  }

  const findNode = (arr, node) => {
    return arr?.find((item) => node?.position.x === item.position.x && node?.position.y === item.position.y)
  }

  const findPath = (gridSize, grid, startPos, targetPos) => {
    const startNode = grid[startPos.x][startPos.y];
    const targetNode = grid[targetPos.x][targetPos.y];

    let openSet = [];
    let closedSet = [];

    openSet = [...openSet, startNode];

    while (openSet.length > 0) {
      let currentNode = openSet[0];
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].fCost() < currentNode.fCost() || openSet[i].fCost() === currentNode.fCost() && openSet[i].hCost < currentNode.hCost) {
          currentNode = openSet[i];
        }
      }

      for (let i = 0; i < openSet.length; i++) {
        const node = openSet[i];
        if (node.position.x === currentNode.position.x && node.position.y === currentNode.position.y) {
          openSet.splice(i, 1);
          break;
        }
      }

      closedSet = [...closedSet, currentNode];

      if (currentNode.position.x === targetNode.position.x && currentNode.position.y === targetNode.position.y) {
        return retracePath(startNode, targetNode);
      }

      const neighbours = getNeighbours(gridSize, grid, currentNode);
      setNeighbours(neighbours);
      for (let i = 0; i < neighbours.length; i++) {
        const neighbour = neighbours[i];
        if (!neighbour.walkable || findNode(closedSet, neighbour)) {
          continue;
        }

        const newMovementCostToNeighbour = currentNode.gCost + getDistance(currentNode, neighbour);
        if (newMovementCostToNeighbour < neighbour.gCost || !findNode(openSet, neighbour)) {
          neighbour.gCost = newMovementCostToNeighbour;
          neighbour.hCost = getDistance(neighbour, targetNode);
          neighbour.parent = currentNode
          if (!findNode(openSet, neighbour)) {
            openSet = [...openSet, neighbour];
          }
        }
      }
    }
  }

  return <Wrapper>
    <h2>A* search</h2>
    <div className={'legend'}>
      <div className="node start-node"/>
      <span className={'title'}>Starting Node</span>
      <div className="node target-node"/>
      <span className={'title'}>Target Node</span>
    </div>
    <div className="grid">
      {grid?.map((rowArray, rowIndex) => {
        return <div key={`row-${rowIndex}`}>
          {rowArray?.map((node, columnIndex) => {
            return <div
              className={`node${rowIndex === startPos?.x && columnIndex === startPos?.y ? ' start-node' : ''}${rowIndex === targetPos?.x && columnIndex === targetPos?.y ? ' target-node' : ''}`}
              key={`column-${columnIndex}`}>
              {rowIndex},{columnIndex}
            </div>
          })}
        </div>
      })}
    </div>

    <button onClick={() => {
      const path = findPath(gridSize, grid, startPos, targetPos);
      for (let i = 0; i < path.length; i++) {
        const node = path[i];
        console.log('Node Path: ', node.position)
      }
    }}>Start Search
    </button>
  </Wrapper>
}

const Wrapper = styled.div`
  text-align: center;

  .grid {
    display: flex;
    justify-content: center;
  }

  .legend {
    display: flex;
    justify-content: center;
    margin: 15px 0;

    .title {
      margin: 0 10px;
    }
  }

  .node {
    width: 50px;
    height: 50px;
    border: 1px solid black;
    margin: 0 -1px -1px 0;
  }

  .start-node {
    background-color: cornflowerblue;
  }

  .target-node {
    background-color: #17ad17;
  }

  .neighbour-node {
    background-color: forestgreen;
  }

  .closed-node {
    background-color: #a81e1e;
  }

  button {
    margin: 15px 0;
  }

`;

export default Home;