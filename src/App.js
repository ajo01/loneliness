import { useState, useEffect } from "react";
import * as d3 from "d3";
import "./App.css";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import ArrowButton from "./components/arrowbutton";
import {
  LastSlide,
  TitleSlide,
  BidirectionalSlide,
  DotSlide,
  ScatterSlide,
} from "./slides";
import {
  ScatterPersonalityPage,
  BidirectionalPage,
  ScatterPlotPage,
  DotChartPage,
  SankeyDiagramPage,
} from "./pages";
import { GlobalHotKeys } from "react-hotkeys";

function App() {
  const [indexCurrentPage, setIndexCurrentContainer] = useState(0);
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const Slides = [
    <TitleSlide key={0} />,
    <DotSlide key={1} />,
    <DotChartPage data2={data2} key={2} />,
    <SankeyDiagramPage data2={data2} key={3} />,
    <ScatterSlide key={4} />,
    <ScatterPersonalityPage data2={data2} key={5} />,
    <ScatterPlotPage data2={data2} key={6} />,
    <BidirectionalSlide key={7} />,
    <BidirectionalPage data1={data1} key={8} />,
    <LastSlide key={9} />,
  ];

  useEffect(() => {
    // preparing data for dataset1
    d3.csv("data/dataset1.csv")
      .then((data) => {
        // renaming each attribute so that they can be called
        const renameCols = (data) => {
          return data.map((d) => {
            return {
              id: d.ID,
              gender: d.gender,
              category: d.category,
              value: d.value,
              loneliness: d.indicators,
              amount: d.amount,
              status: d.STATUS,
            };
          });
        };

        const renamedData = renameCols(data);

        // convert needed pieces of data into integers rather than strings
        const convertToInt = (data) => {
          return data.map((d) => {
            return {
              ...d,
              amount: parseInt(d.amount),
            };
          });
        };

        // set the data to the prepared data
        const preparedData = convertToInt(renamedData);
        setData1(preparedData);
      })
      .catch((error) => console.error(error));

    // preparing data for dataset 2
    d3.csv("data/dataset2-output.csv")
      .then((data) => {
        // renaming each attribute so that they can be called
        const renameCols = (data) => {
          return data.map((d) => {
            return {
              extravert: d.BFF_15_5,
              introvert: d.BFF_15_6,
              covid: d.Dem_islolation,
              isolation: d.Scale_PSS10_UCLA_13,
              stress: d.Scale_PSS10_UCLA_3,
              distress: d.Expl_Distress_18,
              inside: d.Expl_Distress_19,
              trust: d.OECD_people_1,
            };
          });
        };

        const renamedData = renameCols(data);

        // convert needed pieces of data into integers rather than strings
        const convertToInt = (data) => {
          return data.map((d) => {
            return {
              ...d,
              trust: parseInt(d.trust),
            };
          });
        };

        // set the data to the prepared data
        const preparedData = convertToInt(renamedData);
        setData2(preparedData);
      })
      .catch((error) => console.error(error));
  }, []);

  const renderIndicator = () => {
    return (
      <div className="dots-wrapper">
        <ul className="dots-list">
          {Slides.map((el, i) => (
            <li
              key={i}
              className={`dot ${i === indexCurrentPage ? "active" : ""}`}
              onClick={() => setIndexCurrentContainer(i)}
            ></li>
          ))}
        </ul>
      </div>
    );
  };

  const handleNextClick = () => {
    setIndexCurrentContainer((prevIndex) => {
      const newIndex = prevIndex + 1;
      return newIndex < Slides.length ? newIndex : prevIndex;
    });
  };

  const handlePrevClick = () => {
    setIndexCurrentContainer((prevIndex) => {
      const newIndex = prevIndex - 1;
      return newIndex >= 0 ? newIndex : prevIndex;
    });
  };

  const keyMap = {
    nextSlide: ["down", "right"],
    prevSlide: ["up", "left"],
  };

  const handlers = {
    nextSlide: () => handleNextClick(),
    prevSlide: () => handlePrevClick(),
  };

  return (
    <GlobalHotKeys keyMap={keyMap} handlers={handlers}>
      <div className="App">
        {renderIndicator()}
        <Carousel
          className="carousel-container"
          axis="vertical"
          showStatus={false}
          showThumbs={false}
          transitionTime={500}
          showIndicators={false}
          showArrows={false}
          selectedItem={indexCurrentPage}
          renderArrowPrev={(c) =>
            indexCurrentPage > 0 ? ArrowButton(c, "up", handlePrevClick) : null
          }
          renderArrowNext={(c) =>
            indexCurrentPage < Slides.length - 1
              ? ArrowButton(c, "down", handleNextClick)
              : null
          }
        >
          {Slides.map((Slide, i) => Slide)}
        </Carousel>
      </div>
    </GlobalHotKeys>
  );
}

export default App;
