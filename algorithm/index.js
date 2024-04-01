function miniMaxSum(arr) {
    arr.sort((a, b) => a - b);
    const minSum = arr.slice(0, 4).reduce((acc, curr) => acc + curr, 0);
    const maxSum = arr.slice(1).reduce((acc, curr) => acc + curr, 0);
    
    console.log(minSum, maxSum);
}
function total(arr) {
    return arr.reduce((acc, curr) => acc + curr, 0);
}

function min(arr) {
    return Math.min(...arr);
}

function max(arr) {
    return Math.max(...arr);
}

function evenElements(arr) {
    return arr.filter(num => num % 2 === 0);
}

function oddElements(arr) {
    return arr.filter(num => num % 2 !== 0);
}

const arr = [1, 2, 3, 4, 5];
miniMaxSum(arr);
console.log("Total:", total(arr));
console.log("Min:", min(arr));
console.log("Max:", max(arr));
console.log("Even elements:", evenElements(arr));
console.log("Odd elements:", oddElements(arr));
