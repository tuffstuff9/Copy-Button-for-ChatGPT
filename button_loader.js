function addButton(textElement) {
  const svgElement = textElement.querySelector('svg');
  if (svgElement && !hasButtonAncestor(svgElement)) {
    const textEndDiv = textElement.querySelector(':scope div.items-end');
    if (textEndDiv) {
      // Check if there's already a btn-copy button
      const existingButton = textEndDiv.querySelector('.btn-copy');
      if (!existingButton) {
        textEndDiv.insertAdjacentHTML(
          'beforeend',
          `
        <button class="btn-copy">
        <svg style="pointer-events: none;" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g>
        <g id="SVGRepo_iconCarrier"> 
        <g clip-path="url(#clip0_429_11155)"> 
        <path d="M16 3H4V16" stroke="#d9d9e2" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round"></path> 
        <path d="M8 7H20V19C20 20.1046 19.1046 21 18 21H10C8.89543 21 8 20.1046 8 19V7Z" stroke="#d9d9e2" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round"></path>
        </g> <defs> <clipPath id="clip0_429_11155"> <rect width="24" height="24" fill="white"></rect> </clipPath> </defs> </g></svg>
        </button>
        `
        );

        // Add a click event listener to the button
        const button = textEndDiv.querySelector('.btn-copy');
        button.addEventListener('click', (event) => {
          const grandparentDiv =
            event.target.parentElement.parentElement.parentElement;
          const markdownDiv = grandparentDiv.querySelector('.markdown');

          copyHtmlWithFormatting(markdownDiv.innerHTML);
        });
      }
    }
  }
}

function addButtonsToNewPage() {
  let disconnectTimeout;

  const textObserver = new MutationObserver((mutationsList, textObserver) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((addedNode) => {
          if (addedNode.nodeType === Node.ELEMENT_NODE) {
            let foundTextBase = false;

            // Check if the addedNode itself has the 'text-base' class
            if (addedNode.classList.contains('text-base')) {
              addButton(addedNode);
              foundTextBase = true;
            }

            // Check if any descendants of the addedNode have the 'text-base' class
            const textBaseElements = addedNode.querySelectorAll('.text-base');
            textBaseElements.forEach((element) => {
              addButton(element);
              foundTextBase = true;
            });

            // // If a 'text-base' element was found, clear the previous timeout and set a new one
            // if (foundTextBase) {
            //   clearTimeout(disconnectTimeout);
            //   disconnectTimeout = setTimeout(() => {
            //     textObserver.disconnect();
            //   }, 2000);
            // }
          }
        });
      }
    }
  });

  textObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function hasButtonAncestor(element) {
  while (element) {
    if (element.tagName && element.tagName.toLowerCase() === 'button') {
      return true;
    }
    element = element.parentElement;
  }
  return false;
}

async function copyHtmlWithFormatting(html) {
  // Create an HTML element and set its innerHTML to the provided HTML code
  const htmlElement = document.createElement('div');
  htmlElement.innerHTML = html;

  // Replace block-level elements with newline characters
  ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr'].forEach(
    (tag) => {
      htmlElement.querySelectorAll(tag).forEach((el) => {
        el.insertAdjacentText('beforeend', '\n');
      });
    }
  );

  // // Add an additional newline character at the end of all element except tables
  ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((tag) => {
    htmlElement.querySelectorAll(tag).forEach((el) => {
      el.insertAdjacentText('beforeend', '\n');
    });
  });

  // Add tabs between table cells and newline characters at the end of each row
  htmlElement.querySelectorAll('tr').forEach((tr) => {
    tr.querySelectorAll('td, th').forEach((cell, index, array) => {
      if (index < array.length - 1) {
        cell.insertAdjacentText('beforeend', '\t');
      }
    });
  });

  // Get the plain text from the HTML element and trim it
  const plainText = htmlElement.innerText.trim();

  // Create a ClipboardItem object with both the HTML and plain text MIME types
  const clipboardItem = new ClipboardItem({
    'text/html': new Blob([html], { type: 'text/html' }),
    'text/plain': new Blob([plainText], { type: 'text/plain' }),
  });

  // Use the Clipboard API to copy the formatted HTML and plain text to the clipboard
  try {
    await navigator.clipboard.write([clipboardItem]);
  } catch (err) {
    console.error('Failed to copy formatted HTML and plain text: ', err);
  }
}

addButtonsToNewPage();
