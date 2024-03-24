import React from "react";
import PropTypes from "prop-types";
import "../css/numbers.css";
import CircularProgress from "./numberProgress";

const Numbers = ({ number, onClick, completionPercentage }) => (
  <div key={number} className="number" onClick={onClick}>
    <div>{number}</div>
    <CircularProgress percent={completionPercentage} />
  </div>
);

Numbers.propTypes = {
  number: PropTypes.number.isRequired,
  onClick: PropTypes.func,
  completionPercentage: PropTypes.number.isRequired,
};

Numbers.defaultProps = {
  onClick: null,
};

export default Numbers;
