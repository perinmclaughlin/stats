
export var actionTypes = [
  {
    id: 1,
    description: "Place cube on scale",
  },
  {
    id: 2,
    description: "Place cube in ally switch",
  },
  {
    id: 3,
    description: "Place cube in opponent switch",
  },
  {
    id: 4,
    description: "Place cube in vault",
  },
  {
    id: 5,
    description: "Knock cube out of scale",
  },
  {
    id: 6,
    description: "Place cube in scale - wrong side",
  },
  {
    id: 7,
    description: "Place cube in ally switch - wrong side",
  },
  {
    id: 8,
    description: "Place cube in opponent switch - wrong side",
  },
  {
    id: 9,
    description: "Place cube in opponent vault",
  },
];

export var actionTypeMap = {};

for(var actionType of actionTypes) {
  actionTypeMap[actionType.id] = actionType;
}
