const maxFullRegens = 10;
const maxPartialRegens = 10;

let categories = [
  ["C", "p*1.3/t*1.1/k/m*1.4/n*1.2/s*1.2/w*1.1/j/ts*0.8"],
  ["V", "a/e/i/o/u"],
  ["S", "CV"],
  ["E", "SE?"],
];
let pattern = "V?SS?S?S??";
let wordFilters = [
  [/^[aeiou]*$/g, "!"],
  [/[aeiou]{3}/g, "!"],
  [/([aeiou])\1/g, "#$1V"],
  [/wu/g, "#Cu"],
  [/ji/g, "#Ci"],
  [/s([ei])/g, "c$1"]
];

let wordCount = 20;
let optionalWeight = 0.5;

class UnitNode {
  constructor (children) {this.type = "unit"; this.children = children;}
}
class SequenceNode {
  constructor (children, weight=1) {
    this.type = "sequence";
    this.children = children;
    this.weight = weight;
  }
}
class LiteralNode {
  constructor (child) {this.type = "literal"; this.child = child;}
}
class CategoryNode {
  constructor (child) {this.type = "category"; this.child = child;}
}
class OptionalNode {
  constructor (child, weight=0.5) {
    this.type = "optional";
    this.child = child;
    this.weight = weight;
  }
}
class FilterNode {
  constructor (child, filter) {
    this.type = "filter";
    this.child = child;
    this.filter = filter ?? /[^\s\S]/;
  }
}

function product() {
  var args = Array.prototype.slice.call(arguments); // makes array from arguments
  return args.reduce(function tl (accumulator, value) {
    var tmp = [];
    accumulator.forEach(function (a0) {
      value.forEach(function (a1) {
        tmp.push(a0.concat(a1));
      });
    });
    return tmp;
  }, [[]]);
}

function parsePattern (expression, categories, optionalWeight=0.5) {
  categories = categories ?? {};
  const tree = new UnitNode([new SequenceNode([])]);
  for (var idx = 0; idx < expression.length; idx++) {
    const char = expression[idx];
    if (char === '(') {
      let buffer = "";
      let depth = 1;
      for (idx++; idx < expression.length; idx++) {
        if (expression[idx] === "(") {depth++;}
        if (expression[idx] === ")") {depth--;}
        if (depth) {
          buffer += expression[idx];
        } else {break;}
      }
      if (depth && idx >= expression.length) {
        throw new Error("EoF reached while parsing parentheses.");
      }
      tree.children.at(-1).children.push(parsePattern(buffer, categories));
      continue;
    }
    if (char === '{' && expression[idx+1] === ":") {
      let buffer = "";
      for (idx += 2; idx < expression.length; idx++) {
        if (expression[idx] === ":" && expression[idx+1] === "}") {
          idx++;
          break;
        }
        buffer += expression[idx];
      }
      if (idx >= expression.length) {
        throw new Error("EoF reached while parsing filter brackets.");
      }
      tree.children.at(-1).children.push(
        new FilterNode(
          tree.children.at(-1).children.pop(),
          new RegExp(buffer)
        )
      );
      continue;
    }
    if (char === '"') {
      let buffer = "";
      for (idx++;
           expression[idx] !== '"' && idx < expression.length;
           idx++) {
        buffer += expression[idx];
      }
      if (idx >= expression.length) {
        throw new Error("EoF reached while parsing string.");
      }
      tree.children.at(-1).children.push(new LiteralNode(buffer));
      continue;
    }
    if (char === "'") {
      let buffer = "";
      for (idx++;
           expression[idx] !== "'" && idx < expression.length;
           idx++) {
        buffer += expression[idx];
      }
      if (idx >= expression.length) {
        throw new Error("EoF reached while parsing string.");
      }
      tree.children.at(-1).children.push(new LiteralNode(buffer));
      continue;
    }
    if (char === '?') {
      if (tree.children.at(-1).children.at(-1).type === 'optional') {
        tree.children.at(-1).children.at(-1).weight *= optionalWeight;
      } else {
        tree.children.at(-1).children.push(
          new OptionalNode(
            tree.children.at(-1).children.pop(),
            optionalWeight
          )
        );
      }
      continue;
    }
    if (char === '*') {
      let buffer = "";
      for (idx++;
           expression[idx] !== '/' && idx < expression.length;
           idx++) {
        buffer += expression[idx];
      }
      idx--;
      tree.children.at(-1).weight = Number(buffer);
      continue;
    }
    if (char === '/') {
      tree.children.push(new SequenceNode([]))
      continue;
    }
    if (char in categories) {
      tree.children.at(-1).children.push(new CategoryNode(char));
    } else {
      tree.children.at(-1).children.push(new LiteralNode(char));
    }
  }
  return tree;
}

function generateWordFromNode(node, categories) {
  categories = categories ?? {};
  /*console.log(node.type + '['
              + (node.children?.map(x => x?.type).join()
              ?? node.child?.type ?? node.child) + ']');*/
  switch (node.type) {
    case "literal":
      return node.child;
    case "category":
      return generateWordFromNode(categories[node.child], categories);
    case "unit":
      let totalWeight = node.children.reduce((a, c) => a + c.weight, 0);
      let location = Math.random() * totalWeight;
      for (const child of node.children) {
        if (location < child.weight) {
          let result = generateWordFromNode(child, categories);
          if (result !== undefined) {return result;}
        }
        location -= child.weight;
      }
      return generateWordFromNode(node.children[0], categories);
    case "sequence":
      let result = node.children.map(
        (child) => generateWordFromNode(child, categories)
      );
      if (result.includes(undefined)) {return undefined;}
      return result.join("");
    case "optional":
      if (Math.random() < node.weight) {
        return generateWordFromNode(node.child, categories) ?? '';
      }
      return '';
    case "filter":
      let word;
      let attempts = 0;
      for (; attempts < maxPartialRegens; attempts++) {
        word = generateWordFromNode(node.child, categories);
        if (!word?.match(node.filter)) break;
      }
      if (attempts < maxPartialRegens) {
        return word;
      }
    default:
      return undefined;
  }
}

function generateAllWordsFromNode(node, categories) {
  categories = categories ?? {};
  /*
  console.log(node.type + '['
              + (node.children?.map(x => x?.type).join()
              ?? node.child?.type ?? node.child) + ']');*/
  switch (node.type) {
    case "literal":
      return [node.child];
    case "category":
      return generateAllWordsFromNode(categories[node.child], categories);
    case "unit":
      return node.children.flatMap(
        (child) => generateAllWordsFromNode(child, categories)
      );
    case "sequence":
      let result = product(...node.children.map(
        (child) => generateAllWordsFromNode(child, categories)
      ));
      return result.map((x) => x.join(""));
    case "optional":
      return ['', ...generateAllWordsFromNode(node.child, categories)];
    case "filter":
      return generateAllWordsFromNode(node.child, categories)
        .filter(word => !word?.match(node.filter));
    default:
      return undefined;
  }
}

function generateWords (pattern, categoryList, wordFilters,
                        wordCount, optionalWeight) {
  let categories = Object.fromEntries(categoryList);
  wordFilters = wordFilters ?? [];
  let ast = parsePattern(pattern, categories);
  let categoryTrees = Object.fromEntries(
    Object.entries(categories).map(
      ([k, v]) => [k, parsePattern(v, categories, optionalWeight ?? 0.5)]
    )
  );
  let wordFilterReplacements = Object.fromEntries(
    wordFilters.filter(([f, r]) => r.startsWith("#"))
    .map(([f, r]) => [r, parsePattern(
      r.slice(1), categories, optionalWeight ?? 0.5)])
  );
  // console.log(ast);
  if (wordCount === undefined) {
    return generateWordFromNode(ast, categoryTrees);
  }
  let words = [];
  for (var i = 1; i <= wordCount; i++) {
    let regenerate;
    let fullRegens = 0;
    do {
      let word = generateWordFromNode(ast, categoryTrees);
      if (word === undefined) {
        console.warn("Local filter repeatedly failed to generate word."
                     + ` (${fullRegens+1})`);
        regenerate = true;
        fullRegens++;
        continue;
      };
      regenerate = false;
      for (const [filter, replacement] of wordFilters) {
        /*if (word.match(filter)) {
          console.log(word, filter, replacement);
        }*/
        if (replacement === "!" && word.match(filter)) {
          console.log(`Word '${word}' rejected by global filter. `
                       + `(${fullRegens+1})`);
          regenerate = true;
          break;
        }
        if (replacement.startsWith("#")) {
          let partialRegens = 0;
          while (word.match(filter) && partialRegens < maxPartialRegens) {
            word = word.replace(filter, generateWordFromNode(
              wordFilterReplacements[replacement], categoryTrees
            ));
            partialRegens++;
          }
          if (word.match(filter)) {
            console.warn(`Word '${word}' failed to partially regenerate.`
                         + ` (${fullRegens+1})`);
            regenerate = true;
            break;
          }
        } else {
          word = word.replaceAll(filter, replacement);
        }
      }
      if (regenerate) {
        fullRegens++;
        continue;
      };
      words.push(word);
    } while (regenerate && fullRegens < maxFullRegens);
    if (fullRegens >= maxFullRegens) {
      console.error("Attempt limit reached. Attempt skipped.")
    }
  }
  return words;
}

function generateAllWords(pattern, categoryList, wordFilters) {
  let categories = Object.fromEntries(categoryList);
  wordFilters = wordFilters ?? [];
  let ast = parsePattern(pattern, categories);
  let categoryTrees = Object.fromEntries(
    Object.entries(categories).map(
      ([k, v]) => [k, parsePattern(v, categories, optionalWeight ?? 0.5)]
    )
  );
  let wordFilterReplacements = Object.fromEntries(
    wordFilters.filter(([f, r]) => r.startsWith("#"))
    .map(([f, r]) => [r, generateAllWordsFromNode(parsePattern(
      r.slice(1), categories, optionalWeight ?? 0.5), categoryTrees)])
  );
  let words = generateAllWordsFromNode(ast, categoryTrees);
  words = words.flatMap((word) => {
    let results = [word];
    for (const [filter, replacement] of wordFilters) {
      if (replacement === "!") {
        results = results.filter((result) => !result.match(filter));
        continue;
      }
      if (replacement.startsWith("#")) {
        for (let attempts = 0; attempts < maxPartialRegens; attempts++) {
          results = results.flatMap((result) => {
            if (!result.match(filter)) {return [result];}
            return wordFilterReplacements[replacement].map(
              (part) => result.replace(filter, part)
            );
          })
        }
        results = results.filter((result) => !result.match(filter));
        continue;
      }
      results = results.map((result) => result.replaceAll(filter, replacement));
    }
    return results;
  });
  return Array.from(new Set(words));
}

// console.log(generateAllWords(pattern, categories, wordFilters));

console.log();

console.log(generateWords(pattern, categories, wordFilters,
                          wordCount, optionalWeight));
