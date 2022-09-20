const Krieg = {};

window.time, window.date, window.loc;

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

function getPlays() {
  console.log('getPlays')
  var d = new Date();
  const twoHoursAgo = d.setHours(d.getHours() - 2);
  const plays = [];
  FIRESTORE.collection('plays').where('timeCreated', '>', twoHoursAgo).get().then(docs => {
    docs.forEach(doc => {
      plays.push({...doc.data(), ...{id: doc.id}})
    })

    const playContainerEl = document.getElementById('play-overview');
    plays.map(play => {
      const pEl = document.createElement('p');
      pEl.innerText = `Play started: ${new Date(play.timeCreated).toTimeString()}`;
      pEl.setAttribute('playid', play.id);
      pEl.setAttribute('playName', '');
      pEl.addEventListener('click', (evt) => {
        _handlePlaySelected(evt.target.getAttribute('playid'))
      })
      playContainerEl.appendChild(pEl)
    })
  })
  

}
getPlays();

function _handlePlaySelected(playId) {
  window.dbId = playId;

  const sections = Array.from(document.querySelectorAll('section'));
  
  sections.forEach((section, i) => {
    if(i === 0) return section.style.display = 'none';
    section.style.display = 'block';

  })
}

function updatePlayInDb(id = 'QiE6T4aEic41tQzykfda', obj) {
  FIRESTORE.collection('plays').doc(id).update(obj);
}

function addEventToPlayInDb(id = 'QiE6T4aEic41tQzykfda', evtObj) {
  console.log(evtObj, 'da')
  FIRESTORE.collection(`plays/${id}/events`).add({...evtObj, ...{timeCreated: Date.now()}});
}

function _handleInput(evt) {
  const type = evt.dataset['key'];
  Krieg[type] = evt.value;
}

function _handleDateLocationUpdate() {
  addEventToPlayInDb(window.dbId, {
    time: Krieg.time || '',
    date: Krieg.date || '',
    loc: Krieg.loc || '',
  }) 
}

function _handleContainerContentUpdate() {
  addEventToPlayInDb(window.dbId, {containerContent: Krieg.containerContent})
}

function _hidePassageLinks() {
  addEventToPlayInDb(window.dbId, {hideLinks: true});
}

function _showPassageLinks() {
  addEventToPlayInDb(window.dbId, {showLinks: true});
}

function _showContainer() {
  console.log('_showContainer', window.dbId)
  addEventToPlayInDb(window.dbId, {showContainer: true});
}

function _hideContainer() {
  addEventToPlayInDb(window.dbId, {hideContainer: true});
}


function _setCharsPerMinute() {
  addEventToPlayInDb(window.dbId, {charactersPerMinute: Krieg.charactersPerMinute});
}
