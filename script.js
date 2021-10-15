"use strict";
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#scoreEl');
const startGame = document.querySelector('#startGame');
const modal = document.querySelector('#modal');
const healthCount = document.querySelector('#healthCount');
const speed = document.querySelector('#speed');
const highScore = document.querySelector('#highScore');
const modalHighScore = document.querySelector('#highScoreDisplay')
let animationId;
let timer = 2000;
let interval;
let score = 0;
let health = 3;

//sets highscore to latest highscore achieved if exists else sets it to 0
highScore.innerHTML = localStorage.getItem('highscore') || 0;
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
    timer = 2000;
    speed.innerHTML = timer + "ms";
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

        //end game
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - enemy.radius - player.radius < 1) {
            health -= 1;
            if (health == 0) {
                healthCount.innerHTML = health;
                cancelAnimationFrame(animationId);
                modal.classList.replace('hidden', 'flex');
                document.querySelector('h2').innerText = score;
                document.querySelector('#scorePts').classList.replace('hidden', 'block');
                document.querySelector('button').innerText = 'Restart Game';
                if (highScore.innerHTML < score) {
                    document.querySelector('#highScoreDisplay').innerHTML = score;
                    highScore.innerHTML = score
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

                //changes the spawn rate by 4ms everytime a projectile collides with enemies
                timer == 300 ? timer : timer -= 4;
                speed.innerHTML = timer + 'ms';
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
                    score += 100;
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
                    score += 250;
                    scoreEl.innerHTML = score;

                    //kills(removes from array) enemies if there radius is less than 15
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0);
                }
            }
        })
    });
}

//starts the game
startGame.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
    modal.classList.replace('flex', 'hidden');
})