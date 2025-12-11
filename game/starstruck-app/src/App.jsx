// src/App.jsx
import { useState, useEffect } from "react";
import Splash from './pages/Splash';
import StartPage from './pages/StartPage';
import Gallery from './pages/Gallery';
import SaveFiles from './pages/SaveFiles';
import NewGameModal from './pages/NewGameModal';
import GameEngine from './pages/GameEngine';
import './App.css';

function App() {
  const [page, setPage] = useState("Splash");

  const [saveMode, setSaveMode] = useState("continue");  
  const [newGameData, setNewGameData] = useState(null);  
  const [activeGame, setActiveGame] = useState(null);

  function goToStart() {
    localStorage.setItem("lastPage", "StartPage");
    setPage("StartPage");
  }

  function goToGallery() {
    localStorage.setItem("lastPage", "Gallery");
    setPage("Gallery");
  }

  function goToNewModal() {
    localStorage.setItem("lastPage", "NewGameModal");
    setPage("NewGameModal");
  }

  // mode: "new" or "continue"
  // data: for "new" from StartPage -> { nickname, pronouns }
  //       for "new" from GameEngine pause -> { getCurrentSaveData }
  function goToSaveFiles(mode = "continue", data = null) {
    setSaveMode(mode);
    setNewGameData(data);
    localStorage.setItem("lastPage", "SaveFiles");
    setPage("SaveFiles");
  }

  // startGame receives (sceneId, lineId, nickname, pronouns)
  function startGame(sceneId, lineId, nickname, pronouns) {
    setActiveGame({ sceneId, lineId, nickname, pronouns });
    setPage("Game");
  }

  // restore last page
  useEffect(() => {
    const last = localStorage.getItem("lastPage");
    if (last === "Gallery") setPage("Gallery");
    else if (last === "NewGameModal") setPage("NewGameModal");
    else if (last === "SaveFiles") setPage("SaveFiles");
    else setPage("Splash");
  }, []);

  return (
    <>
      {page === "Splash" && <Splash onFinish={() => setPage("StartPage")} />}

      {page === "StartPage" && (
        <StartPage
          goToNewModal={goToNewModal}
          goToGallery={goToGallery}
          goToSaveFiles={() => goToSaveFiles("continue")}
        />
      )}

      {page === "Gallery" && <Gallery goToStart={goToStart} />}

      {page === "NewGameModal" && (
        <NewGameModal
          goToStart={goToStart}
          goToSaveFiles={goToSaveFiles}
          onFinish={(data) => goToSaveFiles("new", data)}
        />
      )}

      {page === "SaveFiles" && (
        <SaveFiles
          mode={saveMode}
          newGameData={newGameData}
          startGame={startGame}
          goToStart={goToStart}
        />
      )}

      {page === "Game" && (
        <GameEngine
          initialSceneId={activeGame?.sceneId ?? 1}
          initialLineId={activeGame?.lineId ?? null}
          nickname={activeGame?.nickname ?? "Roxanne"}
          pronouns={activeGame?.pronouns ?? "she/her"}
          goToStart={goToStart}
          goToSaveFiles={goToSaveFiles}
        />
      )}
    </>
  );
}

export default App;


/*import { useState, useEffect } from "react";
import Splash from './pages/Splash';
import StartPage from './pages/StartPage';
import Gallery from './pages/Gallery';
import SaveFiles from './pages/SaveFiles';
import NewGameModal from './pages/NewGameModal';
import './App.css';

function App() {
  const [page, setPage] = useState("Splash");

  function goToSplash() {
    setPage("Splash")
  }
  
  useEffect(() => {
    const last = localStorage.getItem("lastPage");
    if (last === "Gallery") setPage("Gallery");
    else if (last === "Start") setPage("Splash");
    else goToSplash();
  }, []);

  return (
      <>
        {page === "Splash" && (<Splash onFinish={() => setPage("StartPage")} />)}
        {page === "StartPage" && (
          <StartPage
            goToNewModal={() => {
              localStorage.setItem("lastPage", "NewGameModal");
              setPage("NewGameModal");
            }}
            goToGallery={() => {
              localStorage.setItem("lastPage", "Gallery");
              setPage("Gallery");
            }}
            goToSaveFiles={() => {
              localStorage.setItem("lastPage", "SaveFiles");
              setPage("SaveFiles");
            }}
            goToStart={() => {
              localStorage.setItem("lastPage", "Splash");
              setPage("StartPage");
            }}
          />)}
        {page === "Gallery" && (
          <Gallery 
            goToStart={() => {
              localStorage.setItem("lastPage", "Gallery");
              setPage("StartPage");
            }}
          />)}
          {page === "NewGameModal" && (
          <NewGameModal 
            goToStart={() => {
              localStorage.setItem("lastPage", "NewGame");
              setPage("StartPage");
            }}
            goToSaveFiles={() => {
              localStorage.setItem("lastPage", "SaveFiles");
              setPage("SaveFiles");
            }}
          />)}
        {page === "SaveFiles" && (
          <SaveFiles 
            goToStart={() => {
              localStorage.setItem("lastPage", "SaveFiles");
              setPage("StartPage");
            }}
          />)}
      </>
  );
}

export default App; */