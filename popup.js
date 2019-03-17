// first step of learning faster is no more books
// no more writing ntoe that i'll never read
// good. We've made an optimisation that will pay ten fold
// there's still an issue with removing items from the dict
// where they're not actually being removed or something is being added when it shouldn't be

// removeIndex

document.addEventListener('DOMContentLoaded', function() {

    getDictAndRestoreInDom();
    // document.getElementById('clearAll').addEventListener('click', function() {
    //     chrome.storage.local.clear();
    //     let fullDict = document.getElementsByClassName('collapsible');
    //     while (fullDict[0]) {
    //         fullDict[0].remove();
    //         // removeWordAndSave();
    //     }
    // })
    

    let right = document.getElementById('feather-arrow');
    right.addEventListener('click', function() {
        // chrome.browserAction.setPopup({popup: "settings.html"})



    })

    // let classList = document.getElementsByClassName('content');
    // console.log(classList);
})

chrome.extension.onMessage.addListener(function(request, sender) {
    let classList = document.getElementsByClassName('word');
    console.log(classList);
    for (let i = 0; i < classList.length; i++) {
        if (request.greeting == classList[i].innerText) {
            classList[i].parentNode.parentNode.remove();
        }
    }
})

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
          var storageChange = changes[key];
          console.log(storageChange.newValue.length, storageChange.oldValue.length)

      if (storageChange.newValue.length > storageChange.oldValue.length) {
            addNewElement();
        }
    }
})

function addNewElement() {
    chrome.storage.local.get({
        dictionary: []
    }, function(data) {
        dictionary = data.dictionary;

        let wordList = document.getElementById("dictionary");
        let classList = document.getElementsByClassName('collapsible');
        let newNode = dictionary[0];
        wordList.insertBefore(addWordToDom(newNode), classList[0]);
    })
}

function getDictAndRestoreInDom() {
    chrome.storage.local.get({
        dictionary: []
    }, function(data) {
        dictionary = data.dictionary;
        let wordList = document.getElementById("dictionary");
        dictionary.forEach(function(word) {
            wordList.appendChild(addWordToDom(word));
        });
    });
}

function isLetter(s) {
    return s.match("^[a-zA-Z\(\)]+$");
}

function searchDict(searchQuery) {
    // it needs to return a new search for each extra letter that's returned
    // 

}

function addWordToDom(word) {
    let newContainer = document.createElement('li');
    newContainer.className = "collapsible";


    newContainer.addEventListener('click', function() {

        this.classList.toggle('expand');
        // console.log(this);
        // select this part of the 
        // this.toggle('expand');

        // if the height is 20% then set it to none
        // if height is none or isn't specified 
        // set to 20%
        // I know how to do this. 
        // right here we click and minimise the 
    })
    // let checker = document.createElement('checkbox');


    let newEntry = document.createElement("li");
    newEntry.className = "content";

    let removeButton = document.createElementNS('http://www.w3.org/2000/svg', "svg");
    removeButton.setAttribute("viewBox", "0 0 24 24");
    removeButton.setAttribute("class", "remove");
    removeButton.addEventListener('click', function() {
        removeWordAndSave(word);
        this.parentNode.parentNode.remove();
    })

    let newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
    newLine.setAttribute('class','feather');
    newLine.setAttribute('x1','18');
    newLine.setAttribute('y1','6');
    newLine.setAttribute('x2','6');
    newLine.setAttribute('y2','18');
    removeButton.appendChild(newLine);

    let newLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    newLine2.setAttribute('class','feather');
    newLine2.setAttribute('x1','6');
    newLine2.setAttribute('y1','6');
    newLine2.setAttribute('x2','18');
    newLine2.setAttribute('y2','18');
    removeButton.appendChild(newLine2);

    newEntry.appendChild(removeButton);

    let t = word.word;

    let arr = [];
    for (let letter of word.word) {
        if (isLetter(letter)) {
            arr.push(letter);
        }
    }
    t = arr.join("");

    let wordElem = document.createElement('p');
    wordElem.className = 'word';
    wordElem.innerText = t;
    newEntry.appendChild(wordElem);
    newEntry.appendChild(document.createElement('br'));

    let p = word.phonetic;
    let phoneticElem = document.createElement('p');
    phoneticElem.className = 'phonetic';
    phoneticElem.innerText = "/" + p + "/";
    newEntry.appendChild(phoneticElem);
    newEntry.appendChild(document.createElement('br'));
    newEntry.appendChild(document.createElement('br'));

    for (let key in word.meaning) {
        let typeBox = document.createElement('p');
        typeBox.className = "type";
        typeBox.innerHTML = "<i>" + key + "</i>";
        newEntry.appendChild(typeBox);

        for (let i = 0; i < word.meaning[key].length; i++) {
            let value = word.meaning[key];

            if (value[i].definition) {
                let def = document.createElement('p');
                def.className = "definition";
                let t = document.createTextNode((i + 1) + "." + " " + value[i].definition);
                newEntry.appendChild(t);
                newEntry.appendChild(document.createElement('br'));
            }
            if (value[i].example) {
                // I also want to add "example and synonyms"
                let exampleBox = document.createElement('p');
                exampleBox.className = "example";
                exampleBox.innerHTML = "<i> \"" + value[i].example + "\"</i>";
                newEntry.appendChild(exampleBox);
                // let t = document.createTextNode(value[i].example);
                // newEntry.appendChild(t);
                // newEntry.appendChild(document.createElement('br'));
            }
            if (value[i].synonyms) {
                let synArray = value[i].synonyms.toString().split(",");
                // console.log(synArray);

                let synonymBox = document.createElement('p');
                synonymBox.innerHTML = "<i>synonyms: </i>";
                synonymBox.className = "synonym";
                for (let i = 0; i < synArray.length; i++) {
                    if (i == synArray.length - 1) {
                        let g = document.createTextNode(synArray[i])
                        synonymBox.appendChild(g);
                    } else {
                        let g = document.createTextNode(synArray[i] + ", ");
                        synonymBox.appendChild(g);
                    }
                }

                synonymBox.className = "synonym";
                newEntry.appendChild(synonymBox);
                newEntry.appendChild(document.createElement('br'));
            }
            newEntry.appendChild(document.createElement('br'));
        }
        newEntry.appendChild(document.createElement('br'));

    }
    newContainer.appendChild(newEntry);
    return newContainer;
}

function removeWordAndSave(word) {
    const index = dictionary.map(e => e.word).indexOf(word.word);

    // let index = dictionary.indexOf(word);
    console.log(index);
    console.log(dictionary);
    if (index != -1) {
        dictionary.splice(index, 1);
        saveDict();
    }
    console.log(dictionary);
}

function saveDict() {
    chrome.storage.local.set({
        dictionary
    })

}