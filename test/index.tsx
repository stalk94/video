import React from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { createRoot } from 'react-dom/client'
import maskImg from "../src/img/lips.png";

function App() {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [maskImage, setMaskImage] = React.useState<HTMLImageElement | null>(null);

    React.useEffect(() => {
        const faceMesh = new FaceMesh({
            locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });
        faceMesh.setOptions({
            maxNumFaces: 1, // Отслеживание только одного лица
            refineLandmarks: true, // Детализированные ключевые точки
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        // Загрузка изображения маски
        const mask = new Image();
        mask.src = maskImg; // Укажите путь к изображению маски
        

        // Настройка камеры
        const camera = new Camera(videoRef.current, {
            onFrame: async () => {
                await faceMesh.send({ image: videoRef.current });
            },
            width: 640,
            height: 480,
        });

        // Обработка результатов FaceMesh
        faceMesh.onResults((results) => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!canvas || !ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищаем канвас перед отрисовкой
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

            // Если лицо найдено
            if (results.multiFaceLandmarks.length > 0 && mask.complete) {
                const landmarks = results.multiFaceLandmarks[0]; // Берем первое лицо

                // Пример рисования маски поверх лица
                const width =
                    (landmarks[454].x - landmarks[234].x) * canvas.width/3; // Ширина маски
                const height =
                    (landmarks[10].y - landmarks[152].y) * canvas.height/3; // Высота маски

                const x = landmarks[234].x * canvas.width - width / 2+50;
                const y = landmarks[152].y * canvas.height - height-100;

                // Рисуем маску
                ctx.drawImage(mask, x, y, width, height);
            }
        });

        camera.start(); // Запуск камеры

        // Очистка при размонтировании компонента
        return () => {
            camera.stop();
        };
    }, []);


    return (
        <div>
            <video
                ref={videoRef}
                width="640"
                height="480"
                autoPlay
                style={{  }}
            />
            <canvas ref={canvasRef} width="640" height="480" />
        </div>
    );
}


window.onload =()=> createRoot(document.querySelector(".root")).render(
    <App/>
);