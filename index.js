var origin = [700, 450], grid_size = 20, scale = 20, xGrid = [], beta = 0, alpha = 0, key = function (d) { return d.id; }, startAngle = Math.PI / 8;
//var svg = d3.select('svg').call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g');
var svg = d3.select('svg').append('g');
var color = d3.scaleOrdinal(d3.schemeCategory20);
var mx, my, mouseX, mouseY;

var gridGroup = svg.append('g').attr('class', 'grids');
var cubesGroup = svg.append('g').attr('class', 'cubes');

var grid3d = d3._3d()
    .shape('GRID', 40) //40 is grid_size * 2;
    .origin(origin)
    .rotateY(startAngle)
    .rotateX(-startAngle)
    .scale(scale);

var cubes3D = d3._3d()
    .shape('CUBE')
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; })
    .z(function (d) { return d.z; })
    .rotateY(startAngle)
    .rotateX(-startAngle)
    .origin(origin)
    .scale(scale);

function processGrid(data) {
    /* ----------- GRID ----------- */
    var xGrid = gridGroup.selectAll('path.grid').data(data, key);

    xGrid
        .enter()
        .append('path')
        .attr('class', '_3d grid')
        .merge(xGrid)
        .attr('stroke', 'black')
        .attr('stroke-width', 0.3)
        .attr('fill', function (d) { return d.ccw ? 'lightgrey' : '#717171'; })
        .attr('fill-opacity', 0.9)
        .attr('d', grid3d.draw);

    xGrid.exit().remove();
}
function processCubes(data, tt) {

    /* --------- CUBES ---------*/

    var cubes = cubesGroup.selectAll('g.cube').data(data, function (d) { return d.id });

    var ce = cubes
        .enter()
        .append('g')
        .attr('class', 'cube')
        .call(d3.drag().on('drag', draggedCube).on('start', dragStartCube).on('end', dragEndCube))
        .attr('fill', function (d) { return color(d.id); })
        .attr('stroke', function (d) { return d3.color(color(d.id)).darker(2); })
        .merge(cubes)
        .sort(cubes3D.sort);

    cubes.exit().remove();
    /* --------- FACES ---------*/

    var faces = cubes.merge(ce).selectAll('path.face').data(function (d) { return d.faces; }, function (d) { return d.face; });

    faces.enter()
        .append('path')
        .attr('class', 'face')
        .attr('fill-opacity', 0.95)
        .classed('_3d', true)
        .merge(faces)
        .transition().duration(tt)
        .attr('d', cubes3D.draw);

    faces.exit().remove();

    /* --------- SORT TEXT & FACES ---------*/

    ce.selectAll('._3d').sort(d3._3d().sort);

}
function init() {
    xGrid = [];
    for (var z = -grid_size; z < grid_size; z++) {
        for (var x = -grid_size; x < grid_size; x++) {
            xGrid.push([x, 1, z]);
        }
    }

    var data = grid3d(xGrid);

    cubesData = [];
    var cnt = 0;
    for (var z = -grid_size / 2; z <= grid_size / 2; z = z + 5) {
        for (var x = -grid_size; x <= grid_size; x = x + 5) {
            var h = d3.randomUniform(-2, -7)();
            var _cube = makeCube(h, x, z);
            _cube.id = 'cube_' + cnt++;
            _cube.height = h;
            cubesData.push(_cube);
            break;
        }
        break;
    }

    processGrid(data);
    processCubes(cubes3D(cubesData), 1000);
}

// function dragStart() {
//     mx = d3.event.x;
//     my = d3.event.y;
// }

// function dragged() {
//     mouseX = mouseX || 0;
//     mouseY = mouseY || 0;
//     beta = (d3.event.x - mx + mouseX) * Math.PI / 230;
//     alpha = (d3.event.y - my + mouseY) * Math.PI / 230 * (-1);
//     var data = grid3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(xGrid);
//     processGrid(data, 0);
//     processCubes(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(cubesData), 0);


// }

// function dragEnd() {
//     mouseX = d3.event.x - mx + mouseX;
//     mouseY = d3.event.y - my + mouseY;
// }
function makeCube(h, x, z) {
    return [
        { x: x - 1, y: h, z: z + 1 }, // FRONT TOP LEFT
        { x: x - 1, y: 0, z: z + 1 }, // FRONT BOTTOM LEFT
        { x: x + 1, y: 0, z: z + 1 }, // FRONT BOTTOM RIGHT
        { x: x + 1, y: h, z: z + 1 }, // FRONT TOP RIGHT
        { x: x - 1, y: h, z: z - 1 }, // BACK  TOP LEFT
        { x: x - 1, y: 0, z: z - 1 }, // BACK  BOTTOM LEFT
        { x: x + 1, y: 0, z: z - 1 }, // BACK  BOTTOM RIGHT
        { x: x + 1, y: h, z: z - 1 }, // BACK  TOP RIGHT
    ];
}

//drag handler for cube
function draggedCube(d) {

    mouseX = mouseX || 0;
    mouseY = mouseY || 0;    
    processCubes(cubes3D.origin([d3.event.x + 450 , d3.event.y])(cubesData), 0);
}
function dragStartCube() {
    mx = d3.event.x;
    my = d3.event.y;    
}
function dragEndCube() {
    mouseX = d3.event.x - mx + mouseX;
    mouseY = d3.event.y - my + mouseY;
}
d3.selectAll('button').on('click', init);

init();