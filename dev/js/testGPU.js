
// GPU is a constructor and namespace for browser
const gpu1 = new GPU();
const multiplyMatrix = gpu1.createKernel(function(a, b) {
    let sum = 0;
    for (let i = 0; i < 512; i++) {
        sum += a[this.thread.y][i] * b[i][this.thread.x];
    }
    return sum;
}).setOutput([512, 512]);

const a = [[1,2],[3,4]]
const b = [[1,2],[3,4]]
const c = multiplyMatrix(a, b);
// document.getElementById("output").innerHTML = c