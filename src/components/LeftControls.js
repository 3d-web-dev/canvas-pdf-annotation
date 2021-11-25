import React, { useState, useEffect } from 'react'

import SVGButton from '../shared/components/SVGButton';
import SVG1 from '../assets/svgicons/1.svg'
import SVG2 from '../assets/svgicons/2.svg'
import SVG3 from '../assets/svgicons/3.svg'
import SVG4 from '../assets/svgicons/4.svg'
import SVG64 from '../assets/svgicons/64.svg'

import { 
    zoomInDraw,
    zoomOutDraw,
    zoomFullDraw,
    zoomFullScreenDraw,
} from '../utils/Draw';

export default function LeftControls() {
    const [ fullScreen, setFullScreen ] = useState("false")

    return (
        <section className="absolute top-4 left-4 flex flex-col z-20">
            <SVGButton onClick={zoomInDraw} svgIcon={SVG1} extraClassNames="w-10 rounded rounded-b-none" />
            <SVGButton onClick={zoomFullDraw} svgIcon={SVG2} extraClassNames="w-10 rounded-none" />
            <SVGButton onClick={zoomOutDraw} svgIcon={SVG3} extraClassNames="w-10 rounded rounded-t-none" />

            <SVGButton onClick={() => { zoomFullScreenDraw() }} svgIcon={fullScreen === 'true' ? SVG64 : SVG4} extraClassNames="w-10 rounded mt-4" />
        </section>
    )
}
