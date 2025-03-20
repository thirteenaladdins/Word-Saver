// this parses the dictionary entries and parses it all

let dictionary = [];

document.addEventListener("DOMContentLoaded", async () => {
  await getDictAndRestoreInDom();

  // Add search functionality without debounce for immediate feedback
  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchDict(e.target.value);
    });
  }
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.dictionary) {
    const { newValue, oldValue } = changes.dictionary;
    if (newValue.length > oldValue.length) {
      addNewElement();
    }
  }
});

async function addNewElement() {
  try {
    const data = await chrome.storage.local.get("dictionary");
    dictionary = data.dictionary;

    const wordList = document.getElementById("dictionary");
    const classList = document.getElementsByClassName("collapsible");
    const newNode = dictionary[0];

    if (wordList && classList.length > 0) {
      wordList.insertBefore(addWordToDom(newNode), classList[0]);
    }
  } catch (error) {
    console.error("Error adding new element:", error);
  }
}

async function getDictAndRestoreInDom() {
  try {
    const data = await chrome.storage.local.get("dictionary");
    dictionary = data.dictionary || [];

    const wordList = document.getElementById("dictionary");
    if (wordList) {
      dictionary.forEach((word) => {
        wordList.appendChild(addWordToDom(word));
      });
    }
  } catch (error) {
    console.error("Error restoring dictionary:", error);
  }
}

function addWordToDom(word) {
  const newContainer = document.createElement("li");
  newContainer.className = "collapsible";

  // Add expand indicator
  const expandIndicator = document.createElement("div");
  expandIndicator.className = "expand-indicator";
  newContainer.appendChild(expandIndicator);

  // Handle click events
  newContainer.addEventListener("click", (e) => {
    // Don't toggle if clicking the remove button
    if (e.target.closest(".remove")) return;
    newContainer.classList.toggle("expand");
  });

  const newEntry = document.createElement("li");
  newEntry.className = "content";

  const removeButton = createRemove();
  removeButton.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent container click event
    removeWordAndSave(word);
    removeButton.parentNode.parentNode.remove();
  });
  newEntry.appendChild(removeButton);

  const wordId = word.definition.word;
  const wordElem = document.createElement("p");
  wordElem.className = "word";
  wordElem.innerText = wordId;
  newEntry.appendChild(wordElem);
  newEntry.appendChild(document.createElement("br"));

  if (word.definition.phonetic) {
    const phoneticElem = document.createElement("p");
    phoneticElem.className = "phonetic";
    phoneticElem.innerText = `/${word.definition.phonetic}/`;
    newEntry.appendChild(phoneticElem);
    newEntry.appendChild(document.createElement("br"));
    newEntry.appendChild(document.createElement("br"));
  }

  const wordInfo = populateNode(word);
  newEntry.appendChild(wordInfo);

  newContainer.appendChild(newEntry);
  return newContainer;
}

function createRemove() {
  const removeButton = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  removeButton.setAttribute("viewBox", "0 0 24 24");
  removeButton.setAttribute("class", "remove");

  const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line1.setAttribute("class", "feather");
  line1.setAttribute("x1", "18");
  line1.setAttribute("y1", "6");
  line1.setAttribute("x2", "6");
  line1.setAttribute("y2", "18");
  removeButton.appendChild(line1);

  const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line2.setAttribute("class", "feather");
  line2.setAttribute("x1", "6");
  line2.setAttribute("y1", "6");
  line2.setAttribute("x2", "18");
  line2.setAttribute("y2", "18");
  removeButton.appendChild(line2);

  return removeButton;
}

function populateNode(word) {
  const newEntry = document.createElement("li");

  word.definition.meanings.forEach((meaning) => {
    const typeBox = document.createElement("p");
    typeBox.className = "type";
    typeBox.innerHTML = `<i>${meaning.partOfSpeech}</i>`;
    newEntry.appendChild(typeBox);

    meaning.definitions.forEach((def, index) => {
      if (def.definition) {
        const defElem = document.createElement("p");
        defElem.className = "definition";
        defElem.textContent = `${index + 1}. ${def.definition}`;
        newEntry.appendChild(defElem);
      }

      if (def.example) {
        const exampleBox = document.createElement("p");
        exampleBox.className = "example";
        exampleBox.innerHTML = `<i> "${def.example}"</i>`;
        newEntry.appendChild(exampleBox);
      }

      if (def.synonyms && def.synonyms.length > 0) {
        const synonymBox = document.createElement("p");
        synonymBox.innerHTML = "<i>synonyms: </i>";
        synonymBox.className = "synonym";
        synonymBox.appendChild(
          document.createTextNode(def.synonyms.join(", "))
        );
        newEntry.appendChild(synonymBox);
        newEntry.appendChild(document.createElement("br"));
      }

      newEntry.appendChild(document.createElement("br"));
    });
    newEntry.appendChild(document.createElement("br"));
  });

  return newEntry;
}

function removeWordAndSave(wordObject) {
  const index = getIndex(wordObject);
  if (index !== -1) {
    dictionary.splice(index, 1);
    saveDict();
  }
}

function getIndex(word) {
  return dictionary.findIndex(
    (item) => item.definition.word === word.definition.word
  );
}

async function saveDict() {
  try {
    await chrome.storage.local.set({ dictionary });
    chrome.runtime.sendMessage({ message: dictionary });
  } catch (error) {
    console.error("Error saving dictionary:", error);
  }
}

function searchDict(searchQuery) {
  const wordList = document.getElementById("dictionary");
  if (!wordList) return;

  const items = wordList.getElementsByClassName("collapsible");
  const query = searchQuery.toLowerCase();

  Array.from(items).forEach((item) => {
    const word = item.querySelector(".word")?.textContent.toLowerCase() || "";
    const isMatch = word.includes(query);

    // Show/hide the item based on match
    item.style.display = isMatch ? "" : "none";

    if (isMatch && query) {
      // Highlight the matching text in the word element
      const wordElement = item.querySelector(".word");
      highlightPartialMatches(wordElement, query);
    } else {
      // Remove highlights when no match or no query
      removeHighlights(item);
    }
  });
}

function highlightPartialMatches(element, query) {
  if (!element || !query) return;

  const text = element.textContent;
  const regex = new RegExp(`(${query})`, "gi");
  const matches = text.match(regex);

  if (!matches) return;

  // Create a temporary div to hold the HTML
  const temp = document.createElement("div");
  temp.innerHTML = text.replace(
    regex,
    '<span class="search-highlight">$1</span>'
  );

  // Only update if the content has changed to avoid unnecessary re-renders
  if (element.innerHTML !== temp.innerHTML) {
    element.innerHTML = temp.innerHTML;
  }
}

function removeHighlights(item) {
  // Remove all highlight spans
  const highlights = item.querySelectorAll(".search-highlight");
  highlights.forEach((highlight) => {
    const text = highlight.textContent;
    highlight.replaceWith(text);
  });
}

// we know that the popup will be open when a search is performed...
// so we have to change the view depending on the search
// so anything that doesn't match the search criteria should be removed from the popup...

// so first we have to search the array, we'll worry about the display later
// search the array
