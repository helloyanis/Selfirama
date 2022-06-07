//C'est super!! Si on le télécharge, on a pas besoin de connection pour faire tourner le site!
document.addEventListener("DOMContentLoaded", async () => {
  confirmclose = false
  //Initialiser le stockage du navigateur
  if (navigator.storage && navigator.storage.persist)
    navigator.storage.persist().then(function(persistent) {
      if (!persistent.valueOf()) {
        //C'est chiant donc je l'ai enlevé
        //alert("Stockage persistant refusé ou non supporté, les données pourraient êtres effacées si le stockage devient plein.");
      }
      renderphotos()
      //Pour l'import de fichier (beta, décommenter aussi le file input dans le fichier HTML)
      //awaitphotos()
    });
})
// async function awaitphotos() {
//   //Fonction de débug, elle ne sert plus mais je la garde quand même on sait jamais
//   var input = document.getElementById('uploadImage');
//   input.onchange = function(evt) {
//     files = evt.target.files;

//     if (FileReader && files && files.length) {
//       var fr = new FileReader();
//       fr.onload = async function() {
//         localStorage[Date.now()] = fr.result;
//       }
//       fr.readAsDataURL(files[0]);
//     }


//   }
// }
function renderphotos() {
  //Cette fonction affiche les photos contenues dans le stockage local
  //Affichage du stockage restant. Il se met à jour lors de l'affichage initial, de la prise d'une photo, de l'affichage de la galerie ou de la suppression d'une photo. Les nombres changent à cause de l'obfuscation, c'est une limitation de StorageManager (voir https://developer.mozilla.org/fr/docs/Web/API/StorageManager/estimate#valeur_de_retour )
  navigator.storage.estimate().then(function(estimate) {
    document.getElementById("space").innerHTML =
      `${(estimate.usage / estimate.quota).toFixed(2)}% d'espace de stockage utilisé<br>(environ ${estimate.usage}/${estimate.quota})`;
  });
  document.getElementById("gallery").innerHTML = ""
  Object.keys(localStorage).forEach(key => {
    let element = JSON.parse(localStorage[key])
    let date = new Date(parseInt(key));
    let title = element.imagename
    if (title == "") title = "Image sans titre"
    document.getElementById("gallery").innerHTML += `<div class="card" onclick="cardclick(${key})"><span hidden class="imageID">${key}</span><span class="imgtitle">${title}</span><br><img src="${element.imagedata}"></img><br>${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}</div>`

  })
}
async function showcam() {
  //Cette fonction gère le basculement entre le mode galerie et le mode caméra. Changement des attributs CSS pour gérér la transition.
  document.getElementById("error").classList.add("hidden")
  document.getElementById("error").innerHTML = ""
  document.getElementById("cameracontrols").classList.add("hidden")
  document.getElementById("editpic").classList.add("hidden")
  if (window.getComputedStyle(document.getElementById("gallery"), null).display == "none") {
    //La galerie est cachée, donc on est en mode caméra : Rebasculons en mode galerie!
    navigator.storage.estimate().then(function(estimate) {
      document.getElementById("space").innerHTML =
        `${(estimate.usage / estimate.quota).toFixed(2)}% d'espace de stockage utilisé<br>(environ ${estimate.usage}/${estimate.quota})`;
    });
    document.getElementById("selfielolmdr").innerHTML = "Prendre un selfie!"
    document.getElementById("deleteahomgwhy").classList.remove("hidden")
    document.getElementById("camera").classList.add("hidden")
    document.getElementById("gallery").classList.remove("hidden")
    document.getElementById("editpic").classList.remove("hidden")
  } else {
    //La galerie est visible, donc on peut passer en mode caméra!
    document.getElementById("selfielolmdr").innerHTML = "Retour à la galerie"
    
    document.getElementById("deleteahomgwhy").classList.add("hidden")
    document.getElementById("gallery").classList.add("hidden")
    document.getElementById("camera").innerHTML = ""
    document.getElementById("camera").classList.remove("hidden")
    //Play, pour jouer la vidéo (à un autre moment on la met en pause donc c'est important de bien être sûr qu'elle soit en marche)
    document.getElementById("camera").play()
    navigator.mediaDevices
      //Demander la permission d'accéder a la caméra
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then(function(stream) {
        let videoIn = document.getElementById("camera");
        videoIn.autoplay = true;
        document.body.insertBefore(videoIn, document.getElementById("cameracontrols"));
        videoIn.srcObject = stream;
        //Affihage des contrôles (bouton pour prendre la photo)
        document.getElementById("cameracontrols").innerHTML = `Faites un grand sourire! <button class="coolbutton" id="declencheur" onclick="takephoto()">Prendre la photo!</button>`
        document.getElementById("cameracontrols").classList.remove("hidden")

      })
      .catch(function(err) {
        //Une erreur est survenue, affichage de l'erreur
        document.getElementById("error").innerHTML = `Impossible de lancer la capture vidéo. Avez-vous autorisé la webcam?\n${err}`
        document.getElementById("error").classList.remove("hidden")
        console.error(err)
        return
      });


  }

}

async function takephoto() {
  //Cette fonction prend une photo

  //Mettre la vidéo en pause (plus rapide et instantané que de remplacer le flux vidéo par l'image prise.)
  document.getElementById("camera").pause()
  document.getElementById("cameracontrols").innerHTML = "Choisissez un super nom pour votre selfie! <input type='text' placeholder='Mon selfie' id='selfiename'><br><button class='coolbutton' id='savephoto' onclick='savephoto()'>Enregistrer l'image</button><button class='badbutton' id='redo' onclick='redo()'>Reprendre la photo</button>"

}
function editpic() {
  //Active le mode de changement de nom de l'image
  if (document.getElementById("editpic").innerHTML == "Editer des photos") {
    confirmclose = true
    //Basculement en mode édition
    document.getElementById("editpic").innerHTML = "Sauvegarder les changements"
    document.getElementById("selfielolmdr").classList.add("hidden")
    document.getElementById("deleteahomgwhy").classList.add("hidden")
    document.querySelectorAll(".imgtitle").forEach(title => {
      title.innerHTML = `<input type="text" value="${title.innerHTML}" placeholder="${title.innerHTML}" id="imgtitleedit">`
    })
  } else {
    confirmclose = false
    //Retour à la galerie!
    document.getElementById("editpic").innerHTML = "Editer des photos"
    document.getElementById("selfielolmdr").classList.remove("hidden")
    document.getElementById("deleteahomgwhy").classList.remove("hidden")
    //Sauvegarde des changements (oui c'est n'importe quoi mdr)
    document.querySelectorAll(".card").forEach(title => {
      localStorage[title.querySelector(".imageID").innerHTML] = JSON.stringify({ imagedata: JSON.parse(localStorage[title.querySelector(".imageID").innerHTML]).imagedata, imagename: title.querySelector("#imgtitleedit").value });

      
    })
    renderphotos()
  }
}
function deletepic() {
  //Active le mode supression d'image
  //La div d'erreur est utilisée pour afficher le message du mode supression.
  if (document.getElementById("error").innerHTML == "⚠️ Mode supression activé, cliquez sur une image pour la supprimer!") {
    //On est en mode supression! On rebascule en mode normal
    document.getElementById("error").innerHTML = ""
    document.getElementById("deleteahomgwhy").innerHTML = "Supprimer des photos"
    document.getElementById("error").classList.add("hidden")
    document.getElementById("selfielolmdr").classList.remove("hidden")
    document.getElementById("editpic").classList.remove("hidden")

  } else {
    //On n'est pas en mode supression, et on va l'afficher!
    document.getElementById("deleteahomgwhy").innerHTML = "Retour à la galerie"
    document.getElementById("error").innerHTML = "⚠️ Mode supression activé, cliquez sur une image pour la supprimer!"
    document.getElementById("error").classList.remove("hidden")
    document.getElementById("selfielolmdr").classList.add("hidden")
    document.getElementById("editpic").classList.add("hidden")

  }
}
async function cardclick(id) {
  //Cette fonction s'éxécute quand on clique sur une photo, et la supprime ou la télécharge.
  if (document.getElementById("error").innerHTML === "⚠️ Mode supression activé, cliquez sur une image pour la supprimer!") {
    //On est en mode supression! On peut supprimer l'image!
    localStorage.removeItem(id)
    navigator.storage.estimate().then(function(estimate) {
      document.getElementById("space").innerHTML =
        `${(estimate.usage / estimate.quota).toFixed(2)}% d'espace      de stockage utilisé<br>(environ ${estimate.usage}/${estimate.quota})`;
    });
    renderphotos()
  } else if (document.getElementById("editpic").innerHTML == "Editer des photos" && confirm("Voulez-vous télécharger ce selfie?")) {
    //On est en mode galerie! On demande si on veut télécharger!
    download = document.createElement('a')
    download.href = JSON.parse(localStorage[id]).imagedata;
    download.download = JSON.parse(localStorage[id]).imagename;
    document.body.appendChild(download)
    download.click();
    document.body.removeChild(download)
  }
}

function redo() {
  // photo annullée
    
  
        document.getElementById("camera").play()
    
        //Affihage des contrôles (bouton pour prendre la photo)
        document.getElementById("cameracontrols").innerHTML = `Faites un grand sourire! <button class="coolbutton" id="declencheur" onclick="takephoto()">Prendre la photo!</button>`
}


async function savephoto() {
  //Création d'un canvas pour mettre la photo
  const canvas = document.createElement("canvas")
  canvas.width = "320"
  canvas.height = "240"
  document.body.appendChild(canvas)
  canvas.getContext('2d').drawImage(document.getElementById("camera"), 0, 0, canvas.width, canvas.height);
  localStorage[Date.now()] = JSON.stringify({ imagedata: canvas.toDataURL('image/jpeg'), imagename: document.getElementById("selfiename").value });
  document.body.removeChild(canvas)
  renderphotos()
  navigator.storage.estimate().then(function(estimate) {
    document.getElementById("space").innerHTML =
      `${(estimate.usage / estimate.quota).toFixed(2)}% d'espace de stockage utilisé<br>(environ ${estimate.usage}/${estimate.quota})`;
  });
  //Preview de la photo (Pour débug, ca ne marche même plus je crois)
  //document.getElementById("canvas").style.display="block"
  await new Promise(resolve => setTimeout(resolve, 2000));
  //Repredre la prise de photo
  document.getElementById("camera").play()
  document.getElementById("cameracontrols").innerHTML = `Faites un grand sourire! <button class="coolbutton" id="declencheur" onclick="takephoto()">Prendre la photo!</button>`
}
//Voilà c'est tout à plus ;)
window.onbeforeunload = function() {
  if (confirmclose) {
    return "Attention, les modifications ne seront pas sauvegardées!"
  }
}

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        'service-worker.js',
      );
      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed');
      } else if (registration.active) {
        console.log('Service worker active');
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};
registerServiceWorker()