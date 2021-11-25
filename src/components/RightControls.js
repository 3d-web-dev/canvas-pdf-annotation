import React, { useState, useEffect, useContext } from 'react'

import { SheetContext } from '../shared/contexts/SheetContext'

import SVGButton from '../shared/components/SVGButton'

import SVG5 from '../assets/svgicons/5.svg'
import SVG6 from '../assets/svgicons/6.svg'
import SVG7 from '../assets/svgicons/7.svg'
import SVG8 from '../assets/svgicons/8.svg'
import SVG9 from '../assets/svgicons/9.svg'
import SVG10 from '../assets/svgicons/10.svg'
import SVG11 from '../assets/svgicons/11.svg'
import SVG12 from '../assets/svgicons/12.svg'
import SVG13 from '../assets/svgicons/13.svg'
import SVG14 from '../assets/svgicons/14.svg'
import SVG15 from '../assets/svgicons/15.svg'
import SVG16 from '../assets/svgicons/16.svg'
import SVG17 from '../assets/svgicons/17.svg'
import SVG18 from '../assets/svgicons/18.svg'
import SVG19 from '../assets/svgicons/19.svg'
import SVG20 from '../assets/svgicons/20.svg'
import SVG21 from '../assets/svgicons/21.svg'
import SVG22 from '../assets/svgicons/22.svg'
import SVG23 from '../assets/svgicons/23.svg'
import SVG24 from '../assets/svgicons/24.svg'
import SVG25 from '../assets/svgicons/25.svg'
import SVG26 from '../assets/svgicons/26.svg'
import SVG27 from '../assets/svgicons/27.svg'
import SVG28 from '../assets/svgicons/28.svg'
import SVG29 from '../assets/svgicons/29.svg'
import SVG30 from '../assets/svgicons/30.svg'
import SVG31 from '../assets/svgicons/31.svg'
import SVG32 from '../assets/svgicons/32.svg'
import SVG33 from '../assets/svgicons/33.svg'
import SVG34 from '../assets/svgicons/34.svg'
import SVG35 from '../assets/svgicons/35.svg'
import SVG36 from '../assets/svgicons/36.svg'
import SVG37 from '../assets/svgicons/37.svg'
import SVG38 from '../assets/svgicons/38.svg'
import SVG39 from '../assets/svgicons/39.svg'
import SVG40 from '../assets/svgicons/40.svg'
import SVG41 from '../assets/svgicons/41.svg'
import SVG42 from '../assets/svgicons/42.svg'
import SVG43 from '../assets/svgicons/43.svg'
import SVG44 from '../assets/svgicons/44.svg'
import SVG45 from '../assets/svgicons/45.svg'
import SVG46 from '../assets/svgicons/46.svg'
import SVG47 from '../assets/svgicons/47.svg'
import SVG48 from '../assets/svgicons/48.svg'
import SVG49 from '../assets/svgicons/49.svg'
import SVG50 from '../assets/svgicons/50.svg'
import SVG51 from '../assets/svgicons/51.svg'
import SVG52 from '../assets/svgicons/52.svg'
import SVG53 from '../assets/svgicons/53.svg'
import SVG54 from '../assets/svgicons/54.svg'

import {
    startApp,
    selectDraw,
    multiSelectDraw,
    cloudDraw,
    arrowDraw,
    penDraw,
    brushDraw,
    textDraw,
    rectDraw,
    ellipseDraw,
    lineDraw,
    xDraw,
    cloudLinkDraw,
    ellipseLinkDraw,
    rectLinkDraw,
    calibrationDraw,
    lineMeasureDraw,
    rectMeasureDraw,
    polylineMeasureDraw,
    polygonMeasureDraw,
    colorDraw,
    symbolDraw,
    cameraDraw
} from '../utils/Draw'

export const SymbolList = [ SVG16, SVG26,SVG27,SVG28,SVG29,SVG30,SVG31,SVG32,SVG33,SVG34,SVG35,SVG36,SVG37,SVG38,SVG39,SVG40,SVG41,SVG42,SVG43 ];

export default function RightControls({ sheet, callback, showPanel, close }) {

    const [showBasics, setShowBasics] = useState(false)
    const [showLink, setShowLink] = useState(false)
    const [showRulers, setShowRulers] = useState(false)
    const [showOthers, setShowOthers] = useState(false)
    const [showColor, setShowColor] = useState(false)
    const [tool, setTool] = useState("select")
    const [color, setColor] = useState(SVG17)

    const { sheets } = useContext(SheetContext)

    const initializeState = () => {
        setShowBasics(false)
        setShowLink(false)
        setShowRulers(false)
        setShowOthers(false)
        setShowColor(false)
        if (close) close();
    }

    const selectTool = (selectedTool="") => {
        initializeState()
        setTool(selectedTool)
        if (selectedTool === '') {
            setTool('select')
        }
    }

    const changeColor = (svg) => {
        initializeState()
        setColor(svg)
    }

    useEffect(() => {
        if (sheet === undefined && sheets.length > 0) {
            startApp(sheets[0], callback)
        } else if (sheet !== undefined) {
            startApp(sheet, callback)
        }
    }, [sheets, sheet])

    return (
        <section className="absolute top-4 flex flex-col bg-gray-900 p-1 rounded z-20" style={{right: `${showPanel ? '25rem' : '1rem'}`}}>
            <SVGButton svgIcon={SVG5} onClick={() => { selectTool('select'); selectDraw() }} extraClassNames={`w-10 rounded ${tool === 'select' && 'active'}`} />
            <SVGButton svgIcon={SVG6} onClick={() => { selectTool('multiSelect'); multiSelectDraw() }} extraClassNames={`w-10 rounded ${tool === 'multiSelect' && 'active'}`} />
            <SVGButton svgIcon={SVG7} onClick={() => { selectTool('cloud'); cloudDraw() }} extraClassNames={`w-10 rounded ${tool === 'cloud' && 'active'}`} />
            <SVGButton svgIcon={SVG8} onClick={() => { selectTool('arrow'); arrowDraw() }} extraClassNames={`w-10 rounded ${tool === 'arrow' && 'active'}`} />
            <SVGButton svgIcon={SVG9} onClick={() => { selectTool('pen'); penDraw() }} extraClassNames={`w-10 rounded ${tool === 'pen' && 'active'}`} />
            <SVGButton svgIcon={SVG10} onClick={() => { selectTool('brush'); brushDraw() }} extraClassNames={`w-10 rounded ${tool === 'brush' && 'active'}`} />
            <SVGButton svgIcon={SVG11} onClick={() => { selectTool('text'); textDraw() }} extraClassNames={`w-10 rounded ${tool === 'text' && 'active'}`} />

            <div className="relative">
                <SVGButton svgIcon={SVG12} onClick={() => { selectTool(); setShowBasics(!showBasics) }} extraClassNames="w-10 rounded" />

                {showBasics && <div className="absolute top-0 right-12 flex flex-row p-1 rounded bg-gray-900">
                    <SVGButton svgIcon={SVG18} onClick={() => { selectTool('rect'); rectDraw() }} extraClassNames={`w-10 rounded ${tool === 'rect' && 'active'}`} />
                    <SVGButton svgIcon={SVG19} onClick={() => { selectTool('ellipse'); ellipseDraw() }} extraClassNames={`w-10 rounded ${tool === 'ellipse' && 'active'}`} />
                    <SVGButton svgIcon={SVG20} onClick={() => { selectTool('line'); lineDraw() }} extraClassNames={`w-10 rounded ${tool === 'line' && 'active'}`} />
                    <SVGButton svgIcon={SVG21} onClick={() => { selectTool('x'); xDraw() }} extraClassNames={`w-10 rounded ${tool === 'x' && 'active'}`} />
                </div>}
            </div>

            <div className="relative">
                <SVGButton svgIcon={SVG13} onClick={() => { selectTool(); setShowLink(!showLink) }} extraClassNames="w-10 rounded" />

                {showLink && <div className="absolute top-0 right-12 flex flex-row p-1 rounded bg-gray-900 ">
                    <SVGButton svgIcon={SVG7} onClick={() => { selectTool('cloudLink'); cloudLinkDraw() }} extraClassNames={`w-10 rounded ${tool === 'cloudLink' && 'active'}`} />
                    <SVGButton svgIcon={SVG19} onClick={() => { selectTool('ellipseLink'); ellipseLinkDraw() }} extraClassNames={`w-10 rounded ${tool === 'ellipseLink' && 'active'}`} />
                    <SVGButton svgIcon={SVG18} onClick={() => { selectTool('rectLink'); rectLinkDraw() }} extraClassNames={`w-10 rounded ${tool === 'rectLink' && 'active'}`} />
                </div>}
            </div>

            <div className="relative">
                <SVGButton svgIcon={SVG14} onClick={() => { selectTool(); setShowRulers(!showRulers) }} extraClassNames="w-10 rounded" />

                {showRulers && <div className="absolute top-0 right-12 flex flex-row p-1 rounded bg-gray-900 ">
                    <SVGButton svgIcon={SVG14} onClick={() => { selectTool('calibration'); calibrationDraw() }} extraClassNames={`w-10 rounded ${tool === 'calibration' && 'active'}`} />
                    <SVGButton svgIcon={SVG23} onClick={() => { selectTool('lineMeasure'); lineMeasureDraw() }} extraClassNames={`w-10 rounded ${tool === 'lineMeasure' && 'active'}`} />
                    <SVGButton svgIcon={SVG24} onClick={() => { selectTool('rectMeasure'); rectMeasureDraw() }} extraClassNames={`w-10 rounded ${tool === 'rectMeasure' && 'active'}`} />
                    <SVGButton svgIcon={SVG25} onClick={() => { selectTool('polylineMeasure'); polylineMeasureDraw() }} extraClassNames={`w-10 rounded ${tool === 'polylineMeasure' && 'active'}`} />
                    <SVGButton svgIcon={SVG22} onClick={() => { selectTool('polygonMeasure'); polygonMeasureDraw() }} extraClassNames={`w-10 rounded ${tool === 'polygonMeasure' && 'active'}`} />
                </div>}
            </div>

            <div className="relative">
                <SVGButton svgIcon={SVG15} onClick={() => { selectTool(); setShowOthers(!showOthers) }} extraClassNames="w-10 rounded" />

                {showOthers && <div className="absolute top-0 w-48 h-52 overflow-y-auto right-12 flex flex-col p-1 rounded bg-gray-900">
                    <SVGButton svgIcon={SVG26} onClick={() => { selectTool('ge'); symbolDraw(0) }} extraClassNames={`rounded svg-button-label ${tool === 'ge' && 'active'}`} innerText="General" />
                    <SVGButton svgIcon={SVG27} onClick={() => { selectTool('jo'); symbolDraw(1) }} extraClassNames={`rounded svg-button-label ${tool === 'jo' && 'active'}`} innerText="Joel Valenzuela" />
                    <SVGButton svgIcon={SVG28} onClick={() => { selectTool('qc'); symbolDraw(2) }} extraClassNames={`rounded svg-button-label ${tool === 'qc' && 'active'}`} innerText="Quality Control" />
                    <SVGButton svgIcon={SVG29} onClick={() => { selectTool('si'); symbolDraw(3) }} extraClassNames={`rounded svg-button-label ${tool === 'si' && 'active'}`} innerText="SAFETY ITEMS" />
                    <SVGButton svgIcon={SVG30} onClick={() => { selectTool('lq'); symbolDraw(4) }} extraClassNames={`rounded svg-button-label ${tool === 'lq' && 'active'}`} innerText="LAYOUT QC" />
                    <SVGButton svgIcon={SVG31} onClick={() => { selectTool('fo'); symbolDraw(5) }} extraClassNames={`rounded svg-button-label ${tool === 'fo' && 'active'}`} innerText="FIELD OPS MANA" />
                    <SVGButton svgIcon={SVG32} onClick={() => { selectTool('sm'); symbolDraw(6) }} extraClassNames={`rounded svg-button-label ${tool === 'sm' && 'active'}`} innerText="SQP MANAGER IN" />
                    <SVGButton svgIcon={SVG33} onClick={() => { selectTool('qf'); symbolDraw(7) }} extraClassNames={`rounded svg-button-label ${tool === 'qf' && 'active'}`} innerText="QUESTIONS FROM" />
                    <SVGButton svgIcon={SVG34} onClick={() => { selectTool('db'); symbolDraw(8) }} extraClassNames={`rounded svg-button-label ${tool === 'db' && 'active'}`} innerText="DAMAGE BY OTHER" />
                    <SVGButton svgIcon={SVG35} onClick={() => { selectTool('md'); symbolDraw(9) }} extraClassNames={`rounded svg-button-label ${tool === 'md' && 'active'}`} innerText="MISSING DIMENSIONS" />
                    <SVGButton svgIcon={SVG36} onClick={() => { selectTool('mi'); symbolDraw(10) }} extraClassNames={`rounded svg-button-label ${tool === 'mi' && 'active'}`} innerText="MISCELLANEOUS" />
                    <SVGButton svgIcon={SVG37} onClick={() => { selectTool('df'); symbolDraw(11) }} extraClassNames={`rounded svg-button-label ${tool === 'df' && 'active'}`} innerText="DOORS / FRAMES" />
                    <SVGButton svgIcon={SVG38} onClick={() => { selectTool('sq'); symbolDraw(12) }} extraClassNames={`rounded svg-button-label ${tool === 'sq' && 'active'}`} innerText="SPECIALITIES QC" />
                    <SVGButton svgIcon={SVG39} onClick={() => { selectTool('dt'); symbolDraw(13) }} extraClassNames={`rounded svg-button-label ${tool === 'dt' && 'active'}`} innerText="DRYWALL / TRIM /" />
                    <SVGButton svgIcon={SVG40} onClick={() => { selectTool('ac'); symbolDraw(14) }} extraClassNames={`rounded svg-button-label ${tool === 'ac' && 'active'}`} innerText="ACOUSTICAL / CEILING" />
                    <SVGButton svgIcon={SVG41} onClick={() => { selectTool('if'); symbolDraw(15) }} extraClassNames={`rounded svg-button-label ${tool === 'if' && 'active'}`} innerText="INTERIOR FRAMING" />
                    <SVGButton svgIcon={SVG42} onClick={() => { selectTool('ef'); symbolDraw(16) }} extraClassNames={`rounded svg-button-label ${tool === 'ef' && 'active'}`} innerText="EXTERIOR FRAMING" />
                </div>}
            </div>

            <SVGButton onClick={() => { selectTool('camera'); cameraDraw() }} svgIcon={SVG16} extraClassNames={`w-10 rounded ${tool === 'camera' && 'active'}`} />

            <div className="relative">
                <SVGButton onClick={() => { selectTool(); setShowColor(!showColor) }} svgIcon={color} extraClassNames="w-10 rounded" />

                {showColor && <div className="absolute top-0 w-44 right-12 grid grid-cols-4 p-1 rounded justify-center items-center bg-gray-900">
                    <SVGButton svgIcon={SVG43} extraClassNames="w-10 rounded" onClick={() => { changeColor(SVG43); colorDraw('#000000') }} />
                    <SVGButton svgIcon={SVG54} extraClassNames="w-10 rounded" onClick={() => { changeColor(SVG54); colorDraw('#0A43C2') }} />
                    <SVGButton svgIcon={SVG44} extraClassNames="w-10 rounded" onClick={() => { changeColor(SVG44); colorDraw('#A17541') }} />
                    <SVGButton svgIcon={SVG45} extraClassNames="w-10 rounded" onClick={() => { changeColor(SVG45); colorDraw('#5CEEEE') }} />
                    <SVGButton svgIcon={SVG46} extraClassNames="w-10 rounded" onClick={() => { changeColor(SVG46); colorDraw('#00FF00') }} />
                    <SVGButton svgIcon={SVG47} extraClassNames="w-10 rounded" onClick={() => { changeColor(SVG47); colorDraw('#DDDDDD') }} />
                    <SVGButton svgIcon={SVG48} extraClassNames="w-10 rounded" onClick={() => { changeColor(SVG48); colorDraw('#9FB254') }} />
                    <SVGButton svgIcon={SVG49} extraClassNames="w-10 rounded" onClick={() => { changeColor(SVG49); colorDraw('#F38109') }} />
                    <SVGButton svgIcon={SVG50} extraClassNames="w-10 rounded" onClick={() => { changeColor(SVG50); colorDraw('#F776C8') }} />
                    <SVGButton svgIcon={SVG51} extraClassNames="w-10 rounded" onClick={() => { changeColor(SVG51); colorDraw('#C33EE1') }} />
                    <SVGButton svgIcon={SVG52} extraClassNames="w-10 rounded" onClick={() => { changeColor(SVG52); colorDraw('#FF0000') }} />
                    <SVGButton svgIcon={SVG53} extraClassNames="w-10 rounded" onClick={() => { changeColor(SVG53); colorDraw('#FFFF00') }} />
                </div>}
            </div>
        </section>
    )
}
