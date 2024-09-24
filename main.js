const { randomInt } = require('crypto');
const fs = require('fs');

const outputPath = "out"

const lengthInterval = [1,5]
const digitCount = getRandomInt(0,3)
const missing = pickRandom(["height","base","hypothenus"])
const displacementStrength = 0.25

const unit = pickRandom(["m","km","dm","cm"])

let points = {}


// console.log(missingSize)


// Helper function to generate a random right triangle

function getRandomeLength(min = lengthInterval[0],max = lengthInterval[1]){
    const length = min + Math.random() * (max - min)    
    return  length
}

function pickRandom(array){
    const random = getRandomInt(0,array.length - 1);
    return array[random]
}

function randomDisplacement(strength = displacementStrength){
    return Math.random() * strength
}

function displacePoint(coords, strength = displacementStrength){
    const x = coords[0] + Math.random() * strength
    const y = coords[1] + Math.random() * strength
    return {x,y}
}

function generateRightTriangle() {
    const base = getRandomeLength();    // Random base between 1 and 5 units
    const height = getRandomeLength();  // Random height between 1 and 5 units
    const hypotenuse = Math.sqrt(base ** 2 + height ** 2).toFixed(2); // Calculate the hypotenuse

    // Coordinates for the right triangle vertices (scaled down by half)
    const triangle = [
        [0, 0],        // (x1, y1): Bottom-left corner
        [base, 0],     // (x2, y2): Bottom-right corner (base)
        [0, height],   // (x3, y3): Top-left corner (height)
    ];

    points.A = displacePoint(triangle[0])
    points.B = displacePoint(triangle[1])
    points.C = displacePoint(triangle[2])

    return { triangle, base, height, hypotenuse };
}

// Function to rotate a point around a center (cx, cy) by an angle
function rotatePoint(x, y, angle, cx, cy) {
    const radians = angle * (Math.PI / 180);
    const dx = x - cx;
    const dy = y - cy;
    const xNew = cx + dx * Math.cos(radians) - dy * Math.sin(radians);
    const yNew = cy + dx * Math.sin(radians) + dy * Math.cos(radians);
    return [xNew.toFixed(2), yNew.toFixed(2)];
}

    // Function to rotate the entire triangle and squares
    function rotateShape(shape, angle, cx, cy) {
    return shape.map(([x, y]) => rotatePoint(x, y, angle, cx, cy));
}

    // Function to generate squares placed along the triangle sides
function generateSquares(base, height, hypotenuse, triangle) {
    // console.log(typeof points.A.x)
    const baseSquare = [
        [points.A.x, points.A.y],
        [points.B.x, points.B.y],
        [points.B.x + randomDisplacement(), points.B.y - base + randomDisplacement()],
        [points.A.x + randomDisplacement(), points.A.y - base + randomDisplacement()],
    ];
    const heightSquare = [
        [points.A.x, points.A.y],
        [points.C.x, points.C.y],
        [points.C.x - height + randomDisplacement(), points.C.y + randomDisplacement()],
        [points.A.x - height + randomDisplacement(), points.A.y + randomDisplacement()],
    ];
    const hypotenuseSquare = generateHypotenuseSquare(triangle, hypotenuse)

    return { baseSquare, heightSquare, hypotenuseSquare };
}

const notationSize = 0.5
function generateRightAngleNotation(triangle) {
    const rightAngleNotation = [
        [points.A.x, points.A.y],
        [points.A.x + notationSize, points.A.y],
        [points.C.x + notationSize, points.A.y + notationSize],
        [points.A.x, points.A.y + notationSize],
    ];

    return rightAngleNotation
}

// Function to create a square along the hypotenuse, properly rotated
function generateHypotenuseSquare(triangle, hypotenuse) {
    const [x1, y1] = [points.B.x, points.B.y]; // Bottom-right corner of the triangle
    const [x2, y2] = [points.C.x, points.C.y]; // Top-left corner of the triangle (end of the hypotenuse)
    
    // Hypotenuse direction vector (from x1,y1 to x2,y2)
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Normalizing the vector (dx, dy)
    const hypotenuseLength = Math.sqrt(dx * dx + dy * dy);
    const unitDx = dx / hypotenuseLength;
    const unitDy = dy / hypotenuseLength;

    // Perpendicular direction to the hypotenuse (rotated 90 degrees clockwise)
    const perpDx = -unitDy;
    const perpDy = unitDx;

    // Coordinates for the hypotenuse square
    const squareSize = hypotenuse; // The side length of the square should match the length of the hypotenuse
    const hypotenuseSquare = [
        [x1, y1], // Starting point (bottom-right corner of triangle)

        // Move along the hypotenuse by one side length (squareSize)
        [x2, y2], // End of hypotenuse

        // Extend perpendicularly from both ends of the hypotenuse by squareSize
        [x2 - perpDx * squareSize + randomDisplacement(), y2 - perpDy * squareSize + randomDisplacement()],
        [x1 - perpDx * squareSize + randomDisplacement(), y1 - perpDy * squareSize + randomDisplacement()],
    ];

    return hypotenuseSquare;
}

// Function to generate the LaTeX code for an exercise
function generateLatex(polygonData, heightSquareArea, baseSquareArea, hypotenuseSquareArea) {
    // \\pspolygon(${polygonData.triangle.flat().join(',')})
    const unitOffset = [1 + 0.3 * digitCount,0.2]
    const latexContent = `
\\begin{pspicture*}(2,-18)(12,13)
\\pspolygon(${polygonData.baseSquare.flat().join(',')})
\\pspolygon(${polygonData.heightSquare.flat().join(',')})
\\pspolygon(${polygonData.hypotenuseSquare.flat().join(',')})
\\pspolygon(${polygonData.rightAngleNotation.flat().join(',')})
\\rput[tl](${getPolygonCenter(polygonData.baseSquare).flat().join(',')}){${baseSquareArea + unit}}
\\rput[tl](${getPolygonCenter(polygonData.baseSquare,unitOffset).flat().join(',')}){2}
\\rput[tl](${getPolygonCenter(polygonData.heightSquare).flat().join(',')}){${heightSquareArea + unit}}
\\rput[tl](${getPolygonCenter(polygonData.heightSquare,unitOffset).flat().join(',')}){2}
\\rput[tl](${getPolygonCenter(polygonData.hypotenuseSquare).flat().join(',')}){${hypotenuseSquareArea + unit}}
\\rput[tl](${getPolygonCenter(polygonData.hypotenuseSquare,unitOffset).flat().join(',')}){2}
\\end{pspicture*}
`;

    return latexContent;
}

function getPolygonCenter(p,offset = [0,0]){
    // console.log()
    const x = (Number(p[0][0]) + Number(p[1][0]) + Number(p[2][0]) + Number(p[3][0])) / 4
    const y = (Number(p[0][1]) + Number(p[1][1]) + Number(p[2][1]) + Number(p[3][1])) / 4
    const center = [x - 0.5 + offset[0],y + offset[1]]
    // console.log(center)
    return center
}

// Helper function to generate random integer within a range
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function parseNumber(number, digits = digitCount){
    const str = String(number)
    const array = str.split(".")
    let  parsedNumber = array[0]
    if(digits > 0){
        parsedNumber += "," + array[1].slice(0,digits)
    }
    // console.log(parsedNumber)
    return parsedNumber
}
// Write the LaTeX content to a text file

function generateFile(id = ''){
    // Generate a random right triangle
    const { triangle, base, height, hypotenuse } = generateRightTriangle();

    // Generate squares for the sides of the triangle
    const squares = generateSquares(base, height, hypotenuse, triangle);
    const rightAngleNotation = generateRightAngleNotation(triangle)

    // Rotate the triangle by a random angle
    const rotationAngle = getRandomInt(0, 360);
    const rotatedTriangle = rotateShape(triangle, rotationAngle, 0, 0);

    // Rotate the squares accordingly
    const rotatedBaseSquare = rotateShape(squares.baseSquare, rotationAngle, points.A.x, points.A.y);
    const rotatedHeightSquare = rotateShape(squares.heightSquare, rotationAngle, points.A.x, points.A.y);
    const rotatedHypotenuseSquare = rotateShape(squares.hypotenuseSquare, rotationAngle, points.A.x, points.A.y);

    // Rotate right angle notation
    const rotatedRightAngleNotation = rotateShape(rightAngleNotation, rotationAngle, points.A.x, points.A.y);
    // Prepare the polygon data for LaTeX
    const polygonData = {
        triangle: rotatedTriangle,
        baseSquare: rotatedBaseSquare,
        heightSquare: rotatedHeightSquare,
        hypotenuseSquare: rotatedHypotenuseSquare,
        rightAngleNotation: rotatedRightAngleNotation
    };

    // console.log(polygonData)
    let baseSquareArea = parseNumber(base * base);
    let heightSquareArea = parseNumber(height * height);
    let hypotenuseSquareArea = parseNumber(hypotenuse * hypotenuse);

    const missingString = "_ _"
    switch (missing){
        case 'base': baseSquareArea = missingString; break;
        case 'height': heightSquareArea = missingString; break;
        default: hypotenuseSquareArea = missingString
    }
    // Generate the LaTeX content
    const latexContent = generateLatex(polygonData, heightSquareArea, baseSquareArea, hypotenuseSquareArea);

    fs.writeFile(outputPath + '/holed_pythagoras_' + id + '.txt', latexContent, (err) => {
        if (err) throw err;
        console.log('File has been saved!');
    });
}


for (let i = 0; i < 9; i++) {
    generateFile(i)
}


