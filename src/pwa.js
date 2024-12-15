let deferredPromptCanceled;

window.addEventListener('beforeinstallprompt', (event)=> {
    console.log('beforeinstallprompt захвачено.');
    event.preventDefault();
    globalThis.deferredPrompt = event;
});


window.addEventListener('click', (e)=> {
    //btnAdd.style.display = 'none';
    // Show the prompt
    if(globalThis.deferredPrompt && !deferredPromptCanceled) {
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice
            .then((choiceResult) => {
                if(choiceResult.outcome === 'accepted') {
                    console.log('Приянто');
                } 
                else {
                    deferredPromptCanceled = true;
                    EVENT.emit('deferredPrompt.disable', {});
                }
                deferredPrompt = null;
            });
    }
});