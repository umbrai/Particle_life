let swarm = [];
let forces = [];
let minDistances = [];
let radii = [];

const numTypes = 5;
const colorStep = 360 / numTypes;
const numParticles = 1000;
const K = 0.06;
const friction = 0.85;

function setup() {
  createCanvas(1272, 562);
  colorMode(HSB, 360, 100, 100);
  noStroke();

  // Initialize particles
  for (let i = 0; i < numParticles; i++) {
    swarm.push(new Particle());
  }

  // Initialize force matrices
  for (let i = 0; i < numTypes; i++) {
    forces[i] = [];
    minDistances[i] = [];
    radii[i] = [];
  }
  setParameters();
}

function draw() {
  background(0);

  // Update and display particles
  for (let p of swarm) {
    p.update();
    p.display();
  }
}

function keyPressed() {
  if (key === ' ') { // Press Space to reset parameters
    precomputed = false;
    setParameters();
    console.log("Parameters reset");
  }
}

let precomputed = false;

function setParameters() {
  if (precomputed) return; // Skip if already precomputed
  for (let i = 0; i < numTypes; i++) {
    for (let j = 0; j < numTypes; j++) {
      forces[i][j] = random(0.3, 1.0);
      if (random(100) < 50) {
        forces[i][j] *= -1;
      }
      minDistances[i][j] = random(30, 50);
      radii[i][j] = random(70, 250);
    }
  }
  precomputed = true;
}



class Particle {
    constructor() {
      this.position = createVector(random(width), random(height));
      this.velocity = createVector(0, 0);
      this.acceleration = createVector(0, 0); // Add missing acceleration
      this.type = int(random(numTypes));
    }
  
    update() {
      this.acceleration.set(0, 0); // Reset acceleration
      let totalForce = createVector(0, 0);
      let direction = createVector(0, 0);
  
      for (let other of swarm) {
        if (other !== this) {
          direction = p5.Vector.sub(other.position, this.position);
      
          // Handle wrap-around screen edges
          if (direction.x > 0.5 * width) direction.x -= width;
          if (direction.x < -0.5 * width) direction.x += width;
          if (direction.y > 0.5 * height) direction.y -= height;
          if (direction.y < -0.5 * height) direction.y += height;
      
          let dis = direction.mag();
      
          // Skip if distance exceeds max influence radius
          if (dis > max(radii[this.type])) continue;
      
          direction.normalize();
      
          // Attraction or repulsion based on force parameters
          if (dis < minDistances[this.type][other.type]) {
            let force = direction.copy();
            force.mult(abs(forces[this.type][other.type]) * -3);
            force.mult(map(dis, 0, minDistances[this.type][other.type], 1, 0));
            force.mult(K);
            totalForce.add(force);
          }
      
          if (dis < radii[this.type][other.type]) {
            let force = direction.copy();
            force.mult(forces[this.type][other.type]);
            force.mult(map(dis, 0, radii[this.type][other.type], 1, 0));
            force.mult(K);
            totalForce.add(force);
          }
        }
      }
      
  
      // Apply total force as acceleration
      this.acceleration.add(totalForce);
  
      // Update velocity and position
      this.velocity.add(this.acceleration);
      this.position.add(this.velocity);
  
      // Wrap-around the edges
      this.position.x = (this.position.x + width) % width;
      this.position.y = (this.position.y + height) % height;
  
      // Apply friction to velocity
      this.velocity.mult(friction);
    }
  
    display() {
      fill(this.type * colorStep, 100, 100);
      circle(this.position.x, this.position.y, 5);
    }
  }