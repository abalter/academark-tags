// https://chat.openai.com/share/cd2b8021-2024-4df8-b872-2f9cbbe76b4b

function autocloseHTMLTags(text) {
  const tags = ['cite', 'aside', 'a', 'ref-sec', 'ref-eq', 'ref-fig', 'ref-table', 'ref-code'];

  tags.forEach(tag => {
    // Regular expression to match an opening tag that is not immediately followed by a closing tag of the same kind
    const regex = new RegExp(`<${tag}(>|\\s+[^>]*>)(?!.*?</${tag}>.*$)`, 'gi');

    // Replace function to append a closing tag immediately after each opening tag found by the regex
    text = text.replace(regex, (match) => {
      return `${match}</${tag}>`;
    });
  });

  return text;
}

function wrapTextWithTitleTag(text) {
  // Define the hierarchy of tags
  const tags = ['article', 'section', 'sub-section', 'sub-sub-section', 'sub-sub-sub-section'];

  // Create a regular expression that matches any of the specified tags followed by any text until the next newline
  const regex = new RegExp(`(<(${tags.join('|')})[^>]*>)([^\\n]*)\\n`, 'gi');

  // Replace matches with the original tag, followed by the matched text wrapped in a <title> tag, and then the newline
  return text.replace(regex, (match, p1, p2, p3) => {
    // p1 is the full opening tag (e.g., <section>)
    // p2 is the tag name (e.g., section), which we don't use in the replacement
    // p3 is the text to be wrapped with <title>
    return `${p1}<header>${p3}</header>\n`;
  });
}


// Define the hierarchy of tags
const tagHierarchy = ['article', 'section', 'sub-section', 'sub-sub-section', 'sub-sub-sub-section'];

function findTagIndex(tagName) {
  return tagHierarchy.indexOf(tagName.toLowerCase());
}

function unnestElement(element) {
  let parent = element.parentNode;
  while (parent && parent !== document.body) {
    const parentIndex = findTagIndex(parent.tagName.toLowerCase());
    const elementIndex = findTagIndex(element.tagName.toLowerCase());

    // Check if the element is wrongly nested within a parent of lower or equal hierarchy
    if (parentIndex >= 0 && elementIndex <= parentIndex) {
      const grandParent = parent.parentNode;

      // Safety check: If there's no grandparent (i.e., parent is at the top level), break
      if (!grandParent) break;

      // Move the element to be a sibling of its parent, right after the parent
      if (parent.nextSibling) {
        grandParent.insertBefore(element, parent.nextSibling);
      } else {
        grandParent.appendChild(element);
      }
    } else {
      // If the hierarchy is correct, no need to unnest further
      break;
    }

    // Update the parent for the next iteration, in case further unnesting is needed
    parent = element.parentNode;
  }
}

function unnestHierarchy(my_document) {
  console.log("in unnestHierarchy: \n" + my_document);

  // Create a combined selector for all elements in the hierarchy
  const selector = tagHierarchy.join(', ');
  // Select all elements within the specified hierarchy
  const elements = my_document.querySelectorAll(selector);
  console.log(`elements: ${elements}`);

  elements.forEach(element => {
    console.log(`element: ${element.nodeName}`);

    unnestElement(element);
  });

  return (my_document)
}


function processText(inputHTML) {
  console.log("processText");
  console.log("inputHTML:\n" + inputHTML);

  inputHTML = wrapTextWithTitleTag(inputHTML);
  inputHTML = autocloseHTMLTags(inputHTML);

  console.log("intermediate html: \n" + inputHTML);

  const parser = new DOMParser();
  let doc = parser.parseFromString(inputHTML, 'text/html');

  console.log("doc:\n" + doc);
  let unnested_html =
    unnestHierarchy(doc)
      .documentElement
      .innerHTML

  console.log("OUTPUT:\n" + unnested_html);

  return (unnested_html);
}

fetch('text.txt')
  .then(_ => _.text())
  .then(_ => processText(_))
  .then(_ => document.body.innerHTML = _);

