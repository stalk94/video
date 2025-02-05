import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Tweakpane from "tweakpane";
import { Rnd } from "react-rnd";


function TweakpaneComponent() {
    const paneContainerRef = React.useRef<HTMLDivElement | null>(null);
    const paneRef = React.useRef<Tweakpane.Pane | null>(null);
    const [windowSize, setWindowSize] = React.useState({ width: 320, height: 200 });
    const [position, setPosition] = React.useState({ x: 100, y: 100 });
  

    React.useEffect(() => {
        if(!paneContainerRef.current) return;
        if(!paneRef.current) {
            const pane = new Tweakpane.Pane();
            paneRef.current = pane;

            pane.addBinding({ speed: 10 }, "speed", { min: 0, max: 100 });
            pane.addBinding({ color: "#ff0000" }, "color");

            // Добавляем панель в DOM
            paneContainerRef.current.appendChild(pane.element);
        }

        return ()=> {
            paneRef.current?.dispose();
            paneRef.current = null;
        };
    }, []);
  
    return(
        <Rnd
            size={{ width: windowSize.width, height: windowSize.height }}
            position={position}
            onDragStop={(e, d) => {
                setPosition({x:d.x, y:d.y})
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                // Обновляем размеры при изменении
                setWindowSize({ width: ref.offsetWidth, height: ref.offsetHeight });
            }}
        >
        <div ref={paneContainerRef} />
        </Rnd>
    )
}
function DraggableTweakpane() {
    const paneContainerRef = React.useRef<HTMLDivElement | null>(null);
    const paneRef = React.useRef<Tweakpane.Pane | null>(null);
    const [size, setSize] = React.useState({ width: 300, height: 0 });
  
    React.useEffect(() => {
        if(!paneContainerRef.current || paneRef.current) return;
        const pane = new Tweakpane.Pane();
        paneRef.current = pane;
    
        pane.addBinding({ speed: 10 }, "speed", { min: 0, max: 100 });
        pane.addBinding({ color: "#ff0000" }, "color");
        pane.addBinding({ speed: 10 }, "speed", { min: 0, max: 100 });
        pane.addBinding({ color: "#ff0000" }, "color");
        pane.addBinding({ speed: 10 }, "speed", { min: 0, max: 100 });
        pane.addBinding({ color: "#ff0000" }, "color");

        paneContainerRef.current.appendChild(pane.element);
        return ()=> {
            paneRef.current?.dispose();
            paneRef.current = null;
        }
    }, []);
  
    return (
      <Rnd
        default={{
            x: 100,
            y: 100,
            width: size.width,
            height: size.height
        }}
        bounds="window"
        minWidth={200}
        minHeight={150}
        enableResizing={{ bottom: true, top: true, right: true }}
        onResize={(e, dir, ref)=> {
            paneRef.current.element.style.height = `${ref.offsetHeight}px`;
        }}
        onResizeStop={(e, dir, ref) => {
            setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
            paneRef.current.element.style.height = `${ref.offsetHeight}px`;
            //paneContainerRef.current.style.height = `${ref.offsetHeight}px`;
        }}
      >
        
        <div ref={paneContainerRef} />
       
      </Rnd>
    );
  }


function App() {

    return(
        <div>
            <DraggableTweakpane />
        </div>
    )
}


window.onload =()=> createRoot(document.querySelector(".root")).render(
    <App/>
);