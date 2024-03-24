import React, { Component } from "react";
import { List } from "immutable";
import {
  getNumberOfGroupsAssignedForNumber,
  updateBoardWithNumber,
  getClickHandler,
  makeBoard,
  makePuzzle,
  pluck,
  isPeer as areCoordinatePeers,
  range,
} from "./gameUtils";
import { Cell } from "./cell";
import SudokuBoard from "./sudokuBoard";
import Numbers from "./numbers";

export class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      board: null,
      selectedCell: null,
      history: List(),
    };
  }

  componentDidMount() {
    try {
      const generatedBoard = this.generateGame();
      this.setState({ board: generatedBoard });
    } catch (error) {
      console.error("Error generating game board:", error);
    }
  }

  generateGame = (finalCount = 20) => {
    const solution = makePuzzle();
    const { puzzle } = pluck(solution, finalCount);
    const board = makeBoard({ puzzle });
    this.setState({ board, solution });
    return board;
  };

  selectCell = (x, y) => {
    this.setState((prevState) => {
      let { board } = prevState;
      const selectedCell = board.getIn(["puzzle", x, y]);
      if (selectedCell) {
        console.log("Selected Cell Content:", selectedCell.toJS());
        const selected = { x, y };
        board = board.set("selected", selected);
        console.log("Updated Board:", board.toJS());
        return { board };
      } else {
        console.error("Cell not found at coordinates (", x, ",", y, ")");
        return null;
      }
    });
  };

  getNumberValueCount(number) {
    const rows = this.state.board.getIn(["choices", "rows"]);
    const columns = this.state.board.getIn(["choices", "columns"]);
    const squares = this.state.board.getIn(["choices", "squares"]);
    return Math.min(
      getNumberOfGroupsAssignedForNumber(number, squares),
      Math.min(
        getNumberOfGroupsAssignedForNumber(number, rows),
        getNumberOfGroupsAssignedForNumber(number, columns),
      ),
    );
  }

  fillNumber = (number) => {
    let { board } = this.state;
    const selectedCell = this.getSelectedCell();
    if (!selectedCell) return;
    const prefilled = selectedCell.get("prefilled");
    if (prefilled) return;
    const { x, y } = board.get("selected");
    const currentValue = selectedCell.get("value");
    if (currentValue) {
      board = updateBoardWithNumber({
        x,
        y,
        number: currentValue,
        fill: false,
        board: this.state.board,
      });
    }
    const setNumber = currentValue !== number && number;
    if (setNumber) {
      board = updateBoardWithNumber({
        x,
        y,
        number,
        fill: true,
        board,
      });
    }
    this.updateBoard(board);
  };

  canUndo = () => this.state.historyOffSet > 0;

  redo = () => {
    const { history } = this.state;
    let { historyOffSet } = this.state;
    if (history.size) {
      historyOffSet = Math.min(history.size - 1, historyOffSet + 1);
      const board = history.get(historyOffSet);
      this.setState({ board, historyOffSet });
    }
  };

  undo = () => {
    const { history } = this.state;
    let { historyOffSet, board } = this.state;
    if (history.size) {
      historyOffSet = Math.max(0, historyOffSet - 1);
      board = history.get(historyOffSet);
      this.setState({ board, historyOffSet, history });
    }
  };

  eraseSelected = () => {
    const selectedCell = this.getSelectedCell();
    if (!selectedCell) return;
    this.fillNumber(false);
  };

  fillSelectedWithSolution = () => {
    const { board, solution } = this.state;
    const selectedCell = this.getSelectedCell();
    if (!selectedCell) return;
    const { x, y } = board.get("selected");
    this.fillNumber(solution[x][y]);
  };

  getSelectedCell() {
    const { board } = this.state;
    const selected = board.get("selected");
    if (!selected) {
      return null;
    }
    const { x, y } = selected;
    const selectedCell = board.get("puzzle").getIn([x, y]);
    return selectedCell;
  }

  updateBoard = (newBoard) => {
    const { history } = this.state;
    let updatedHistory = history || List();
    const { historyOffSet } = this.state;
    updatedHistory = updatedHistory.slice(0, historyOffSet + 1);
    updatedHistory = updatedHistory.push(newBoard);
    this.setState({
      board: newBoard,
      history: updatedHistory,
      historyOffSet: updatedHistory.size - 1,
    });
  };

  isConflict(i, j) {
    const { value } = this.state.board.getIn(["puzzle", i, j]).toJSON();
    if (!value) return false;
    const rowConflict =
      this.state.board.getIn(["choices", "rows", i, value]) > 1;
    const columnConflict =
      this.state.board.getIn(["choices", "columns", j, value]) > 1;
    const squareConflict =
      this.state.board.getIn([
        "choices",
        "squares",
        Math.floor(i / 3) * 3 + Math.floor(j / 3),
        value,
      ]) > 1;
    return rowConflict || columnConflict || squareConflict;
  }

  renderCell = (cell, x, y) => {
    const { board } = this.state;
    const selected = this.getSelectedCell();
    const { value, prefilled, notes } = cell.toJSON();
    const conflict = this.isConflict(x, y);
    const peer = areCoordinatePeers({ x, y }, board.get("selected"));
    const sameValue = !!(
      selected &&
      selected.get("value") &&
      value === selected.get("value")
    );

    const isSelected = cell === selected;
    console.log("isSelected:", isSelected);
    console.log("peer:", peer);

    return (
      <Cell
        prefilled={prefilled}
        notes={notes}
        sameValue={sameValue}
        isSelected={isSelected}
        isPeer={peer}
        value={value}
        onClick={() => {
          this.selectCell(x, y);
        }}
        key={y}
        x={x}
        y={y}
        conflict={conflict}
      />
    );
  };

  renderPuzzle = () => {
    const { board } = this.state;
    return (
      <div className="puzzle">
        {board.get("puzzle").map((row, i) => (
          <div key={i} className="row">
            {row.map((cell, j) => this.renderCell(cell, i, j)).toArray()}
          </div>
        ))}
      </div>
    );
  };

  renderNumbers() {
    const selectedCell = this.getSelectedCell();
    const prefilled = selectedCell && selectedCell.get("prefilled");
    return (
      <div className="control">
        {range(9).map((i) => {
          const number = i + 1;
          const clickHandle = getClickHandler(
            () => {
              this.fillNumber(number);
            },
            () => {
              this.addNumberAsNote(number);
            },
          );
          return (
            <Numbers
              key={number}
              number={number}
              onClick={!prefilled ? clickHandle : undefined}
              completionPercentage={this.getNumberValueCount(number) / 9}
            />
          );
        })}
      </div>
    );
  }

  renderActions() {
    const { history } = this.state;
    const selectedCell = this.getSelectedCell();
    const prefilled = selectedCell && selectedCell.get("prefilled");
    return (
      <div className="actions-container">
        <div className="actions">
          <div
            className="action"
            onClick={
              history.size
                ? () => {
                    console.log("Undo clicked");
                    this.undo();
                  }
                : null
            }
          >
            <span class="material-symbols-outlined">undo</span>
            Undo
          </div>
          <div
            className="action redo"
            onClick={
              history.size
                ? () => {
                    console.log("Redo clicked");
                    this.redo();
                  }
                : null
            }
          >
            <span class="material-symbols-outlined">redo</span>
            Redo
          </div>
          <div
            className="action"
            onClick={
              !prefilled
                ? () => {
                    console.log("Erase clicked");
                    this.eraseSelected();
                  }
                : null
            }
          >
            <span class="material-symbols-outlined">ink_eraser</span>
            Erase
          </div>
          <div
            className="action"
            onClick={
              !prefilled
                ? () => {
                    console.log("Hint clicked");
                    this.fillSelectedWithSolution();
                  }
                : null
            }
          >
            <span class="material-symbols-outlined">mystery</span>
            Hint
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { board } = this.state;
    if (!board) {
      return null;
    }

    return (
      <div className="game">
        <SudokuBoard board={board} renderPuzzle={this.renderPuzzle} />
        {this.renderNumbers()}
        {this.renderActions()}
      </div>
    );
  }
}

Game.propTypes = {};

export default Game;
