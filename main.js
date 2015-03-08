var PIXI = require('pixi.js');
// have to do this for Matter.RenderPixi to work
window.PIXI = window.PIXI || PIXI;

var Matter = require('matter.js');
var Engine = Matter.Engine,
    World  = Matter.World,
    Bodies = Matter.Bodies;

var engine = Matter.Engine.create({
  render: {
    element: document.body,
    controller: Matter.RenderPixi
  },
  world: {
    gravity: {x: 0, y: 0}
  }
});

var p1 = Matter.Body.create({
  vertices: [
    {x: 0, y: 0},
    {x: 20, y: 0},
    {x: 20, y: 5}
  ],
  position: {x: 100, y: 100}
});
World.add(engine.world, p1);

Matter.Runner.run(engine);
