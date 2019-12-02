// Helper stuff
function findElement(id) {
  try {
    return document.getElementById(id)
  } catch (e) {
    toggleError(e)
  };
};

const NodeTree = findElement('nodesTree');
const ErrorBanner = findElement('description');
const parseErrorMessage = 'String should contain only DIV and HTML tags';
const searchErrorMessage = 'Nothing found. Try once more.';
const parseMessage = document.createTextNode(parseErrorMessage);
const searchMessage = document.createTextNode(searchErrorMessage);
const searchInput = findElement('search-string');
const htmlInput = findElement('html-string');


// Displaying toast
function startToast() {
  const toast = findElement('toast');
  toast.className = 'show';
  setTimeout(() => {
    toast.className = toast.className.replace('show', '');
  }, 2000);
};

// Handling errors
function toggleError(msg) {
  ErrorBanner.textContent = '';
  ErrorBanner.append(msg);
  startToast();
};

// Extracting div attributes
function getBlockAttributes(place, block) {
  let blockId = '';
  let blockClass = '';
  let result = ` ${block.localName.toUpperCase()} `;
  if (block.id !== undefined) { blockId = block.id; }
  if (block.className !== undefined) { blockClass = block.className; }
  if (blockId) { result += ` Id = ${blockId}. `; }
  if (blockClass) { result += ` Class = ${blockClass} `; }
  return block.insertAdjacentHTML(place, result);
};

// Handle tree controls
function changeClass(elements) {
  for (let element of elements) {
    element.classList.toggle('inactive');
  }
};

function handleCollapsing(element) {
  element.classList.toggle('closed');
  changeClass(element.children);
};

// Validating and formatting string for handling tags

function createElementFromHTML(htmlString) {
  NodeTree.innerHTML = htmlString.trim();
  const divs = NodeTree.querySelectorAll('div');
  for (let block of divs) {
    getBlockAttributes('afterbegin', block);
    if (block.children.length) {
      block.classList.add('parent');
      block.addEventListener('click', (event) => {
        event.stopPropagation();
        handleCollapsing(event.target);
      });
    } else {
      block.classList.add('child');
    }
  }
}

function validateString(htmlString) {
  const firstStep = /<[a-z/][\s\S]*>/i;
  const secondStep = /<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/i;
  const thirdStep = /<div([^\/>]+)\/>/gi;

  if (firstStep.test(htmlString) && !secondStep.test(htmlString)) {
    const formattedString = htmlString.replace(thirdStep, '<div $1></div>');
    createElementFromHTML(formattedString);
  } else {
    toggleError(parseMessage);
  }
};

function getString() {
  const htmlString = findElement('html-string').value;
  return htmlString
    ? validateString(htmlString)
    : toggleError(parseErrorMessage);
};

// Handle searching the elements

function highlightSearchedElement(elements) {
  console.log(elements);
  setTimeout(()=> {
    for (let element of elements) {
      element.classList.add('found');
      // handleExpanding(element);
      element.scrollIntoView({behavior: "smooth"});
    }
  },100)
};

function removeHighlight() {
  const marked = document.querySelectorAll('.found');
  if (marked.length > 0) {
    marked.forEach((el) => el.classList.remove('found'));
  }
};

function searchString() {
  getString();
  let searchedString = findElement('search-string').value;
  let searchedElements;
  if (searchedString.length > 0) {
    const findInt = parseInt(searchedString.substr(1, searchedString.length))
    const idOrClass = searchedString.substr(0, 1) === '#' ? 'id' : 'class';
    if (!isNaN(findInt)) {
      searchedString = searchedString.replace(/((#|.)(\d+))/gi, `[${idOrClass}='$3']`)
    }
    try {
      searchedElements = NodeTree.querySelectorAll(searchedString);
      if (searchedElements.length > 0) {
        highlightSearchedElement(searchedElements);
      } else {
        toggleError(searchMessage);
      }
    } catch {
      toggleError('Invalid query selector');
    }
  } else {
    toggleError(searchMessage);
  }
  return false;
};

function search(ev) {
  if (ev.keyCode === 32) {
    ev.preventDefault();
    return false;
  }
}

// Listeners for inputs
searchInput.addEventListener('keypress', search);

htmlInput.addEventListener('keypress', (ev) => (ev.keyCode === 13 ? getString() : null));


