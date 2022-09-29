// CONFIG
// sceneTransitionPassages -> Add the name of the button (/passage) that leads to the next scene. Note: this is case sensitive!
const config = {
  sceneTransitionPassages: [
    {name: 'look left', sceneNumber: 2},
    {name: 'look up', sceneNumber: 3}

  ],
  charactersPerMinute: 863
}

// SETUP elements
let autoplayTimeout;
let passageName = '';
let linksBuffer;
let currentSceneNum = 1;

const startScreenEl = document.createElement('main');
const startScreenImgEl = document.createElement('img');
startScreenEl.id = 'startScreenElement';
startScreenImgEl.id = 'startScreenImgElement';
startScreenImgEl.src = "./images/logo.png";

startScreenEl.setAttribute('visible', '');

startScreenEl.appendChild(startScreenImgEl);
document.body.appendChild(startScreenEl);

startScreenEl.addEventListener('click', () => startScreenEl.removeAttribute('visible'));

const containerEl = document.createElement('div');
const containerContentEl = document.createElement('div');
containerEl.id = 'containerElement';
containerContentEl.id = 'containerContentElement';
containerEl.appendChild(containerContentEl);
document.body.appendChild(containerEl);

const clockDateEl = document.createElement('div');
clockDateEl.id = 'timeDateLocationContainer';
clockDateEl.innerHTML = '<div><span>[time] 11:00</span> <span>[date] 11/12/2002</span></div><span>[location] Utrecht</span> ';
document.body.appendChild(clockDateEl);

// SETUP DATABSE
const firebaseConfig = {
  apiKey: "AIzaSyDCzWf8j7UIbgktIpRITXmsJezewAuIMdE",
  authDomain: "krieg-2020.firebaseapp.com",
  projectId: "krieg-2020",
  storageBucket: "krieg-2020.appspot.com",
  messagingSenderId: "349586149978",
  appId: "1:349586149978:web:79af88e60ec5454013be63"
};

firebase.initializeApp(firebaseConfig);
const FIRESTORE = firebase.firestore();


FIRESTORE.collection('plays').add({timeCreated: Date.now()}).then((docRef) => {
  window.dbId = docRef.id;
  // window.dbId = 'QiE6T4aEic41tQzykfda';
  
  FIRESTORE.collection(`plays`).doc(window.dbId).onSnapshot((doc) => {
    _handlePlayDbChanged(doc.data());
  });
  FIRESTORE.collection(`plays`).doc(window.dbId).collection('events').where('timeCreated', '>', Date.now()).onSnapshot((snapshot) => {

    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
          _handlePlayDbEventChanged(change.doc.data());
      }
    });
  })
});

// DB functions
function _setPassageInDb(el) {
  if(!FIRESTORE || !window.dbId) return;
  FIRESTORE.collection(`plays`).doc(window.dbId).update({
    currentPassageText: el.innerText,
    currentPassageTags: el.getAttribute('tags'),
    currentPassageName: passageName
  });
}

function _handlePlayDbChanged(dbData) {
  window.dbData = dbData;
}

// HELPER functions
function setElementVisiblity(el, visible, visibleDisplayType = 'block') {  
  el.style.display = visible ? visibleDisplayType : 'none';
}

function setContainerElContent(content) {
  document.getElementById('containerContentElement').innerText = content;
}


function setContainerElVisibility(visible = true) {
  updateBooleanAttribute(document.getElementById('containerElement'), 'visible', visible);
}

function setTimeLocationElVisibility(visible = true) {
  setElementVisiblity(document.getElementById('timeDateLocationContainer'), visible)
}

function getPassageLinks(el) {
  return Array.from($( el ).find('tw-link'));
}

function getPassageTags(el = document.querySelector('tw-passage')) {
  return el.getAttribute('tags');
}

function updateBooleanAttribute(el, attr, bool) {
  if(bool === true) {
    el.setAttribute(attr, '');
  } else {
    el.removeAttribute(attr)
  }
}

function setTimeAndDateOnClock(timeStr, dateStr, locationStr) {
  // TODO Hacky....
  const containerEl = document.getElementById('timeDateLocationContainer');
  const divEl = containerEl.querySelector('div');
  if(timeStr) divEl.querySelector('span').innerText = `[time] ${timeStr}`
  if(dateStr) divEl.querySelectorAll('span')[1].innerText = `[date] ${dateStr}`
  if(locationStr) containerEl.querySelectorAll('span')[2].innerText = `[location] ${locationStr}`
}

function _handlePlayDbEventChanged(dbData) {
  if(dbData.time, dbData.date, dbData.loc) setTimeAndDateOnClock(dbData.time, dbData.date, dbData.loc)
  if(dbData.showContainer) setContainerElVisibility(true);
  if(dbData.hideContainer) setContainerElVisibility(false);
  if(dbData.hideLinks) alterDisplayCurrentPassageLinks('none');
  if(dbData.showLinks) alterDisplayCurrentPassageLinks('block');
  if(dbData.containerContent) setContainerElContent(dbData.containerContent);
  if(dbData.charactersPerMinute) config.charactersPerMinute = dbData.charactersPerMinute;
}

function charsToMs(chars = 0, charsPerMinute = 863) {
  const minutes = chars / charsPerMinute;
  console.log(minutes, chars, charsPerMinute)
  return minutes * 60000;
}

function startAutoplayPassage(el, linkEl, ms = 5000) {
  linkEl.setAttribute('next-button', '');
  // autoplayTimeout = window.setTimeout(() => {
  //   linkEl.click();
  // }, ms);
}

function stopAutoplayPassage() {
  window.clearTimeout(autoplayTimeout);
}

function alterDisplayCurrentPassageLinks(display = 'block') {
  const passageEl = document.querySelector('tw-passage');
  const links = getPassageLinks(passageEl);
  links.map(el => el.style.display = display);
  stopAutoplayPassage();
}

function awaitTransition(el) {
  return new Promise((resolve, reject) => {
    function _handleDomUpdate(mutationsList) {
      for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            const removedEls = Array.from(mutation.removedNodes);
            const transitionElIndex = removedEls.findIndex(el => el.nodeName.toLowerCase() === 'tw-transition-container');
            if(transitionElIndex >= 0) {
              passageObserver.disconnect();

              resolve();
            }
        }
      }
  
    }
    // Create an observer instance linked to the callback function
    const passageObserver = new MutationObserver(_handleDomUpdate);

    // Start observing the target node for configured mutations
    passageObserver.observe(el, { childList: true });
  });
  
}

function _handleLinkClick(evt) {
  if(evt.target.nodeName.toLowerCase() === 'tw-link') {
    passageName = evt.target.innerText;
    _handlePassageNameChanged(passageName);
  }
}

function _handleLinksOnPassageEntered(el) {
  if(linksBuffer) linksBuffer.forEach(link => {
    link.removeEventListener('click', _handleLinkClick);
  })
  const links = getPassageLinks(el);
  const tags = getPassageTags(el);
  linksBuffer = links;
  if(links.length === 1 && tags.includes('no-autoplay') === false) startAutoplayPassage(el, links[0], charsToMs((el.innerText || '').length, config.charactersPerMinute));
  links.forEach(link => link.addEventListener('click', _handleLinkClick))
}

function setPassageLoadingAttributes(el, passageLoading = true) {
  if(passageLoading) {
    el.setAttribute('loading', '');
    el.removeAttribute('loaded');
  } else {
    el.removeAttribute('loading');
    el.setAttribute('loaded', '');
  }
}

function _handlePassageNameChanged(name) {
  // console.log(name)
  const index = config.sceneTransitionPassages.indexOf(el => el.name === name);
  if(index >= 0) currentSceneNum = config.sceneTransitionPassages.sceneNumber;
  document.querySelector('tw-passage').setAttribute('scene', currentSceneNum.toString())
}

function wrapDivAroundContent (target, wrapper = document.createElement('div')) {
  // Hacky, look at later
  wrapper.classList.add('content-container');
  // Don't wrap img or tw-sidebar into content container and add span around text
  let containsImg = false;
  ;[ ...target.childNodes ].forEach(child =>  {
    if(child.nodeName === '#text') {

      const spanEl = document.createElement('span');
      spanEl.appendChild(child);
      wrapper.appendChild(spanEl);

    } else if (child.nodeName.toLowerCase() === 'tw-hook') {
      let dialogHookNum = 0;

      [ ...child.childNodes ].forEach(hookChild =>  {
        if(hookChild.nodeName === '#text') {

          const hookSpanEl = document.createElement('span');
          hookSpanEl.appendChild(hookChild);
          child.appendChild(hookSpanEl);

          if(child.getAttribute('name') === 'dialoog') {
            if([ ...child.childNodes ].length > 1) {
              if(dialogHookNum %2 === 0) {
                hookSpanEl.setAttribute('left-dialog', '')
              } else {
                hookSpanEl.setAttribute('right-dialog', '')
              }
              dialogHookNum = dialogHookNum + 1;
            }
          }          
        }
      })

      wrapper.appendChild(child)
    } else {
      if(child.nodeName.toLowerCase() !== 'img' && child.nodeName.toLowerCase() !== 'tw-sidebar') wrapper.appendChild(child)
    }
    if(child.nodeName.toLowerCase() === 'img' ) containsImg = true;
  })
  if(containsImg) target.setAttribute('img-passage', '');
  const sidebarEls = Array.from(target.childNodes).filter(el => el.nodeName.toLowerCase() === 'tw-sidebar');
  target.insertBefore(wrapper, sidebarEls[0].nextSibling);
  return wrapper
}

async function _handlePassageEntered(el) {
  setPassageLoadingAttributes(el, true);

  await awaitTransition(el);
  wrapDivAroundContent(el);
  
  
  _handleLinksOnPassageEntered(el);
  
  const passageContainsLinksToNewScene = getPassageLinks(document.querySelector('tw-passage')).findIndex(el => config.sceneTransitionPassages.includes(el.innerText)) >= 0;
  updateBooleanAttribute(el, 'scenetransition', passageContainsLinksToNewScene)
  
  document.querySelector('tw-passage').setAttribute('scene', currentSceneNum.toString())
  setPassageLoadingAttributes(el, false);
  
  _setPassageInDb(el);
}




const mutationObsTargetNode = document.querySelector('tw-story');
const mutationObsConfig = { childList: true };
// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
  for(const mutation of mutationsList) {
      if (mutation.type === 'childList') {
          const addedEls = Array.from(mutation.addedNodes);
          const passElIndex = addedEls.findIndex(el => el.nodeName.toLowerCase() === 'tw-passage');
          if(passElIndex >= 0) _handlePassageEntered(addedEls[passElIndex]);
      }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(mutationObsTargetNode, mutationObsConfig);

// Playing audio
var song = new Audio();
var playlist = ["Bohren Der Club of Gore - Im Rauch.mp4",
"Midnight Radio Track 1.mp4",
"Jóhann Jóhannsson - The Miners Hymns - The Cause Of Labour Is The Hope Of The World.mp4",
"Ryuichi Sakamoto - Train Ride 2.mp4",
"Bohren Der Club of Gore - Constant Fear.mp4"];

var currentSong = -1;

function nextSong() {
  currentSong++;
  if (currentSong > playlist.length-1) {
    currentSong = 0;
  }
  song.src = `music/${playlist[currentSong]}`
  song.play();
}

//autoplay next song when song finishes:
song.onended = function() {
  nextSong()
}

//most browsers prevent autoplay before user has interacted, so we add a listener for first click
window.addEventListener("click", () => {
  nextSong()

  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
    document.documentElement.webkitRequestFullscreen();
  } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
    document.documentElement.msRequestFullscreen();
  }

}, {once: true});

alert("Please turn on your sound. Click anywhere on the screen to start the game. Your browser will go to full screen automatically when you start.")