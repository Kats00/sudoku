import React from "react";
import PropTypes from "prop-types";

const SudokuBoard = ({ board, renderPuzzle }) => {
  if (!board) return null;

  return (
    <div>
      <div className="title">Sudoku</div>
      <div className="sudoku-board">{board && renderPuzzle()}</div>
    </div>
  );
};

SudokuBoard.propTypes = {
  board: PropTypes.object.isRequired,
  renderPuzzle: PropTypes.func.isRequired,
};

export default SudokuBoard;
