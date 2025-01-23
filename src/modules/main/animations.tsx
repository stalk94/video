import React from 'react';
import { EVENT } from '../../lib/engine';
import { useDidMount, useWillUnmount } from 'rooks';
import { isMobile } from "../../function";
import rand from "random-percentage";
import { EventAnimation } from "./type";
import heart from '../../img/heart.png';
import petal from '../../img/rose-petal.png';
import lips from '../../img/lips.png'
import fire from '../../img/fire.png'
import fire1 from '../../img/fire1.png'
import fire2 from '../../img/fire2.png'
import fire3 from '../../img/fire3.png'
import rose from '../../img/rose.png'
import star1 from '../../img/star1.png'
let animationTask, task, taskCur;

const images = {
    heart: heart,
    petal: petal,
    star: star1,
    lips: lips,
    rose: rose
}


export default function() {
    const canvasRef = React.useRef(null);

    // салют конфети
    const standart =(maxCount?: number)=> {
        //const canvas = canvasRef.current;
        const canvas = document.querySelector('.animCanvas');
        const ctx = canvas.getContext('2d');
        const particles = [];
        const colors = ['#FF5733', '#FFBD33', '#33FF57', '#33A1FF', '#9B33FF'];
        const numParticles = 150;                   // Количество частиц
        const numFireworks = maxCount ?? 6;         // Количество салютов

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Particle class to represent individual particles
        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.radius = Math.random() * 4;
                this.color = color;
                this.speed = Math.random() * 4 + 2;
                this.angle = Math.random() * Math.PI * 2;
                this.velocityX = Math.cos(this.angle) * this.speed;
                this.velocityY = Math.sin(this.angle) * this.speed;
                this.gravity = 0.1;
                this.alpha = 1;
                this.decay = Math.random() * 0.01; // Скорость исчезновения частиц
                this.fadeSpeed = Math.random() * 0.02 + 0.01;
            }

            update() {
                this.x += this.velocityX;
                this.y += this.velocityY;
                this.velocityY += this.gravity;
                this.alpha -= this.fadeSpeed;

                if (this.alpha <= 0) {
                this.alpha = 0;
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${parseInt(this.color.slice(1, 3), 16)}, ${parseInt(this.color.slice(3, 5), 16)}, ${parseInt(this.color.slice(5, 7), 16)}, ${this.alpha})`;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 15; // Эффект свечения
                ctx.fill();
            }
        }

        // Create fireworks at random locations
        const createParticles =(x, y)=> {
            for (let i = 0; i < numParticles; i++) {
                const color = colors[Math.floor(Math.random() * colors.length)];
                particles.push(new Particle(x, y, color));
            }
        };
        const animate =()=> {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle, index) => {
                particle.update();
                particle.draw();
                if (particle.alpha <= 0) {
                    particles.splice(index, 1);
                }
            });

            if (particles.length > 0) {
                requestAnimationFrame(animate);
            }
        };

        for (let i = 0; i < numFireworks; i++) {
            const x = Math.random() * canvas.width; // случайная позиция по оси X
            const y = Math.random() * (canvas.height / 2); // случайная позиция по оси Y (в верхней половине экрана)
            createParticles(x, y);
        }

        animate();
    }
    // салют из картинок
    const imageFireworks =(imgSrc, count?: number)=> {
        const heartImage = new Image();
        heartImage.src = imgSrc ?? heart;
        const colors = ['#FF5733', '#FFBD33', '#33FF57', '#33A1FF', '#9B33FF'];
        const numFireworks = count ?? 6;         // кол-во салютов
        const numParticles = 100;                // частиц в салюте

        //const canvas = canvasRef.current;
        const canvas = document.querySelector('.animCanvas');
        const ctx = canvas.getContext('2d');
        const particles = [];

        heartImage.onload =()=> {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
      
            class Particle {
                constructor(x, y, color) {
                    this.x = x;
                    this.y = y;
                    this.size = Math.random() * 50; // Размер сердечка
                    this.color = color;
                    this.speed = Math.random() * 3;
                    this.angle = Math.random() * Math.PI * 2;
                    this.gravity = 0.05;
                    this.alpha = 1;
                    this.fadeSpeed = Math.random() * 0.01 + 0.003;

                    if(isMobile()) {
                        this.speed *= 3;
                        this.fadeSpeed *= 3;
                        this.gravity *= 3;
                    }

                    this.velocityX = Math.cos(this.angle) * this.speed;
                    this.velocityY = Math.sin(this.angle) * this.speed;
                }
                update() {
                    this.x += this.velocityX;
                    this.y += this.velocityY;
                    this.velocityY += this.gravity;
                    this.alpha -= this.fadeSpeed;
        
                    if (this.alpha <= 0) {
                        this.alpha = 0;
                    }
                }
                draw() {
                    ctx.save();
                    ctx.globalAlpha = this.alpha;
                    ctx.drawImage(heartImage, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
                    ctx.restore();
                }
            }
      

            const createParticles =(x, y)=> {
                for (let i = 0; i < numParticles; i++) {
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    particles.push(new Particle(x, y, color));
                }
            };
            const animate =()=> {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
      
                particles.forEach((particle, index) => {
                    particle.update();
                    particle.draw();
                    if (particle.alpha <= 0) {
                    particles.splice(index, 1);
                    }
                });
      
                if (particles.length > 0) {
                    requestAnimationFrame(animate);
                }
            };
      
            for (let i = 0; i < numFireworks; i++) {
                const x = Math.random() * canvas.width;         // случайная позиция по оси X
                const y = Math.random() * (canvas.height / 3);  // случайная позиция по оси Y
                createParticles(x, y);
            }
      
            animate();
        };
    }
    // дождь из картинок
    const imgFall =(imgSrc, maxCount?: number)=> {
        const canvas = document.querySelector('.animCanvas');
        const ctx = canvas.getContext('2d');
        
        let particles = [];
        const petalImage = new Image();
        petalImage.src = imgSrc ?? petal;             // Путь к изображению лепестка
        const maxParticles = maxCount ?? 80;          // Максимальное количество частиц на экране
        const numParticles = 3;                       // количество новых картинок за один цикл

        petalImage.onload =()=> {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
      
            // Particle class to represent falling petals
            class Particle {
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                    this.size = rand.getRandom(40, 50); // Размер лепестка
                    this.speed = Math.random() * 2; // Увеличена скорость падения
                    this.angle = Math.random() * Math.PI * 2;
                    this.gravity = 0.005; // Меньшая гравитация
                    this.rotationSpeed = Math.random() * 0.05 - 0.025; // Вращение
                    this.rotation = Math.random() * Math.PI * 2;

                    if(isMobile()) {
                        this.speed *= 3;
                        this.fadeSpeed *= 3;
                        this.gravity *= 3;
                    }

                    this.velocityX = Math.cos(this.angle) * 0.5;
                    this.velocityY = Math.sin(this.angle) * this.speed; // Увеличена скорость падения
                }
                update() {
                    this.x += this.velocityX;
                    this.y += this.velocityY;
                    this.velocityY += this.gravity; // Добавляем гравитацию
                }
                draw() {
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.rotate(this.rotation);
                    ctx.drawImage(petalImage, -this.size, -this.size, this.size, this.size); // Рисуем лепесток
                    ctx.restore();
                }
            }
      
            // Создание нескольких частиц с случайными координатами
            const createParticles = () => {
                if (particles.length < maxParticles) {
                    for (let i = 0; i < numParticles; i++) {
                        const x = Math.random() * canvas.width; // случайная позиция по оси X
                        const y = -20; // Начальная позиция (сверху)
                        particles.push(new Particle(x, y));
                    }
                }
            };

            // Анимация с использованием requestAnimationFrame для плавности
            const animate =()=> {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Обновление и отрисовка частиц
                particles.forEach((particle, index) => {
                    particle.update();
                    particle.draw();
                    // Если частица вышла за пределы экрана, удаляем её
                    if (particle.y > canvas.height) {
                        particles.splice(index, 1);
                    }
                });

                // Создание новых частиц постепенно
                createParticles(); // Создаем новые лепестки каждую итерацию

                // Продолжаем анимацию, если лепестки ещё есть
                if (particles.length > 0) {
                    animationTask = requestAnimationFrame(animate);
                }
            };
      
            animate();
            stop(14000);
        };
    }
    // поцелуйчики
    const kiss =()=> {
        //const canvas = canvasRef.current;
        const canvas = document.querySelector('.animCanvas');
        const ctx = canvas.getContext('2d');
        const kissImage = new Image();
        kissImage.src = lips;
        const maxKisses = 1;            // Максимальное количество поцелуев на экране
        const kisses = [];

        kissImage.onload =()=> {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            class Kiss {
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                    this.size = rand.getRandom(140, 240); // Размер поцелуя
                    this.lifeTime = rand.getRandom(1500, 2500); // Время жизни (сколько времени изображение будет на экране)
                    this.spawnTime = Date.now(); // Время появления
                    this.rotation = rand.getRandom(-60, 60)/100;
                    this.alpha = 1;
                }
                draw() {
                    const elapsedTime = Date.now() - this.spawnTime;
                    const fadeOutTime = this.lifeTime; // Время, после которого поцелуй исчезает

                    // Уменьшаем непрозрачность с течением времени
                    this.alpha = Math.max(0, 1 - (elapsedTime / fadeOutTime));

                    ctx.save();
                    ctx.translate(this.x, this.y); // Перемещаем точку вращения в центр поцелуя
                    ctx.rotate(this.rotation); // Поворачиваем поцелуй на случайный угол

                    // Применяем прозрачность
                    ctx.globalAlpha = this.alpha;

                    // Рисуем поцелуй с учетом поворота и прозрачности
                    ctx.drawImage(kissImage, -this.size, -this.size, this.size, this.size);
                    ctx.restore();
                }
                isExpired() {
                    return Date.now() - this.spawnTime > this.lifeTime;
                }
            }

            const createKisses =()=> {
                if (kisses.length < maxKisses) {
                const numKisses = 1;            // Количество поцелуев, которое появится за один цикл
                for (let i = 0; i < numKisses; i++) {
                    const x = rand.getRandom(300, canvas.width-300); // Случайная позиция по оси X
                    const y = rand.getRandom(300, canvas.height-300); // Случайная позиция по оси Y
                    kisses.push(new Kiss(x, y));
                }
                }

                // Убираем поцелуи, которые уже вышли из срока жизни
                for (let i = kisses.length - 1; i >= 0; i--) {
                    if (kisses[i].isExpired()) {
                        kisses.splice(i, 1);
                    }
                }
            };
            const animate =()=> {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Отрисовываем поцелуи
                kisses.forEach(kiss => {
                    kiss.draw();
                });

                createKisses();
                animationTask = requestAnimationFrame(animate);
            };

            animate();
            stop(8000);
        };
    }
    // салют обычный с искрами
    const explosion =(count?: number)=> {
        if(taskCur) clearInterval(taskCur);
        let r = 0;
        const start =()=> {
            const canvas = document.querySelector('.animCanvas');
            const ctx = canvas.getContext('2d');

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const particles = [];
            const sparkImage = new Image();
            sparkImage.src = fire;
            const numParticles = rand.getRandom(80, 180);  // Количество частиц

            class Particle {
                constructor(x, y) {
                    this.x = x; // Положение частицы
                    this.y = y;
                    this.size = Math.random() * 70; // Начальный размер частицы
                    this.speedX = Math.random() * 6 - 3; // Горизонтальная скорость
                    this.speedY = Math.random() * 6 - 3; // Вертикальная скорость
                    this.alpha = 1; // Начальная прозрачность
                    this.decay = Math.random() * 0.0001; // Скорость исчезновения
                    this.rotation = Math.random() * Math.PI * 2; // Случайный угол
                    this.rotationSpeed = Math.random() * 0.1 - 0.05; // Скорость вращения

                    if(isMobile()) {
                        this.speed *= 3;
                        this.decay *= 3;
                        this.rotationSpeed *= 3;
                    }
                }

                update() {
                    this.x += this.speedX; // Обновляем положение
                    this.y += this.speedY;
                    this.alpha -= this.decay; // Уменьшаем прозрачность
                    this.size *= 0.991; // Постепенно уменьшаем размер
                    this.rotation += this.rotationSpeed; // Добавляем вращение
                }
                draw() {
                    if(sparkImage.complete) {
                        ctx.save();
                        ctx.globalAlpha = this.alpha;
                        ctx.translate(this.x, this.y);
                        ctx.rotate(this.rotation);
                        ctx.drawImage(
                            sparkImage,
                            -this.size / 2,
                            -this.size / 2,
                            this.size,
                            this.size
                        );
                        ctx.restore();
                    }
                }
                isAlive() {
                    return this.alpha > 0 && this.size > 1; // Частьцы "умирают", когда становятся совсем маленькими или прозрачными
                }
            }

            const createExplosion =(x, y)=> {
                for (let i = 0; i < numParticles; i++) {
                    particles.push(new Particle(x, y));
                }
            };

            const animate =()=> {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
        
                particles.forEach((particle, index)=> {
                    if (particle.isAlive()) {
                        particle.update();
                        particle.draw();
                    } 
                    else {
                        particles.splice(index, 1); // Удаляем "мертвые" частицы
                    }
                });
        
                requestAnimationFrame(animate);
            };

            for (let i = 0; i < (count ?? 1); i++) {
                const x = Math.random() * canvas.width;         // случайная позиция по оси X
                const y = Math.random() * (canvas.height-200);  // случайная позиция по оси Y
                createExplosion(x, y);
            }
            animate();
        }

        taskCur = setInterval(()=> {
            if(r < 5 ) {
                count = r+2
                start();
                r++;
            }
            else clearInterval(taskCur);
        }, 1000);
    }
    // салют с разноцветными искрами
    const explosionRainbow =(count?: number)=> {
        const canvas = document.querySelector('.animCanvas');
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.background = '#0000004d';

        let oneExplosion = false;
        const particles = [];
        const textures = [fire, fire1, fire2, fire3];
        const numParticles = rand.getRandom(80, 180);  // Количество частиц

        class Particle {
            constructor(x, y, textureSrc) {
                this.x = x; // Положение частицы
                this.y = y;
                this.size = Math.random() * 70; // Начальный размер частицы
                this.speedX = Math.random() * 6 - 3; // Горизонтальная скорость
                this.speedY = Math.random() * 6 - 3; // Вертикальная скорость
                this.alpha = 1; // Начальная прозрачность
                this.decay = Math.random() * 0.0001; // Скорость исчезновения
                this.rotation = Math.random() * Math.PI * 2; // Случайный угол
                this.rotationSpeed = Math.random() * 0.1 - 0.05; // Скорость вращения

                this.image = new Image();
                this.image.src = textureSrc;
            }
            update() {
                this.x += this.speedX; // Обновляем положение
                this.y += this.speedY;
                this.alpha -= this.decay; // Уменьшаем прозрачность
                this.size *= 0.991; // Постепенно уменьшаем размер
                this.rotation += this.rotationSpeed; // Добавляем вращение
            }
            draw() {
                if(this.image.complete) {
                    ctx.save();
                    ctx.globalAlpha = this.alpha;
                    ctx.translate(this.x, this.y);
                    ctx.rotate(this.rotation);
                    ctx.drawImage(
                        this.image,
                        -this.size / 2,
                        -this.size / 2,
                        this.size,
                        this.size
                    );
                    ctx.restore();
                }
            }
            isAlive() {
                return this.alpha > 0 && this.size > 1; // Частьцы "умирают", когда становятся совсем маленькими или прозрачными
            }
        }

        const createExplosion =(x, y)=> {
            for (let i = 0; i < numParticles; i++) {
                const texture = textures[Math.floor(Math.random() * textures.length)];
                particles.push(new Particle(x, y, texture));
            }
            oneExplosion = true;
        };

        const animate =()=> {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
      
            particles.forEach((particle, index)=> {
                if(particle.isAlive()) {
                    particle.update();
                    particle.draw();
                } 
                else {
                    particles.splice(index, 1); // Удаляем "мертвые" частицы
                }
            });
      
            animationTask = requestAnimationFrame(animate);
            if(oneExplosion && !particles[0]) clear();
        };

        for (let i = 0; i < (count ?? 1); i++) {
            const x = Math.random() * canvas.width;         // случайная позиция по оси X
            const y = Math.random() * (canvas.height-200);  // случайная позиция по оси Y
            createExplosion(x, y);
        }
        animate();
    }
    // салют с разноцветными искрами и ракетой
    const rocket =(xStart?: number, yStart?: number, count?: number)=> {
        const canvas = document.querySelector('.animCanvas');
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.background = '#0000004d';

        let oneExplosion = false;
        const x = xStart ?? 60;
        const y = yStart ?? canvas.height;
        const rockets = [];
        const explosions = [];
        const textures = [fire, fire1, fire2, fire3];

        class Rocket {
            constructor(startX, startY, targetX, targetY) {
                this.x = startX; // Стартовые координаты
                this.y = startY;
                this.targetX = targetX; // Точка взрыва
                this.targetY = targetY;
                this.speed = 4 + Math.random() * 4; // Скорость ракеты
                this.angle = Math.atan2(targetY - startY, targetX - startX);
                this.trail = []; // След ракеты
                this.maxTrailLength = 10;
                if(isMobile()) this.speed *= 3;
            }
            update() {
                this.trail.push({ x: this.x, y: this.y });
                if (this.trail.length > this.maxTrailLength) {
                    this.trail.shift();
                }
                
                const dx = Math.cos(this.angle) * this.speed;
                const dy = Math.sin(this.angle) * this.speed;
                this.x += dx;
                this.y += dy;

                // Проверка, достигла ли ракета точки взрыва
                const distanceToTarget = Math.hypot(this.targetX - this.x, this.targetY - this.y);
                if (distanceToTarget < this.speed) {
                    canvas.style.background = '#f3f2f24d';
                    this.explode();
                    setTimeout(()=> canvas.style.background = '#0000004d', 100);
                }
            }
            draw() {
                // Рисуем след ракеты
                ctx.save();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.beginPath();
                this.trail.forEach((point, index) => {
                if (index === 0) ctx.moveTo(point.x, point.y);
                    else ctx.lineTo(point.x, point.y);
                });
                ctx.stroke();
                ctx.restore();

                // Рисуем ракету
                ctx.save();
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            explode() {
                // Создание салюта
                explosions.push(new Explosion(this.targetX, this.targetY));
                const index = rockets.indexOf(this);
                if(index > -1) rockets.splice(index, 1); // Удаляем ракету
                oneExplosion = true;
                if(!rockets[0]) setTimeout(()=> canvas.style.background = '', 200);
            }
        }
        class Explosion {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.particles = [];

                for (let i = 0; i < 50; i++) {
                    const texture = textures[Math.floor(Math.random() * textures.length)]; // Случайная текстура
                    this.particles.push(new Particle(x, y, texture));
                }
            }
            update() {
                this.particles = this.particles.filter((particle)=> particle.isAlive());
                this.particles.forEach((particle)=> particle.update());
                if(!this.particles[0]) {
                    const index = explosions.indexOf(this);
                    explosions.splice(index, 1);
                }
            }
            draw() {
                this.particles.forEach((particle)=> particle.draw());
            }
        }
        class Particle {
            constructor(x, y, textureSrc) {
                this.x = x; // Положение частицы
                this.y = y;
                this.size = Math.random() * 70; // Начальный размер частицы
                this.speedX = Math.random() * 6 - 3; // Горизонтальная скорость
                this.speedY = Math.random() * 6 - 3; // Вертикальная скорость
                this.alpha = 1; // Начальная прозрачность
                this.decay = Math.random() * 0.0001; // Скорость исчезновения
                this.rotation = Math.random() * Math.PI * 2; // Случайный угол
                this.rotationSpeed = Math.random() * 0.1 - 0.05; // Скорость вращения

                this.image = new Image();
                this.image.src = textureSrc;
                if(isMobile()) {
                    this.speed *= 3;
                    this.decay *= 3;
                }
            }
            update() {
                this.x += this.speedX; // Обновляем положение
                this.y += this.speedY;
                this.alpha -= this.decay; // Уменьшаем прозрачность
                this.size *= 0.991; // Постепенно уменьшаем размер
                this.rotation += this.rotationSpeed; // Добавляем вращение
            }
            draw() {
                if(this.image.complete) {
                    ctx.save();
                    ctx.globalAlpha = this.alpha;
                    ctx.translate(this.x, this.y);
                    ctx.rotate(this.rotation);
                    ctx.drawImage(
                        this.image,
                        -this.size / 2,
                        -this.size / 2,
                        this.size,
                        this.size
                    );
                    ctx.restore();
                }
            }
            isAlive() {
                return this.alpha > 0 && this.size > 1; // Частьцы "умирают", когда становятся совсем маленькими или прозрачными
            }
        }

        const launchRocket =(startX, startY)=> {
            //const startX = Math.random() * canvas.width;
            //const startY = canvas.height;
            const targetX = Math.random() * canvas.width;
            const targetY = Math.random() * (canvas.height - (canvas.height*0.3));
            rockets.push(new Rocket(startX, startY, targetX, targetY));
        };
        const animate =(timeshtamp)=> {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            rockets.forEach((rocket) => {
                rocket.update();
                rocket.draw();
            });

            explosions.forEach((explosion) => {
                explosion.update();
                explosion.draw();
            });

            animationTask = requestAnimationFrame(animate);
            if(oneExplosion && !explosions[0]) clear();
        };


        if(count) {
            for(let i = 0; i < count; i++) {
                launchRocket(x, y);
            }
        }
        else launchRocket(x, y);
        animate();
    }
    // салют с кастомными картинками и ракетой
    const customRocket =(image?:any, count?: number)=> {
        const canvas = document.querySelector('.animCanvas');
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.background = '#0000004d';

        const x = 60;
        const y = canvas.height;
        let oneExplosion = false;
        const rockets = [];
        const explosions = [];

        class Rocket {
            constructor(startX, startY, targetX, targetY) {
                this.x = startX; // Стартовые координаты
                this.y = startY;
                this.targetX = targetX; // Точка взрыва
                this.targetY = targetY;
                this.speed = 4 + Math.random() * 3; // Скорость ракеты
                this.angle = Math.atan2(targetY - startY, targetX - startX);
                this.trail = []; // След ракеты
                this.maxTrailLength = 10;

                if(isMobile()) {
                    this.speed *= 3;
                }
            }
            update() {
                this.trail.push({ x: this.x, y: this.y });
                if (this.trail.length > this.maxTrailLength) {
                    this.trail.shift();
                }

                const dx = Math.cos(this.angle) * this.speed;
                const dy = Math.sin(this.angle) * this.speed;
                this.x += dx;
                this.y += dy;

                // Проверка, достигла ли ракета точки взрыва
                const distanceToTarget = Math.hypot(this.targetX - this.x, this.targetY - this.y);
                if (distanceToTarget < this.speed) {
                    canvas.style.background = '#f3f2f24d';
                    this.explode();
                    setTimeout(()=> canvas.style.background = '#0000004d', 100);
                }
            }
            draw() {
                // Рисуем след ракеты
                ctx.save();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.beginPath();
                this.trail.forEach((point, index) => {
                    if (index === 0) ctx.moveTo(point.x, point.y);
                    else ctx.lineTo(point.x, point.y);
                });
                ctx.stroke();
                ctx.restore();

                // Рисуем ракету
                ctx.save();
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            explode() {
                // Создание салюта
                explosions.push(new Explosion(this.targetX, this.targetY));
                const index = rockets.indexOf(this);
                if(index > -1) rockets.splice(index, 1); // Удаляем ракету
                oneExplosion = true;
                if(!rockets[0]) setTimeout(()=> canvas.style.background = '', 200);
            }
        }
        class Explosion {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.particles = [];

                if(!image) {
                    const random = Object.values(images);
                    const src = random[rand.getRandom(0, random.length-1)];

                    for (let i = 0; i < 50; i++) {
                        this.particles.push(new Particle(x, y, src));
                    }
                }
                else for (let i = 0; i < 50; i++) {
                    this.particles.push(new Particle(x, y, images[image]));
                }
            }
            update() {
                this.particles = this.particles.filter((particle)=> particle.isAlive());
                this.particles.forEach((particle)=> particle.update());

                if(!this.particles[0]) {
                    const index = explosions.indexOf(this);
                    explosions.splice(index, 1);
                }
            }
            draw() {
                this.particles.forEach((particle)=> particle.draw());
            }
        }
        class Particle {
            constructor(x, y, texture) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 50; // Размер сердечка
                this.speed = Math.random() * 3;
                this.angle = Math.random() * Math.PI * 2;
                this.velocityX = Math.cos(this.angle) * this.speed;
                this.velocityY = Math.sin(this.angle) * this.speed;
                this.gravity = 0.05;
                this.alpha = 1;
                this.fadeSpeed = Math.random() * 0.01 + 0.003;
                this.texture = new Image();
                this.texture.src = texture;

                if(isMobile()) {
                    this.speed *= 3;
                    this.fadeSpeed *= 3;
                    this.gravity *= 3;
                }
            }
            update() {
                this.x += this.velocityX;
                this.y += this.velocityY;
                this.velocityY += this.gravity;
                this.alpha -= this.fadeSpeed;
    
                if (this.alpha <= 0) {
                    this.alpha = 0;
                }
            }
            draw() {
                if(this.texture.complete) {
                    ctx.save();
                    ctx.globalAlpha = this.alpha;
                    ctx.drawImage(this.texture, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
                    ctx.restore();
                }
            }
            isAlive() {
                return this.alpha > 0 && this.size > 1; // Частьцы "умирают", когда становятся совсем маленькими или прозрачными
            }
        }

        const launchRocket =(startX, startY)=> {
            //const startX = Math.random() * canvas.width;
            //const startY = canvas.height;
            const targetX = Math.random() * canvas.width;
            const targetY = Math.random() * (canvas.height - (canvas.height*0.3));
            rockets.push(new Rocket(startX, startY, targetX, targetY));
        };
        const animate =()=> {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            rockets.forEach((rocket) => {
                rocket.update();
                rocket.draw();
            });

            explosions.forEach((explosion) => {
                explosion.update();
                explosion.draw();
            });

            animationTask = requestAnimationFrame(animate);
            if(oneExplosion && !explosions[0]) clear();
        };


        if(count) {
            for(let i = 0; i < count; i++) {
                launchRocket(x, y);
            }
        }
        else launchRocket(x, y);
        animate();
    }


    const clear =()=> {
        const canvas = document.querySelector('.animCanvas');

        if(canvas) {
            cancelAnimationFrame(animationTask);
            clearTimeout(task);
            task = undefined;
            canvas.remove();
        }
    }
    const stop =(timeout?: number)=> {
        if(task !== undefined) clear();
        task = setTimeout(()=> {
            clear();
        }, timeout ?? 4000);
    }
    const create =()=> {
        const style = { 
            'z-index': 100,
            position: "absolute",
            display: "block", 
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
        }
        const canvas = document.createElement('canvas');
        canvas.className = 'animCanvas';
        Object.keys(style).forEach((key)=> {
            canvas.style[key] = style[key];
        });

        document.querySelector('.Container').appendChild(canvas);
    }
    const controller =(data: EventAnimation)=> {
        clear();
        create();
        if(taskCur) clearInterval(taskCur);
        if(data.type === 'kiss') kiss();
        else if(data.type === 'fier') standart(data.count);
        else if(data.type === 'exp') explosion(data.count);
        else if(data.type === 'rocket') rocket(data.x, data.y, data.count);
        else if(data.type === 'fall') imgFall(images[data.image], data.count);
        else if(data.type === 'imgFier') imageFireworks(images[data.image], data.count);
        else if(data.type === 'expRainbow') explosionRainbow(data.count);
        else if(data.type === 'specRocket') customRocket(data.image, data.count);
    }
    useDidMount(()=> {
        EVENT.on('anim', (data)=> {
            controller(data);
        });
        document.addEventListener("keydown", (ev)=> {
            if(import.meta.env.DEV) {
                if(ev.key === '1') EVENT.emit('anim', {type: 'kiss'});
                else if(ev.key === '2') EVENT.emit('anim', {type: 'fier', count: 3});
                else if(ev.key === '3') EVENT.emit('anim', {type: 'exp', count: 3});
                else if(ev.key === '4') EVENT.emit('anim', {type: 'rocket', count: 12});
                else if(ev.key === '5') EVENT.emit('anim', {type: 'fall', image: 'petal'});
                else if(ev.key === '6') EVENT.emit('anim', {type: 'expRainbow', count: 6});
                else if(ev.key === '7') EVENT.emit('anim', {type: 'imgFier', image: 'heart', count: 3});
                else if(ev.key === '8') EVENT.emit('anim', {type: 'imgFier', image: 'star', count: 3});
                else if(ev.key === '9') EVENT.emit('anim', {type: 'imgFier', image: 'lips', count: 3});
                else if(ev.key === '0') {
                    clear();
                    create();
                    customRocket(undefined, 12);
                }
                else if(ev.key === '-') {
                    clear();
                    create();
                    customRocket('lips', 12);
                }
            }
        });
    });
    useWillUnmount(()=> {
        EVENT.off('anim', (data)=> {
            controller(data);
        });
    });
    

    
    return(
        <React.Fragment>

        </React.Fragment>
    );
}
