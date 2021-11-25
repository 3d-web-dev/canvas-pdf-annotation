import React, { useState, useEffect } from "react";
// import { useHistory } from 'react-router-dom';

import sheet1 from "../../assets/sheets/sheet1.png";
import sheet2 from "../../assets/sheets/sheet1.pdf";
import sheet3 from "../../assets/sheets/sheet2.png";
import sheet4 from "../../assets/sheets/sheet2.pdf";
import sheet5 from "../../assets/sheets/sheet3.png";
import sheet6 from "../../assets/sheets/sheet3.pdf";
import sheet7 from "../../assets/sheets/sheet4.png";
import sheet8 from "../../assets/sheets/sheet4.pdf";

export const SheetContext = React.createContext({
  sheets: [],
  uploadSheet: () => {},
});

export const SheetContextProvider = ({ children }) => {
  //   const history = useHistory();

  const [sheets, setSheets] = useState([]);

  const _publishedSheets = [
    {
      id: 1,
      type: "png",
      page: 1,
      title: "Sheet 1",
      description: "Issued Dec 29, 2019",
      sheet: sheet1,
      current: true,
    },
    {
      id: 2,
      type: "pdf",
      page: 1,
      title: "Sheet 2",
      description: "Issued Jan 23, 2020",
      sheet: sheet2,
      current: false,
    },
    {
      id: 3,
      type: "png",
      page: 1,
      title: "Sheet 3",
      description: "Issued Apr 15, 2020",
      sheet: sheet3,
      current: false,
    },
    {
      id: 4,
      type: "pdf",
      page: 1,
      title: "Sheet 4",
      description: "Issued Apr 15, 2020",
      sheet: sheet4,
      current: false,
    },
    {
      id: 5,
      type: "png",
      page: 1,
      title: "Sheet 5",
      description: "Issued Dec 29, 2019",
      sheet: sheet5,
      current: true,
    },
    {
      id: 6,
      type: "pdf",
      page: 1,
      title: "Sheet 6",
      description: "Issued Jan 23, 2020",
      sheet: sheet6,
      current: false,
    },
    {
      id: 7,
      type: "png",
      page: 1,
      title: "Sheet 7",
      description: "Issued Apr 15, 2020",
      sheet: sheet7,
      current: false,
    },
    {
      id: 8,
      type: "pdf",
      page: 1,
      title: "Sheet 8",
      description: "Issued Apr 15, 2020",
      sheet: sheet8,
      current: false,
    },
  ];

  useEffect(() => {
    setSheets(_publishedSheets);
  }, []);

  const uploadSheet = (sheetURL, callbackBefore, callbackAfter) => {
    // const onSuccess = ({ plansetId }) => {
    //   if (callbackBefore) callbackBefore();
    //   history.push(`/sheets/wizard/${plansetId}`);
    //   if (callbackAfter) callbackAfter();
    // }
    // const onError = err => {
    //   setApiError(err);
    //   if (callbackAfter) callbackAfter();
    // }
    // post(`/api/sheets/add_sheet`, { sheetURL }, onSuccess, onError);
  };

  const contextVal = {
    sheets,
    uploadSheet,
  };

  return (
    <SheetContext.Provider value={contextVal}>{children}</SheetContext.Provider>
  );
};
