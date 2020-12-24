
function makenDimSquareArray(n, size) {
    if (n == 0) {
        return 0;
    } else {
        let out = [];
        for (let i = 0; i < size; i++) {
            out.push(makenDimSquareArray(n - 1, size));
        }
        return out;
    }
}

class FluidSquare {
    size;  // int
    dt;  // float
    t = 0;  // float
    diff;  // float
    visc;  // float
    source;  // float array
    density;  // float array
    density0;  // float array
    vx;  // float array
    vy;  // float array
    vx0;  // float array
    vy0;  // float array
    canvas;
    context;
    gridSize;  // int
    it = 0;  // int
    interval;

    constructor(size, diffusion, viscosity, dt, canvas, gridSize) {
        this.size = size;
        this.dt = dt;
        this.diffusion = diffusion;
        this.viscosity = viscosity;
        this.source = makenDimSquareArray(2, size);
        this.density = makenDimSquareArray(2, size);
        this.density0 = makenDimSquareArray(2, size);
        this.vx = makenDimSquareArray(2, size);
        this.vy = makenDimSquareArray(2, size);
        this.vx0 = makenDimSquareArray(2, size);
        this.vy0 = makenDimSquareArray(2, size);
        this.canvas = canvas;
        canvas.width = size * gridSize;
        canvas.height = size * gridSize;
        this.context = canvas.getContext('2d');
        this.gridSize = gridSize;
        canvas.onmousemove = this.handleMouse.bind(this);
    }

    handleMouse(event) {
        let x = event.clientX - this.canvas.offsetLeft;
        let y = event.clientY - this.canvas.offsetTop;
        if (0 <= x && x < this.canvas.width && 0 <= y && y < this.canvas.height) {
            let fx = Math.floor(x / this.gridSize);
            let fy = Math.floor(y / this.gridSize);
            this.source[fx][fy] += 10 * this.dt;
            this.vx[fx][fy] += Math.cos(this.t / 250) * 20 * this.dt;
            this.vy[fx][fy] += Math.sin(this.t / 250) * 20 * this.dt;
            // TODO: add mouse velocity
        }
    }

    start() {
        function mainloop(t) {
            t.step();
            t.draw();
            t.t += t.dt;
            t.it++;
        }
        this.interval = setInterval(() => mainloop(this), this.dt * 1000);
    }

    step() {
        let iterations = 50;

        this.swapVelocities();
        this.diffuseVelocity(iterations);
        this.swapVelocities();
        this.project(iterations);
        this.swapVelocities();
        this.advectVelocity();
        this.swapVelocities();
        this.project(iterations);

        this.addDensityFromSource();
        this.clearSource();
        this.swapDensity();
        this.diffuseDensity(iterations);
        this.swapDensity();
        this.advectDensity();
        this.fadeDensity();
    }

    addDensityFromSource() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.density[i][j] += this.source[i][j] * this.dt;
            }
        }
    }

    clearSource() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.source[i][j] -= this.source[i][j];
            }
        }
    }

    swapVelocities() {
        let temp_vx = this.vx;
        let temp_vx0 = this.vx0;
        let temp_vy = this.vy;
        let temp_vy0 = this.vy0;
        this.vx = temp_vx0;
        this.vx0 = temp_vx;
        this.vy = temp_vy0;
        this.vy0 = temp_vy;
    }

    swapDensity() {
        let temp_d = this.density;
        let temp_d0 = this.density0;
        this.density = temp_d0;
        this.density0 = temp_d;
    }

    diffuseVelocity(iterations) {
        // use Gauss-Siedel to solve backwards diffusion problem
        let N = this.size;
        let a = this.dt * this.viscosity * N * N;
        let vx = this.vx;
        let vx0 = this.vx0;
        let vy = this.vy;
        let vy0 = this.vy0;
        for (let it = 0; it < iterations; it++) {
            for (let i = 1; i < N - 1; i++) {
                for (let j = 1; j < N - 1; j++) {
                    vx[i][j] = (vx0[i][j] + a * vx[i-1][j] + vx[i+1][j] + vx[i][j-1] + vx[i][j+1]) / (1 + 4 * a);
                    vy[i][j] = (vy0[i][j] + a * vy[i-1][j] + vy[i+1][j] + vy[i][j-1] + vy[i][j+1]) / (1 + 4 * a);
                }
            }
            this.setVxBoundary();
            this.setVyBoundary();
        }
    }

    diffuseDensity(iterations) {
        // use Gauss-Siedel to solve backwards diffusion problem
        let N = this.size;
        let a = this.dt * this.diffusion * N * N;
        let d = this.density;
        let d0 = this.density0;
        for (let it = 0; it < iterations; it++) {
            for (let i = 1; i < N - 1; i++) {
                for (let j = 1; j < N - 1; j++) {
                    d[i][j] = (d0[i][j] + a * d[i-1][j] + d[i+1][j] + d[i][j-1] + d[i][j+1]) / (1 + 4 * a);
                }
            }
            this.setQBoundary(d);
        }
    }

    advectVelocity() {
        let N = this.size;
        let dt0 = this.dt * N;
    }

    advectVelocities() {
        let N = this.size;
        let dt0 = this.dt * N;
        let vx = this.vx;
        let vy = this.vy;
        let vx0 = this.vx0;
        let vy0 = this.vy0;
        
        for (let i = 1; i < N-1; i++) {
            for (let j = 1; j < N-1; j++) {
                let x = i - dt0 * vx[i][j];
                let y = j - dt0 * vy[i][j];
                if (x < 0.5)
                    x = 0.5;
                if (x > N + 0.5)
                    x = N + 0.5;
                let i0 = Math.floor(x);
                let i1 = i0 + 1;
                if (y < 0.5)
                    y = 0.5;
                if (y > N + 0.5)
                    y = N + 0.5;
                let j0 = Math.floor(y);
                let j1 = j0 + 1;
                let s0 = i1 - x;
                let s1 = x - i0;
                let t0 = j1 - y;
                let t1 = y - j0;
                vx[i][j] = s0 * (t0 * vx0[i0][j0] + t1 * vx0[i0][j1]) + s1 * (t0 * vx0[i1][j0] + t1 * vx0[i1][j1]);
                vy[i][j] = s0 * (t0 * vy0[i0][j0] + t1 * vy0[i0][j1]) + s1 * (t0 * vy0[i1][j0] + t1 * vy0[i1][j1]);
            }
        }
        this.setVxBoundary();
        this.setVyBoundary();
    }

    advectDensity() {
        let N = this.size;
        let dt0 = this.dt * N;
        let d = this.density;
        let d0 = this.density0;
        let vx = this.vx;
        let vy = this.vy;
        
        for (let i = 1; i < N-1; i++) {
            for (let j = 1; j < N-1; j++) {
                let x = i - dt0 * vx[i][j];
                let y = j - dt0 * vy[i][j];
                if (x < 0.5)
                    x = 0.5;
                if (x > N - 1.5)
                    x = N - 1.5;
                let i0 = Math.floor(x);
                let i1 = i0 + 1;
                if (y < 0.5)
                    y = 0.5;
                if (y > N - 1.5)
                    y = N - 1.5;
                let j0 = Math.floor(y);
                let j1 = j0 + 1;
                let s0 = i1 - x;
                let s1 = x - i0;
                let t0 = j1 - y;
                let t1 = y - j0;
                d[i][j] = s0 * (t0 * d0[i0][j0] + t1 * d0[i0][j1]) + s1 * (t0 * d0[i1][j0] + t1 * d0[i1][j1]);
            }
        }
        this.setQBoundary(d);
    }

    project(iterations) {
        let N = this.size;
        let vx = this.vx;
        let vy = this.vy;
        let p = this.vx0;
        let div = this.vy0;
        let h = 1 / N;

        for (let i = 1; i < N - 1; i++) {
            for (let j = 1; j < N - 1; j++) {
                div[i][j] = -0.5 * h * (vx[i+1][j] - vx[i-1][j] + vy[i][j+1] - vy[i][j-1]);
                p[i][j] = 0;
            }
        }
        this.setQBoundary(p);
        this.setQBoundary(div);

        // use Gauss-Siedel to solve for pressure
        for (let it = 0; it < iterations; it++) {
            for (let i = 1; i < N - 1; i++) {
                for (let j = 1; j < N - 1; j++) {
                    p[i][j] = (div[i][j] + p[i-1][j] + p[i+1][j] + p[i][j+1] + p[i][j-1]) / 4;
                }
            }
            this.setQBoundary(p);
        }

        // update velocity based on gradient of pressure
        for (let i = 1; i < N - 1; i++) {
            for (let j = 1; j < N - 1; j++) {
                vx[i][j] -= (p[i+1][j] - p[i-1][j]) / (2 * h);
                vy[i][j] -= (p[i][j+1] - p[i][j-1]) / (2 * h);
            }
        }
        this.setVxBoundary();
        this.setVyBoundary();
    }

    setVxBoundary() {
        let vx = this.vx;
        let N = this.size;
        // set x boundary to negative of neighbours
        for (let j = 1; j < N - 1; j++) {
            vx[0][j] = -vx[1][j];
            vx[N-1][j] = -vx[N-2][j];
        }
        // set y boundary to be same as neighbours
        for (let i = 1; i < N - 1; i++) {
            vx[i][0] = vx[i][1];
            vx[i][N-1] = vx[i][N-2];
        }
        // set corners to be averages
        vx[0][0] = (vx[1][0] + vx[0][1]) / 2;
        vx[N-1][0] = (vx[N-2][0] + vx[N-1][1]) / 2;
        vx[0][N-1] = (vx[0][N-2] + vx[1][N-1]) / 2;
        vx[N-1][N-1] = (vx[N-2][N-1] + vx[N-1][N-2]) / 2;
    }

    setVyBoundary() {
        let vy = this.vy;
        let N = this.size;
        // set x boundary to be same as neighbours
        for (let j = 1; j < N - 1; j++) {
            vy[0][j] = vy[1][j];
            vy[N-1][j] = vy[N-2][j];
        }
        // set y boundary to negative of neighbours
        for (let i = 1; i < N - 1; i++) {
            vy[i][0] = -vy[i][1];
            vy[i][N-1] = -vy[i][N-2];
        }
        // set corners to be averages
        vy[0][0] = (vy[1][0] + vy[0][1]) / 2;
        vy[N-1][0] = (vy[N-2][0] + vy[N-1][1]) / 2;
        vy[0][N-1] = (vy[0][N-2] + vy[1][N-1]) / 2;
        vy[N-1][N-1] = (vy[N-2][N-1] + vy[N-1][N-2]) / 2;
    }

    setQBoundary(q) {
        let N = this.size;
        // set x and y boundaries to be same as neighbours
        for (let i = 1; i < N - 1; i++) {
            q[0][i] = q[1][i];
            q[N-1][i] = q[N-2][i];
            q[i][0] = q[i][1];
            q[i][N-1] = q[i][N-2];
        }
        // set corners to be averages
        q[0][0] = (q[1][0] + q[0][1]) / 2;
        q[N-1][0] = (q[N-2][0] + q[N-1][1]) / 2;
        q[0][N-1] = (q[0][N-2] + q[1][N-1]) / 2;
        q[N-1][N-1] = (q[N-2][N-1] + q[N-1][N-2]) / 2;
    }

    draw() {
        let s = this.gridSize;
        let context = this.context;
        // reset canvas to black
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'white';
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                context.fillStyle = `rgba(0, 0, 255, ${255 * this.density[i][j]})`;
                context.fillRect(i * s, j * s, s, s);
            }
        }
    }

    fadeDensity() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.density[i][j] = Math.max(0, Math.min(255, this.density[i][j] - 0.0001 * this.dt));
            }
        }
    }
}