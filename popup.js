// this parses the dictionary entries and parses it all

document.addEventListener('DOMContentLoaded', () => {
  getDictAndRestoreInDom();

  // document.getElementById("search").addEventListener("onChanged", function() {
  //   searchDict(document.getElementById("search").value)
  // })

});
  
chrome.storage.onChanged.addListener((changes) => {
  Object.values(changes).forEach((key) => {
    const storageChange = changes[key];

    if (storageChange.newValue.length > storageChange.oldValue.length) {
      addNewElement();
    }
  });
});

function addNewElement() {
  chrome.storage.local.get({
    dictionary: []
  }, (data) => {
    dictionary = data.dictionary;

    const wordList = document.getElementById('dictionary');
    const classList = document.getElementsByClassName('collapsible');
    const newNode = dictionary[0];
    wordList.insertBefore(addWordToDom(newNode), classList[0]);
  });
}

function getDictAndRestoreInDom() {
  chrome.storage.local.get({ dictionary: [] }, (data) => {
    const wordList = document.getElementById('dictionary');
    dictionary = data.dictionary;
    dictionary.forEach((word) => {
      wordList.appendChild(addWordToDom(word));
    });
  });
}

function addWordToDom(word) {
  const newContainer = document.createElement('li');
  newContainer.className = 'collapsible';
  newContainer.addEventListener('click', () => {
    newContainer.classList.toggle('expand');
  });

  const newEntry = document.createElement('li');
  newEntry.className = 'content';

  const removeButton = createRemove();
  removeButton.addEventListener('click', () => {
    removeWordAndSave(word);
    removeButton.parentNode.parentNode.remove();
  });
  newEntry.appendChild(removeButton);

  const t = word.definition.results[0].id;

  const wordElem = document.createElement('p');
  wordElem.className = 'word';
  wordElem.innerText = t;
  newEntry.appendChild(wordElem);
  newEntry.appendChild(document.createElement('br'));

  const p = word.definition.results[0].lexicalEntries[0].pronunciations[0].phoneticSpelling;
  const phoneticElem = document.createElement('p');
  phoneticElem.className = 'phonetic';
  phoneticElem.innerText = `/${p}/`;
  newEntry.appendChild(phoneticElem);
  newEntry.appendChild(document.createElement('br'));
  newEntry.appendChild(document.createElement('br'));

  const wordInfo = populateNode(word);
  newEntry.appendChild(wordInfo);

  newContainer.appendChild(newEntry);
  return newContainer;
}

function createRemove() {
  const removeButton = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  removeButton.setAttribute('viewBox', '0 0 24 24');
  removeButton.setAttribute('class', 'remove');

  const newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  newLine.setAttribute('class', 'feather');
  newLine.setAttribute('x1', '18');
  newLine.setAttribute('y1', '6');
  newLine.setAttribute('x2', '6');
  newLine.setAttribute('y2', '18');
  removeButton.appendChild(newLine);

  const newLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  newLine2.setAttribute('class', 'feather');
  newLine2.setAttribute('x1', '6');
  newLine2.setAttribute('y1', '6');
  newLine2.setAttribute('x2', '18');
  newLine2.setAttribute('y2', '18');
  removeButton.appendChild(newLine2);

  return removeButton;
}

function populateNode(word) {
  const newEntry = document.createElement('li');
  Object.values(word.definition.results[0].lexicalEntries).forEach((key) => {
    const typeBox = document.createElement('p');
    typeBox.className = 'type';
    typeBox.innerHTML = `<i>${key.lexicalCategory}</i>`;
    newEntry.appendChild(typeBox);

    for (let i = 0; i < key.entries[0].senses.length; i += 1) {
      const value = key.entries[0].senses;
      if (value[i].definitions) {
        const def = document.createElement('p');
        def.className = 'definition';
        const t2 = document.createTextNode(`${i + 1}. ${value[i].definitions}`);
        newEntry.appendChild(t2);
      }

      if (value[i].crossReferenceMarkers) {
        const referenceBox = document.createElement('p');
        referenceBox.className = 'reference';
        referenceBox.innerHTML = `${i + 1}. ${value[i].crossReferenceMarkers[0]}`;
        newEntry.appendChild(referenceBox);
      }

      if (value[i].examples) {
        const exampleBox = document.createElement('p');
        exampleBox.className = 'example';
        exampleBox.innerHTML = `<i> "${value[i].examples[0].text}"</i>`;
        newEntry.appendChild(exampleBox);
      }

      if (value[i].thesaurusLinks) {
        if (word.synonyms) {
          Object.values(word.synonyms.results[0].lexicalEntries[0].entries[0].senses)
            .forEach((info) => {
              if (info.id === value[i].thesaurusLinks[0].sense_id) {
                const synonymBox = document.createElement('p');
                synonymBox.innerHTML = '<i>synonyms: </i>';
                synonymBox.className = 'synonym';

                const arr = [];

                Object.values(info.synonyms).forEach((syno) => {
                  arr.push(syno.text);
                });

                const f = arr.join(', ');
                const g = document.createTextNode(f);
                synonymBox.appendChild(g);
                newEntry.appendChild(synonymBox);
                newEntry.appendChild(document.createElement('br'));
              }
            });
        }
      }
      newEntry.appendChild(document.createElement('br'));
    }
    newEntry.appendChild(document.createElement('br'));
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
  for (let i = 0; i < dictionary.length; i += 1) {
    if (dictionary[i].definition.results[0].id === word.definition.results[0].id) {
      return i;
    }
  }
  return -1;
}

function saveDict() {
  chrome.runtime.sendMessage({ message: dictionary });
}

function searchDict(searchQuery) {
  console.log(searchQuery)
}
// function searchDict() {
//    chrome.storage.local.get({
//     dictionary: []
//   }, (data) => {
//     dictionary = data.dictionary;
//     // compare the strings here 
//     // do we even need to get the dict from storage?
//     // or is the dictionary 
//     // 
//   })
// }

// we know that the popup will be open when a search is performed... 
// so we have to change the view depending on the search
// so anything that doesn't match the search criteria should be removed from the popup...

// so first we have to search the array, we'll worry about the display later
// search the array