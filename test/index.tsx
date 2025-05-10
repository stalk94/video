import React from 'react';
import { Results, FaceMesh, 
    FACEMESH_LEFT_EYE, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYEBROW, 
    FACEMESH_LIPS, FACEMESH_LEFT_IRIS, FACEMESH_RIGHT_IRIS, FACEMESH_RIGHT_EYEBROW, 
    FACEMESH_FACE_OVAL, FACE_GEOMETRY, FACEMESH_TESSELATION, FACEMESH_CONTOURS, 
    LandmarkConnectionArray, NormalizedLandmarkList, NormalizedLandmark
} from "@mediapipe/face_mesh";
import { Stage, Container, Sprite, Graphics } from '@pixi/react';
import { Texture, VideoResource } from 'pixi.js';
import { createRoot } from 'react-dom/client';

const myVideo = document.createElement('video');


function App() {

    return(
        <Stage width={800} height={600} options={{ backgroundColor: 0x1099bb }}>

        </Stage>
    );
}


window.onload =()=> createRoot(document.querySelector(".root")).render(
    <App/>
);