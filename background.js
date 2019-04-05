const appId = 'cca24fe8';
const appKey = '5da9afd01fd6bbf783145888c25477e8';
const language = 'en';

let dictionary;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'Save',
    title: 'Save word',
    contexts: ['selection']
  });
});

initDict();

chrome.runtime.onMessage.addListener((request) => {
  dictionary = request.message;
  saveDict();
});

chrome.contextMenus.onClicked.addListener((clickData) => {
  const wordObject = {};
  // console.log(dictionary);
  getHeadWord('inflections', clickData.selectionText)
    .then((data) => {
      const inflection = data.results[0].lexicalEntries[0].inflectionOf[0].id;
      const check = checkForWord(inflection);

      if (check !== true) {
        getDefinition('entries', inflection)
          .then((passData) => {
            wordObject.definition = passData;
            const text = passData.results[0].id;
            getSynonyms('entries', text)
              .then((passData2) => {
                wordObject.synonyms = passData2;
                addWordToDictAndSave(wordObject);
              })
              .catch(() => {
                addWordToDictAndSave(wordObject);
              });
          });
      } else {
        moveWordToTop(inflection);
      }
    });
});

function initDict() {
  chrome.storage.local.set({
    dictionary
  });
  chrome.storage.local.get({
    dictionary: []
  }, (data) => {
    dictionary = data.dictionary;
  });
}

function getHeadWord(type, word) {
  const wordFormat = word.toLowerCase().trim();
  const search = `https://od-api.oxforddictionaries.com/api/v1/${type}/${language}/${fixedEncodeURIComponent(wordFormat)}`;

  const promiseObj = new Promise(((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', search, true);
    xhr.setRequestHeader('app_key', appKey);
    xhr.setRequestHeader('app_id', appId);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const respJson = JSON.parse(xhr.responseText);
          resolve(respJson);
        } else {
          reject(xhr.status);
        }
      }
    };
  }));
  return promiseObj;
}

function getDefinition(type, word) {
  const wordFormat = word.toLowerCase().trim();
  const search = `https://od-api.oxforddictionaries.com/api/v1/${type}/${language}/${fixedEncodeURIComponent(wordFormat)}`;

  const promiseObj = new Promise(((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', search, true);
    xhr.setRequestHeader('app_key', appKey);
    xhr.setRequestHeader('app_id', appId);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const respJson = JSON.parse(xhr.responseText);
          resolve(respJson);
        } else {
          reject(xhr.status);
        }
      }
    };
  }));
  return promiseObj;
}

function getSynonyms(type, word) {
  const wordFormat = word.toLowerCase().trim();
  const search = `https://od-api.oxforddictionaries.com/api/v1/${type}/${language}/${fixedEncodeURIComponent(wordFormat)}/synonyms`;

  const promiseObj = new Promise(((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', search, true);
    xhr.setRequestHeader('app_key', appKey);
    xhr.setRequestHeader('app_id', appId);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const respJson = JSON.parse(xhr.responseText);
          resolve(respJson);
        } else {
          reject(xhr.status);
        }
      }
    };
  }));
  return promiseObj;
}

function checkForWord(word) {
  for (const key of dictionary) {
    if (key.definition.results[0].id === word) {
      // console.log('word exists in array');
      return true;
    }
  }
  // console.log("word doesn't exist in array");
  return false;
}

function moveWordToTop(word) {
  const index = getIndex(word);

  if (index !== -1) {
    dictionary.unshift(dictionary.splice(index, 1)[0]);
    saveDict();
  }
}

function getIndex(word) {
  for (let i = 0; i < dictionary.length; i += 1) {
    if (dictionary[i].definition.results[0].id === word) {
      return i;
    }
  }
  return -1;
}

function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => `%' ${c.charCodeAt(0).toString(16)}`);
}

function addWordToDictAndSave(newWord) {
  dictionary.unshift(newWord);
  saveDict();
}

function saveDict() {
  chrome.storage.local.set({
    dictionary
  });
}
