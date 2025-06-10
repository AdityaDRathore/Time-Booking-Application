const directoryTree = require("directory-tree");

const tree = directoryTree("./", { extensions: /\.(ts|js|json)$/ });

console.log(JSON.stringify(tree, null, 2));
