const DECISION_THRESHOLD = 80

let isAnimating = false;

let pullDeltaX = 0; // Distància que la card s'està arrossegant

function startDrag(event) {
    if (isAnimating) return

    // recuperem eñ primer elementde les cards
    const actualCard = event.target.closest('article')

    //  Obtenim la posició inicial del cursor
    const startX = event.pageX ?? event.touches[0].pageX;

    // Escoltar el moviment del ratolí o l'arrossegament amb el dit
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd)

    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true })

    function onMove(event) {

        const currentX = event.pageX ?? event.touches[0].pageX;
        // Busquem la distància des de l'inici de l'arrossegament fins que ens aturem
        pullDeltaX = currentX - startX

        if(pullDeltaX == 0 ) return;
        isAnimating = true;
        const deg = pullDeltaX /14;
        actualCard.style.transform = `translateX(${pullDeltaX}px)rotate(${deg}deg)`;
        actualCard.style.cursor = 'grabbing'

        // Cambia l'opacitat de Info segons arrosseguem la foto
        const opacity = Math.abs(pullDeltaX) / 100;
        const isRight = pullDeltaX > 0

        const choiceEl = isRight
            ? actualCard.querySelector('.choice.like')
            : actualCard.querySelector('.choice.nope')
        choiceEl.style.opacity = opacity
    }

    function onEnd(event) {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onEnd)

        document.removeEventListener('touchmove', onMove)
        document.removeEventListener('touchend', onEnd)

        // Averiguem si l'usuaro ha pres uan decisió
        const decisionMade = Math.abs(pullDeltaX) >= DECISION_THRESHOLD
       
        
        if( decisionMade) {
            const goRight = pullDeltaX >=0
            const goLeft = !goRight;

            actualCard.classList.add(goRight ? 'go-right' : 'go-left');
            actualCard.addEventListener('transitionend', () => {
                actualCard.remove()
            }, { once: true })
        } else {
            actualCard.classList.add('reset');
            actualCard.classList.remove('go-right', 'go-left')
        }
        // Netegem variables - valors inicials
        actualCard.addEventListener('transitionend', () => {
            actualCard.removeAttribute('style')
            actualCard.classList.remove('reset')

            pullDeltaX = 0;
            isAnimating = false;
        })
    }

}



document.addEventListener('mousedown', startDrag);
document.addEventListener('touchstart', startDrag, { passive: true })

