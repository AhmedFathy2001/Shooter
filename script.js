"use strict";
window.addEventListener('load', () => {
    const canvas = document.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.querySelector('#scoreEl');
    const startGame = document.querySelector('#startGame');
    const modal = document.querySelector('#modal');
    const healthCount = document.querySelector('#healthCount');
    const modalHighScore = document.querySelector('#highScoreDisplay');
    const pause = document.getElementById('pause');
    const difficulty = Array.from(document.querySelectorAll("input[name='difficulty']"));
    let animationId;
    let timer = 2000;
    let interval;
    let score = 0;
    let health = 3;
    let pausing = false;

    //sets highscore to latest highscore achieved if exists else sets it to 0
    modalHighScore.innerHTML = localStorage.getItem('highscore') || 0;

    //Canvas height/width
    canvas.width = innerWidth;
    canvas.height = innerHeight;


    //creates player
    class Player {
        constructor(x, y, radius, color) {
            this.radius = radius;
            this.x = x;
            this.y = y;
            this.color = color;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    //creates projectiles
    class Projectile {
        constructor(x, y, radius, color, velocity) {
            this.x = x;
            this.y = y;
            this.radius = radius
            this.color = color;
            this.velocity = velocity;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        update() {
            this.draw();

            this.x = this.x + this.velocity.x;
            this.y = this.y + this.velocity.y;
        }
    }

    //creates enemies
    class Enemy {
        constructor(x, y, radius, color, velocity) {
            this.x = x;
            this.y = y;
            this.radius = radius
            this.color = color;
            this.velocity = velocity;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        update() {
            this.draw();

            this.x = this.x + this.velocity.x;
            this.y = this.y + this.velocity.y;
        }
    }
    const friction = 0.99;

    //creates explosive particles
    class Particle {
        constructor(x, y, radius, color, velocity) {
            this.x = x;
            this.y = y;
            this.radius = radius
            this.color = color;
            this.velocity = velocity;
            this.alpha = 1
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
        update() {
            this.draw();
            this.velocity.x *= friction;
            this.velocity.y *= friction;

            this.x = this.x + this.velocity.x;
            this.y = this.y + this.velocity.y;
            this.alpha -= 0.01;
        }
    }


    //centers the player
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    let player = new Player(x, y, 10, 'white');
    let projectiles = [];
    let enemies = [];
    let particles = [];
    let difficultyValue;

    //Re initializes the game settings
    function init() {
        player = new Player(x, y, 10, 'white');
        projectiles = [];
        enemies = [];
        particles = [];
        score = 0;
        scoreEl.innerHTML = 0;
        health = 3;
        healthCount.innerHTML = health;
        //sets difficulty
        for (let i = 0; i < difficulty.length; i++) {
            if (difficulty[i].id == 'easy' && difficulty[i].checked) {
                timer = 2000;
                difficultyValue = 'easy';
                return;
            } else if (difficulty[i].id == 'meduim' && difficulty[i].checked) {
                timer = 1250;
                difficultyValue = 'meduim';
                return;
            } else if (difficulty[i].id == 'hard' && difficulty[i].checked) {
                timer = 750;
                difficultyValue = 'hard';
                return;
            }
        }
    }


    //adds a spawn timer for the enemies
    function spawnEnemies() {
        // Clears the previous setInterval timer
        clearInterval(interval);
        const radius = canvas.width > 500 ? Math.random() * (30 - 10) + 10 : Math.random() * (20 - 10) + 10;
        let x;
        let y;
        if (Math.random() < .5) {
            x = Math.random() < .5 ? canvas.width + radius : 0 - radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < .5 ? canvas.height + radius : 0 - radius;
        }
        const color = `hsl(${Math.random()*360}, 50%, 50%)`
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(x, y, radius, color, velocity));

        interval = setInterval(spawnEnemies, timer);
    }

    let holding = false;
    let mousePosition;
    window.addEventListener('mousedown', function() {
        holding = true;
    });
    window.addEventListener('click', function(e) {
        const angle = Math.atan2(e.clientY - y, e.clientX - x);
        const velocity = {
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5
        }
        projectiles.push(new Projectile(x, y, 5, 'white', {
            x: velocity.x,
            y: velocity.y
        }));
    });

    let moves = 0;
    canvas.addEventListener('mousemove', (e) => {
        mousePosition = e
        moves++;
        let difficultyComplex = 200;
        switch (difficultyValue) {
            case 'easy':
                difficultyComplex = 150;
                break;
            case 'meduim':
                difficultyComplex = 125;
                break;
            case 'hard':
                difficultyComplex = 100;
                break;
            default:
                difficultyComplex = 200;
        }
        console.log(difficultyComplex);
        let movesDifficulity = moves % difficultyComplex
        if (holding && movesDifficulity == 0) {
            console.log(movesDifficulity);
            const angle = Math.atan2(mousePosition.clientY - y, mousePosition.clientX - x);
            const velocity = {
                x: Math.cos(angle) * 5,
                y: Math.sin(angle) * 5
            }
            projectiles.push(new Projectile(x, y, 5, 'white', {
                x: velocity.x,
                y: velocity.y
            }));
        }
    });
    window.addEventListener('mouseup', function() {
        holding = false;
    });

    //creates the projectile on click
    window.addEventListener('click', (e) => {
        const angle = Math.atan2(e.clientY - y, e.clientX - x);
        const velocity = {
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5
        }
        projectiles.push(new Projectile(x, y, 5, 'white', {
            x: velocity.x,
            y: velocity.y
        }));
    });

    document.body.addEventListener('touchstart', (e) => {
        let touches = e.touches;

        //Handles multi touch taps
        if (touches.length > 1) {
            for (let index = 0; index < touches.length; index++) {
                const angle = Math.atan2(touches.item(index).clientY - y, touches.item(index).clientX - x);
                const velocity = {
                    x: Math.cos(angle) * 5,
                    y: Math.sin(angle) * 5
                }
                projectiles.push(new Projectile(x, y, 5, 'white', {
                    x: velocity.x,
                    y: velocity.y
                }));
            }
        } else {
            //if only one tap was detected
            const angle = Math.atan2(e.clientY - y, e.clientX - x);
            const velocity = {
                x: Math.cos(angle) * 5,
                y: Math.sin(angle) * 5
            }
            projectiles.push(new Projectile(x, y, 5, 'white', {
                x: velocity.x,
                y: velocity.y
            }));
        }
    });

    //runs the animation
    function animate() {
        //gets current animation frame and runs an infinite loop around it to keep the animation running til the player dies
        animationId = requestAnimationFrame(animate);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, x * 2, y * 2);
        player.draw();

        //explosion particles
        particles.forEach((particle, index) => {
            //removes the particles from the array if there opacity hits 0
            if (particle.alpha <= 0) {
                particles.splice(index, 1);
            } else {
                particle.update();
            }
        });

        //creates the projectiles
        projectiles.forEach((projectile, index) => {
            projectile.update();

            //removes the projectiles from the array if they're offscreen
            if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width ||
                projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) {
                setTimeout(() => {
                    projectiles.splice(index, 1)
                }, 0);
            }
        })

        // creates the enemies
        enemies.forEach((enemy, index) => {
            enemy.update();

            //ends the game (or reduced lives)
            const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
            if (dist - enemy.radius - player.radius < 1) {
                health -= 1;
                document.querySelector('#death').classList.add('death-count');
                setTimeout(() => {
                    document.querySelector('#death').classList.remove('death-count');
                }, 200)
                if (health == 0) {
                    healthCount.innerHTML = health;
                    cancelAnimationFrame(animationId);
                    modal.classList.replace('hidden', 'flex');
                    document.querySelector('h2').innerText = score;
                    document.querySelector('#scorePts').classList.replace('hidden', 'block');
                    document.querySelector('button').innerText = 'Restart Game';
                    pause.classList.add('hidden');
                    if (modalHighScore.innerHTML < score) {
                        modalHighScore.innerHTML = score;
                        localStorage.setItem('highscore', score);
                    }
                } else {
                    healthCount.innerHTML = health;
                    enemies.splice(index, 1);
                }
            }
            //collision handling for the projectiles with the enemies
            projectiles.forEach((projectile, projectileIndex) => {
                const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
                if (dist - enemy.radius - projectile.radius < 1) {

                    //changes the spawn rate depending on the difficulty with every collision
                    switch (difficultyValue) {
                        case 'easy':
                            timer <= 1000 ? timer : timer -= 4;
                            break;
                        case 'meduim':
                            timer <= 600 ? timer : timer -= 3;
                            break;
                        case 'hard':
                            timer <= 300 ? timer : timer -= 2;
                            break;
                        default:
                            timer = 1000;
                    }

                    //creates explosion particles
                    for (let index = 0; index < enemy.radius * 2; index++) {
                        particles.push(new Particle(projectile.x, projectile.y,
                            Math.random() * 2, enemy.color, {
                                x: (Math.random() - 0.5) * (Math.random() * 6),
                                y: (Math.random() - 0.5) * (Math.random() * 6)
                            }));
                    }
                    //shrinks enemies sizes by 10 per hit if there radius is more than 15
                    if (enemy.radius - 10 > 5) {
                        //increment the score on shrink
                        difficultyValue == 'easy' ? score += 50 :
                            difficultyValue == 'meduim' ? score += 150 :
                            score += 250;
                        scoreEl.innerHTML = score;

                        //animation of shrinking
                        gsap.to(enemy, {
                            radius: enemy.radius - 10
                        });
                        setTimeout(() => {
                            projectiles.splice(projectileIndex, 1)
                        }, 0)

                    } else {

                        //increment the score on killing the enemy
                        difficultyValue == 'easy' ? score += 150 :
                            difficultyValue == 'meduim' ? score += 200 :
                            score += 350;
                        scoreEl.innerHTML = score;

                        //kills (removes from array) enemies if there radius is less than 15

                        enemies.splice(index, 1);
                        projectiles.splice(projectileIndex, 1)
                    }
                }
            })
        });
    }

    //starts the game
    startGame.addEventListener('click', (e) => {
        e.stopPropagation();
        init();
        animate();
        spawnEnemies();
        modal.classList.replace('flex', 'hidden');
        pause.classList.remove('hidden');
    });

    //prevents right click actions for smoother gameplay
    document.addEventListener('contextmenu', event => event.preventDefault());


    //Pauses/resumes the game
    window.addEventListener('blur', () => {
        if (modal.classList.contains('flex')) {
            return;
        } else {
            pause.classList.replace('fa-pause-circle', 'fa-play-circle');
            pause.classList.add('paused');
            cancelAnimationFrame(animationId);
            clearInterval(interval);
            pausing = true;
        }

    });

    pause.addEventListener('click', (e) => {
        e.stopPropagation();
        if (pausing) {
            animate();
            setTimeout(spawnEnemies, 2000);
            pausing = false;
            pause.classList.replace('fa-play-circle', 'fa-pause-circle');
            pause.classList.remove('paused');

        } else {
            pause.classList.replace('fa-pause-circle', 'fa-play-circle');
            pause.classList.add('paused');
            cancelAnimationFrame(animationId);
            clearInterval(interval);
            pausing = true;
        }
    });
});