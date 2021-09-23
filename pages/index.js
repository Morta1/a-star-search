import styled from "styled-components";
import { useEffect, useState } from "react";

class Node {
  gCost = 0;
  hCost = 0;
  parent;
  neighbours;

  constructor(_walkable, _position) {
    this.walkable = _walkable;
    this.position = _position;
  }

  fCost = () => {
    return this.gCost + this.hCost;
  };
}

const getRandomArbitrary = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

const Home = () => {
  const [grid, setGrid] = useState([]);
  const [gridSize] = useState({ x: 70, y: 30 });
  const [startPos, setStartPos] = useState();
  const [targetPos, setTargetPos] = useState();
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (grid.length === 0) {
      const sPos = {
        x: getRandomArbitrary(0, gridSize.x - 1),
        y: getRandomArbitrary(0, gridSize.y - 1),
      };
      const tPos = {
        x: getRandomArbitrary(0, gridSize.x - 1),
        y: getRandomArbitrary(0, gridSize.y - 1),
      };
      let tempGrid = [];
      for (let i = 0; i < gridSize.x; i++) {
        tempGrid[i] = [];
        for (let j = 0; j < gridSize.y; j++) {
          let isWalkable = Math.random() < 0.45;
          if (
            isSamePosition({ x: i, y: j }, sPos) ||
            isSamePosition({ x: i, y: j }, tPos)
          ) {
            isWalkable = true;
          }
          tempGrid[i][j] = new Node(isWalkable, { x: i, y: j });
        }
      }
      console.log(sPos);
      setStartPos(sPos);
      setTargetPos(tPos);
      setGrid(tempGrid);
    }
  }, [grid, gridSize.x, gridSize.y]);

  const visualizePath = () => {
    const path = findPath(startPos, targetPos);
    if (!path) {
      console.log("cant find path");
      return;
    }
    for (let i = 0; i < path.length - 1; i++) {
      setTimeout(() => {
        const tempGrid = [...grid];
        const node = path[i];
        tempGrid[node.position.x][node.position.y] = {
          ...tempGrid[node.position.x][node.position.y],
          walkedOn: true,
        };
        for (let j = 0; j < node?.neighbours?.length; j++) {
          const neighbour = node.neighbours[j];
          tempGrid[neighbour.position.x][neighbour.position.y] = {
            ...tempGrid[neighbour.position.x][neighbour.position.y],
            neighbour: true,
          };
        }
        console.log(tempGrid);
        setGrid(tempGrid);
      }, 20 * i);
    }
  };

  const isSamePosition = (nodeA, nodeB) => {
    return nodeA.x === nodeB.x && nodeA.y === nodeB.y;
  };

  const getNeighbours = (node) => {
    let neighbours = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (x === 0 && y === 0) {
          continue;
        }
        const checkX = node.position.x + x;
        const checkY = node.position.y + y;

        if (
          checkX >= 0 &&
          checkX < gridSize.x &&
          checkY >= 0 &&
          checkY < gridSize.y
        ) {
          neighbours = [...neighbours, grid[checkX][checkY]];
        }
      }
    }
    return neighbours;
  };

  const getDistance = (nodeA, nodeB) => {
    const distanceX = Math.abs(nodeA.position.x - nodeB.position.x);
    const distanceY = Math.abs(nodeA.position.y - nodeB.position.y);
    if (distanceX > distanceY) {
      return 14 * distanceY + 10 * (distanceX - distanceY);
    }
    return 14 * distanceX + 10 * (distanceY - distanceX);
  };

  const retracePath = (startNode, endNode) => {
    let path = [];
    let currentNode = endNode;
    while (
      startNode?.parent?.position.x !== currentNode?.parent?.position.x &&
      startNode?.parent?.position.y !== currentNode?.parent?.position.y
      ) {
      path = [...path, currentNode];
      currentNode = currentNode.parent;
    }

    return path.reverse();
  };

  const findNode = (arr, node) => {
    return arr?.find(
      (item) =>
        node?.position.x === item.position.x &&
        node?.position.y === item.position.y
    );
  };

  const findPath = (startPos, targetPos) => {
    const startNode = grid[startPos.x][startPos.y];
    const targetNode = grid[targetPos.x][targetPos.y];

    let openSet = [];
    let closedSet = [];

    openSet = [...openSet, startNode];

    while (openSet.length > 0) {
      let currentNode = openSet[0];
      for (let i = 1; i < openSet.length; i++) {
        if (
          openSet[i].fCost() < currentNode.fCost() ||
          (openSet[i].fCost() === currentNode.fCost() &&
            openSet[i].hCost < currentNode.hCost)
        ) {
          currentNode = openSet[i];
        }
      }

      for (let i = 0; i < openSet.length; i++) {
        const node = openSet[i];
        if (
          node.position.x === currentNode.position.x &&
          node.position.y === currentNode.position.y
        ) {
          openSet.splice(i, 1);
          break;
        }
      }

      closedSet = [...closedSet, currentNode];

      if (
        currentNode.position.x === targetNode.position.x &&
        currentNode.position.y === targetNode.position.y
      ) {
        return retracePath(startNode, targetNode);
      }

      const neighbours = getNeighbours(currentNode);
      currentNode.neighbours = neighbours;
      for (let i = 0; i < neighbours.length; i++) {
        const neighbour = neighbours[i];
        if (!neighbour.walkable || findNode(closedSet, neighbour)) {
          continue;
        }

        const newMovementCostToNeighbour =
          currentNode.gCost + getDistance(currentNode, neighbour);
        if (
          newMovementCostToNeighbour < neighbour.gCost ||
          !findNode(openSet, neighbour)
        ) {
          neighbour.gCost = newMovementCostToNeighbour;
          neighbour.hCost = getDistance(neighbour, targetNode);
          neighbour.parent = currentNode;
          if (!findNode(openSet, neighbour)) {
            openSet = [...openSet, neighbour];
          }
        }
      }
    }
  };

  const onNodeClick = (x, y) => {
    const tempGrid = [...grid];
    if (
      (startPos.x !== x && targetPos.x !== x) ||
      (startPos.y !== y && targetPos.y !== y)
    ) {
      setIsClicked(true);
      tempGrid[x][y] = {
        ...tempGrid[x][y],
        walkable: !tempGrid[x][y].walkable,
      };
      setGrid(tempGrid);
    }
  };

  return (
    <Wrapper>
      <h2>A* search</h2>
      <div className={"legend"}>
        <div className='node start-node'/>
        <span className={"title"}>Starting Node</span>
        <div className='node target-node'/>
        <span className={"title"}>Target Node</span>
        <div className='node neighbour-node'/>
        <span className={"title"}>Neighbour Node</span>
        <div className='node walked-on-node'/>
        <span className={"title"}>Walked On Node</span>
      </div>
      <div className='grid'>
        {grid?.map((rowArray, rowIndex) => {
          return (
            <div key={`row-${rowIndex}`}>
              {rowArray?.map((node, columnIndex) => {
                return (
                  <div onMouseUp={() => setIsClicked(false)}
                       onMouseDown={() => onNodeClick(rowIndex, columnIndex)}
                       onMouseEnter={() => {
                         if (isClicked) {
                           setTimeout(() => {
                             onNodeClick(rowIndex, columnIndex);
                           });
                         }
                       }}
                       className={`node${
                         rowIndex === startPos?.x && columnIndex === startPos?.y
                           ? " start-node"
                           : ""
                       }${
                         rowIndex === targetPos?.x && columnIndex === targetPos?.y
                           ? " target-node"
                           : ""
                       }${
                         node.neighbour &&
                         !node.walkedOn &&
                         !isSamePosition(
                           { x: rowIndex, y: columnIndex },
                           startPos
                         ) &&
                         !isSamePosition(
                           { x: rowIndex, y: columnIndex },
                           targetPos
                         )
                           ? " neighbour-node"
                           : ""
                       }${!node.walkable ? " unwalkable" : ""}
                    ${node.walkedOn ? " walked-on-node" : ""}
                    `}
                       key={`column-${columnIndex}`}/>
                );
              })}
            </div>
          );
        })}
      </div>

      <button onClick={visualizePath}>Start Search</button>
      <button onClick={() => setGrid([])}>Regenerate Grid</button>
    </Wrapper>
  );
};

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
    width: 20px;
    height: 20px;
    border: 1px solid black;
    /* margin: 0 -1px -1px 0; */
    user-select: none;
  }

  .start-node {
    background-color: cornflowerblue;
  }

  .target-node {
    background-color: #17ad17;
  }

  .walked-on-node {
    background-color: yellow;
  }

  .neighbour-node {
    background-color: #a93030;
  }

  .closed-node {
    background-color: #a81e1e;
  }

  .unwalkable {
    background-color: black;
  }

  button {
    margin: 15px 0;
  }
`;

export default Home;
