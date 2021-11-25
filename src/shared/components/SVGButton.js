import React from 'react';

const SVGButton = ({ id, onClick, svgIcon, disabled=false, title="", extraClassNames="", innerText="" }) => {
  return (
    <button
      id={id}
      className={`flex h-10 mb-px text-white p-2 bg-gray-900 hover:bg-blue-600 focus:outline-none disabled:bg-gray-400 disabled:cursor-default ${extraClassNames}`}
      type="button"
      disabled={disabled}
      onClick={e => onClick(e)}
      title={title}
    >
      <img id={id} src={svgIcon} alt="button" />

      <span id={id} className="truncate ml-4">{innerText}</span>
    </button>
  );
};

export default SVGButton;
