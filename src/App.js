import React, { useState } from "react";
import { SheetContextProvider } from "./shared/contexts/SheetContext";

import Header from "./components/Header";
import LeftControls from "./components/LeftControls";
import RightControls from "./components/RightControls";
import BottomControls from "./components/BottomControls";
import RightPanel from "./components/RightPanel";

function App() {
  const [sheet, setSheet] = useState();
  const [showPanel, setShowPanel] = useState(false);

  // states of right panel
  const [shape, setShape] = useState();
  const [link, setLink] = useState();
  const [label, setLabel] = useState();
  const [fontSize, setFontSize] = useState(0);
  const [borders, setBorders] = useState(false);
  const [note, setNote] = useState();
  const [message, setMessage] = useState(() => {
    return {
      author: "Shane B",
      date: "Jun 25, 2021",
      email: "shaneburkhart@gmail.com",
    };
  });

  const sheetChange = (value) => {
    setShowPanel(false);
    setSheet(value);
  };

  const callback = (shape) => {
    if (shape !== undefined) {
      setShowPanel(true);
      setShape(shape);
    } else {
      setShowPanel(false);
    }
  };

  return (
    <SheetContextProvider>
      <Header sheet={sheet} sheetChange={sheetChange} />

      <main id="container" className="relative w-full bg-gray-500">
        <LeftControls click={() => setShowPanel(false)} />
        <RightControls
          showPanel={showPanel}
          sheet={sheet}
          callback={callback}
          close={() => setShowPanel(false)}
        />
        <BottomControls
          showPanel={showPanel}
          sheet={sheet}
          sheetChange={sheetChange}
        />
      </main>

      {showPanel && (
        <RightPanel
          shape={shape}
          close={() => setShowPanel(false)}
          link={link}
          setLink={setLink}
          setLabel={setLabel}
          setFontSize={setFontSize}
          setBorders={setBorders}
          setNote={setNote}
          message={message}
        />
      )}
    </SheetContextProvider>
  );
}

export default App;
