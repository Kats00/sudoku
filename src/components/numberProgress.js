import React from "react";
import PropTypes from "prop-types";
import "../css/progressBar.css";

const CircularPathD =
  "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831";

const CircularProgress = ({ percent }) => {
  return (
    <svg viewBox="0 0 36 36" className="circular-progress">
      <path className="circle-bg" d={CircularPathD} />
      <path
        className="circle"
        strokeDasharray={`${percent * 100}, 100`}
        d={CircularPathD}
      />
    </svg>
  );
};

CircularProgress.propTypes = {
  percent: PropTypes.number.isRequired,
};

export default CircularProgress;
