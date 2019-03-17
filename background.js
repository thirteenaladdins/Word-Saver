chrome.runtime.onInstalled.addListener(function() {
    let thisMenu = chrome.contextMenus.create({
        "id": "Save",
        "title": "Save word",
        "contexts": ["selection"]
    });
})

let dictionary;

chrome.storage.local.set({dictionary: []})

chrome.storage.local.get(null, function(data) {
    dictionary = data.dictionary;
})

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
    // console.log(search);
    search = search.toLowerCase().trim();
    // fixedEncodeURIComponent(search)
    // console.log(search);

    var searchQuery = "https://googledictionaryapi.eu-gb.mybluemix.net/?define=" + search;
    console.log(searchQuery);
        fetch(searchQuery)
            .then((response) => response.json())
            // .then((data) => {
            //     return data;
            // })
            .then((data) => {
                let result = checkForWord(dict, data);
                // console.log("it's too late");
                if (!result) { 
                    addWordToDictAndSave(data);
                } else {
                    // var forRemoval = data.word;
                    chrome.extension.sendMessage({greeting: data.word}, function(response) {
                        console.log(response);
                    })
                    
                    // pass message instead?
                    // console.log(forRemoval);
                    // var 
                    moveWordToTop(data);
                    // move word to top in the popup
                    // not here.

                    // send message. 
                // shuffle in the dict here. 
                // remove from the current position .
                // unshift to top of the array 

                }
            })

}
        // const xhr = new XMLHttpRequest;

        // xhr.open("GET", searchQuery, true);

        // xhr.onreadystatechange = function(searchQuery) {
        //     if (xhr.readyState == 4) {
        //         //do something in here
        //         let parser = new DOMParser();
        //         let doc = parser.parseFromString(xhr.responseText, "text/html");
        //         console.log(doc);
        //         let rel = JSON.parse(doc.querySelector('body'));
        //         // parseText = xhr.responseText;
        //         //the result will be passed in here. 
        //         addWordToDictAndSave(rel);
        //     }
      
        // }
        //   xhr.send()


// refresh everthing. 
// delete all and then re add all from dict because there's going to be a new dictionary anyway
// there is a better way I'm sure but I'll figure something out

// if the word has already been saved, move this word to the top of the dict

// function theWord(word) {
//     // const index = dictionary.map(e => e.word).indexOf(word.word);
//     // return index;
// }

function moveWordToTop(word) {
    removeWordAndSave(word);
    dictionary.unshift(word);
    saveDict();
    // find word in dict... 
}

function removeWordAndSave(word) {
    const index = dictionary.map(e => e.word).indexOf(word.word);
    // let index = dictionary.indexOf(word);
    // console.log(index);
    // console.log(dictionary);
    if (index != -1) {
        dictionary.splice(index, 1);
        saveDict();
    }
    // console.log(dictionary);
    // return index;
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
            // console.log("word exists in array");
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

function fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16);
    });
}

// (function (global) {


// // Makes an Ajax GET request to 'requestUrl'
// ajaxUtils.sendGetRequest = 
//   function(requestUrl, responseHandler, isJsonResponse) {
//     var request = getRequestObject();
//     request.onreadystatechange = 
//       function() { 
//         handleResponse(request, 
//                        responseHandler,
//                        isJsonResponse); 
//       };
//     request.open("GET", requestUrl, true);
//     request.send(null); // for POST only
//   };


// // Only calls user provided 'responseHandler'
// // function if response is ready
// // and not an error
// function handleResponse(request,
//                         responseHandler,
//                         isJsonResponse) {
//   if ((request.readyState == 4) &&
//      (request.status == 200)) {

//     // Default to isJsonResponse = true
//     if (isJsonResponse == undefined) {
//       isJsonResponse = true;
//     }

//     if (isJsonResponse) {
//       responseHandler(JSON.parse(request.responseText));
//     }
//     else {
//       responseHandler(request.responseText);
//     }
//   }
// }


// // Expose utility to the global object
// global.$ajaxUtils = ajaxUtils;


// })(window);