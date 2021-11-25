import React, { useState } from 'react'

const CalibrationElement = ({ setLabel, setFontSize }) => {
    const [ size, setSize ] = useState(0)

    return (
        <div className="p-4 w-full">
            <p className="text-sm text-gray-700 my-8">
                This calibration will be used as a reference for all measurement markups on this sheet.
            </p>

            <label className="text-sm block text-gray-700">Measurement</label>
            <div className="mt-2 w-full h-10 flex flex-row items-center">
                <div className="w-full h-full divide-x divide-gray-300 rounded border border-gray-300 bg-white">
                    <button
                        className={`w-6/12 h-full text-center align-middle font-size-button text-blue-700 font-medium text-sm ${size === 0 && 'active'}`}
                        onClick={() => { setSize(0); setFontSize(0) }}
                    >
                        METRIC
                    </button>
                    <button
                        className={`w-6/12 h-full text-center align-middle font-size-button text-blue-700 font-medium text-base ${size === 1 && 'active'}`}
                        onClick={() => { setSize(1); setFontSize(1) }}
                    >
                        FEET/INCHES
                    </button>
                </div>
            </div>

            <div className="mt-2 w-full h-10 divide-x divide-gray-300 rounded border border-gray-300 bg-white flex flex-row items-center">
                <input
                    type="text"
                    id="text"
                    className="shadow-sm h-10 border-gray-300 w-7/12 sm:text-sm focus:ring-0"
                    aria-describedby="text"
                    onChange={e => setLabel(e.target.value)}
                />
                <select className="shadow-sm h-10 w-5/12 text-gray-600 text-sm">
                    <option>Meters</option>
                    <option>Centimeters</option>
                </select>
            </div>

            <div className="mt-2 w-full h-10 divide-x divide-gray-300 rounded border border-gray-300 bg-white flex flex-row items-center">
                <input
                    type="text"
                    id="text"
                    className="shadow-sm h-10 border-gray-300 w-6/12 sm:text-sm focus:ring-0"
                    aria-describedby="text"
                    placeholder="Ft"
                    onChange={e => setLabel(e.target.value)}
                />
                <input
                    type="text"
                    id="text"
                    className="shadow-sm h-10 border-gray-300 w-6/12 sm:text-sm focus:ring-0"
                    aria-describedby="text"
                    placeholder="In"
                    onChange={e => setLabel(e.target.value)}
                />
            </div>
            <p className="text-red-600 font-semibold text-xs mt-1">Units must be greater than 0</p>

        </div>
    )
}

export default CalibrationElement