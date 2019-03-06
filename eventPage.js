chrome.runtime.onInstalled.addListener(function() {
    let thisMenu = chrome.contextMenus.create({
        "id": "Save",
        "title": "Save word",
        "contexts": ["selection"]
    });

})

let dictionary = [];

chrome.contextMenus.onClicked.addListener(function(clickData) {
    readifyDict(clickData.selectionText);
})

function readifyDict(clickData) {
    chrome.storage.local.get({
        dictionary: []
    }, function(data) {
        let arr;
        arr = data.dictionary;
        // console.log(arr);
        getWordDefinition(arr, clickData);
    })
}

function getWordDefinition(dict, search) {
    console.log(search);
    search = search.toLowerCase()
    console.log(search);
    var searchQuery = "https://googledictionaryapi.eu-gb.mybluemix.net/?define=" + search;
        fetch(searchQuery)
            .then((response) => response.json())
            .then((data) => {
                let checker = formatWord(data);
                // console.log(checker);
                return checker;
            })
            .then((data) => {
                let result = checkForWord(dict, data);
                // console.log("it's too late");
                if (!result) {
                    addWordToDictAndSave(data);
                }
            })
}

function formatWord(word) {
    let arr = [];
    for (let letter of word.word) {
        if (isLetter(letter)) {
            arr.push(letter);
        }
    }
    // console.log(arr);
    word.word = arr.join("");
    // console.log(word.word);
    return word;
}

function isLetter(s) {
    return s.match("^[a-zA-Z\(\)]+$");
}

// if this result returns true then do nothing but if it returns false then add the new word to the dictionary
// feature I want to add is move the word up to the 0 index if it's a word that already exists in the array
// that would mean a word is prioritised. 
// I should also allow words to be reorganised. 
// the highlight feature would also be pretty cool and would be quitesimple to do. 

function checkForWord(dict, word) {
    for (let key of dict) {
        if (key.word == word.word) {
            console.log("word exists in array");
            return true;
        } 
    }
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

// function fixedEncodeURIComponent(str) {
//     return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
//         return '%' + c.charCodeAt(0).toString(16);
//     });
// }