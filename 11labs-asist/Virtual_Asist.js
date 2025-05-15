document.addEventListener('DOMContentLoaded',function(){

    const asistButton = document.getElementById('asistButton');
    const hiddenBar = document.getElementById('hiddenBar');
    const callBar = document.getElementById('callBar');
    const microphoneButton = document.getElementById('microphoneButton');

        let menuVisible = false;

    asistButton.addEventListener('click',function() {
        menuVisible = !menuVisible;

        asistButton.classList.toggle('active');
        if (menuVisible) {
            hiddenBar.classList.remove('close');
                setTimeout(()=> hiddenBar.classList.add('open'),10);
        } else {

            hiddenBar.classList.remove('open');
            setTimeout(()=> hiddenBar.classList.add('close'),300);
            
            callBar.style.transform = 'translate(0px)'

            microphoneButton.classList.remove('open');
            setTimeout(()=> microphoneButton.classList.add('close'),300);

        }
    });

    callBar.addEventListener('click',function(){ 
    
        callBar.style.transform = 'translateX(20px)';
            
        microphoneButton.classList.remove('close');
                setTimeout(()=> microphoneButton.classList.add('open'),10);
    });

    function startGlow(){hiddenBar.classList.add('glow-effect');}
    function stopGlow(){hiddenBar.classList.remove('glow-effect');}

    microphoneButton.addEventListener('mousedown', startGlow );
    microphoneButton.addEventListener('touchstart', startGlow );
               
    document.addEventListener('mouseup',stopGlow);
    document.addEventListener('touchend',stopGlow);
});

