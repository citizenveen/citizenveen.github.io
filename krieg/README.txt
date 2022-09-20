Krieg website manual

How to update to a new Twine html file?
1. Rename current index.html file to index_old.html
2. Move the new Twine html file to this folder (if applicable: rename to index.html)
3. Open the new Twine html file in a text editor and add:
 - search for '</style>', and add '<link rel="stylesheet" href="./style.css">' in the line after it
 - Go to the bottom of the file and before '</body>' add the following lines:
<script src="https://www.gstatic.com/firebasejs/7.23.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/7.23.0/firebase-firestore.js"></script>
<script src="script.js"></script>
(open the index_old.html file if you're unsure)
4. Remove the index_old.html file 
5. Open the index.html file in the browser (double click file) and everything should work

How to change the settings?
1. Open the script.js file in a text editor
2. On the top of the file you can see a CONFIG section. 
3. In the 'const config = {...' you can change a few settings:
- sceneTransitionPassages describes the passages on which a new scene starts. Alter the name and sceneNumber accordingly. If you want to add a scene, add a '{name: 'look left', sceneNumber: 2}', to the beginning (just after the '['). (The {}'s should all have a comma after them, except for the last one)
- charactersPerMinute is the amount of characters the player can read per minute. Alter when a slow/fast reader is playing. (you can also update this via the 'admin site').

How to add images to passages?
In a Twine passage add '<img src="/images/filename.png">' to the bottom of the passage where you have to replace 'filename' with the actual filename.
In the images folder, add the image. The image should load if you open this index.html file but you won't be able to preview it from the twine application itself (!)
(to be safe, it might be smart to adjust filenames to a system of some_file_name.png. -> so _ instead of spaces and everything lowercased. Otherwise the browser might not be able to find the file)

What has to be added to Twine/Harlowe?
- add the noautoplay tag to passages with one link that should'nt autoplay
- add a hook to parts in passages that have certain text styling:
 - |dialoog>[text part]
 - |innerVoice>[text part]

How to update the site while somebody is playing?
Open the admin.html file, select which play to modify by selecting a time, update certain values and press the buttons.