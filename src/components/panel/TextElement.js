import React, { useState } from "react";

import { setText } from "../../utils/Draw";
import { TextShape } from "../../utils/TextShape";

const TextElement = ({ text, textSize, border }) => {
  const [label, setLabel] = useState(text);
  const [size, setSize] = useState(TextShape.txtSizeMap[textSize]);
  const [borders, setBorders] = useState(border);

  return (
    <div className="p-4 w-full">
      <label
        htmlFor="text"
        className="text-md inline-block text-gray-500 font-semibold mb-2"
      >
        Text
      </label>
      <input
        type="text"
        id="text"
        className="shadow-sm h-10 block w-full sm:text-sm border-gray-300 rounded-md"
        aria-describedby="text"
        defaultValue={text}
        onChange={(e) => {
          setLabel(e.target.value);
          setText(e.target.value, size, borders);
        }}
      />

      <div className="mt-4 h-10 inline-flex flex-row items-center">
        <div className="h-full divide-x divide-gray-300 rounded border border-gray-300 bg-white">
          <button
            className={`w-10 h-full inline-block text-center align-middle font-size-button text-blue-700 font-medium text-sm ${
              size === 0 && "active"
            }`}
            onClick={() => {
              setSize(0);
              setText(label, 0, borders);
            }}
          >
            A
          </button>
          <button
            className={`w-10 h-full inline-block text-center align-middle font-size-button text-blue-700 font-medium text-base ${
              size === 1 && "active"
            }`}
            onClick={() => {
              setSize(1);
              setText(label, 1, borders);
            }}
          >
            A
          </button>
          <button
            className={`w-10 h-full inline-block text-center align-middle font-size-button text-blue-700 font-medium text-lg ${
              size === 2 && "active"
            }`}
            onClick={() => {
              setSize(2);
              setText(label, 2, borders);
            }}
          >
            A
          </button>
          <button
            className={`w-10 h-full inline-block text-center align-middle font-size-button text-blue-700 font-medium text-xl ${
              size === 3 && "active"
            }`}
            onClick={() => {
              setSize(3);
              setText(label, 3, borders);
            }}
          >
            A
          </button>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-md inline-block text-gray-500 font-semibold mb-2">
          Borders
        </label>
        <div className="flex items-center">
          <input
            id="borders"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-0"
            defaultChecked={border}
            onChange={(e) => {
              setBorders(e.target.checked);
              setText(label, size, e.target.checked);
            }}
          />
          <label htmlFor="borders" className="ml-2 block text-sm text-gray-600">
            Show Markup Borders
          </label>
        </div>
      </div>
    </div>
  );
};

export default TextElement;
