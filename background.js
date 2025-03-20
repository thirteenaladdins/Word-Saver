const language = "en";

let dictionary = [];

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "Save",
    title: "Save word",
    contexts: ["selection"],
  });
  initDict();

  // Request notification permission when extension is installed
  chrome.notifications.getPermissionLevel((level) => {
    if (level !== "granted") {
      chrome.notifications.requestPermission();
    }
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message) {
    dictionary = request.message;
    saveDict();
  }
  return true; // Keep the message channel open for async response
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((clickData) => {
  const word = clickData.selectionText.toLowerCase().trim();
  const check = checkForWord(word);

  if (check !== true) {
    getWordDefinition(word)
      .then((wordData) => {
        if (wordData && wordData.length > 0) {
          const wordObject = {
            definition: wordData[0],
            synonyms: wordData[0].meanings
              .flatMap((meaning) => meaning.definitions)
              .filter((def) => def.synonyms)
              .flatMap((def) => def.synonyms),
          };
          addWordToDictAndSave(wordObject);
        }
      })
      .catch((error) => {
        // Only show error notification if it's not a "word not found" error
        if (error.message !== "Word not found") {
          showNotification({
            type: "basic",
            iconUrl: "icons/icon128.png",
            title: "Error",
            message:
              "There was an error fetching the word definition. Please try again.",
          });
        }
        console.error("Error processing word:", error);
      });
  } else {
    moveWordToTop(word);
  }
});

// Helper function to show notifications with permission check
function showNotification(notificationOptions) {
  chrome.notifications.getPermissionLevel((level) => {
    if (level === "granted") {
      chrome.notifications.create(notificationOptions);
    } else {
      // If notifications aren't granted, show a message in the console
      console.log(
        "Notifications are disabled. Please enable them in Chrome settings."
      );
    }
  });
}

async function initDict() {
  try {
    const data = await chrome.storage.local.get("dictionary");
    dictionary = data.dictionary || [];
  } catch (error) {
    console.error("Error initializing dictionary:", error);
    dictionary = [];
  }
}

async function getWordDefinition(word) {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
        word
      )}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        // Show notification that word wasn't found
        showNotification({
          type: "basic",
          iconUrl: "icons/icon128.png",
          title: "Word Not Found",
          message: `"${word}" was not found in the dictionary. Please check the spelling or try a different word.`,
        });
        throw new Error("Word not found");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching word definition:", error);
    throw error;
  }
}

function checkForWord(word) {
  return dictionary.some((key) => key.definition.word === word);
}

function moveWordToTop(word) {
  const index = getIndex(word);
  if (index !== -1) {
    dictionary.unshift(dictionary.splice(index, 1)[0]);
    saveDict();
  }
}

function getIndex(word) {
  return dictionary.findIndex((item) => item.definition.word === word);
}

function addWordToDictAndSave(newWord) {
  dictionary.unshift(newWord);
  saveDict();
}

async function saveDict() {
  try {
    await chrome.storage.local.set({ dictionary });
  } catch (error) {
    console.error("Error saving dictionary:", error);
  }
}
