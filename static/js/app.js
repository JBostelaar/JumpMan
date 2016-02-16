(function () {
    'use strict';
    //Algemene variabele
    var canvas, context, meter;
    var platforms = [];

    var launcher = {
        init: function () {
            //Selecteer aan de hand van een Id de canvas waarop getekend word
            canvas = document.getElementById('myCanvas');
            //Maak een nieuwe FPSMeter aan
            meter = new FPSMeter();
            //Set canvas configuration
            configCanvas.setDimensions();
            //Link accelerometer aan functies
            watch.start();
            //Start de animatie loop
            animate.loop();
        }
    }

    var configCanvas = {
    	setDimensions: function(){
    		canvas.width  = window.innerWidth;
    		canvas.height = window.innerHeight; 

    		//Pak en defineer context van canvas
    		context = canvas.getContext('2d');
    	}
    }

    var watch = {
        start: function startWatch() {
            //Koppel accelerometer aan functies, bewaar de referentie in een variabel 
            gyro.startTracking(function (o) {
                acceleration.succes(o);
            });

            // Update acceleration elke 0.01 seconden
            gyro.frequency = 10;
        },

        stop: function stopWatch() {
            //Stop met acceletometer waardes doorgeven
            gyro.stopTracking();
        }
    }

    var animate = {
        loop: function () {
            //Creeer een animatieloop van +- 60fps
            requestAnimationFrame(animate.loop);

            //Posities, snelheid en besturing bijwerken
            animate.update();

            //Output renderen
            animate.render();

            //Update de FPSMeter
            meter.tick();

        },
        update: function () {
            //Timer op 0, tijd voor een nieuw platform
                        
            if (animate.platformTimer <= 0) {
                //Zet de platformTimer terug op een random waarde
                                
                animate.platformTimer = getRandomArbitary(100, 200);                 //Maak een nieuwe platform aan
                                
                var platform = new Platform();                 //Voeg het platform toe aan de array platforms
                                
                platforms.push(platform);            
            }

            //platformTimer aftellen
            animate.platformTimer--;

            //Loop en update platforms
            for (var i in platforms) {
                platforms[i].update();
            }

            //Update bal
            ball.update();

        },
        render: function () {
            //Maak na elk frame de canvas weer leeg
            context.clearRect(0, 0, window.innerWidth, window.innerHeight);

            //Teken bal
            ball.draw();

            //Loop door platforms en teken ze
            for (var i in platforms) {
                platforms[i].draw();
            }
        },
        //plaformTimer is standaard een randomwaarde
        platformTimer: getRandomArbitary(100, 200)
    }

    var acceleration = {
        //Gelukt, bal bewegen
        succes: function onSuccess(acceleration) {
            ball.move(acceleration);
        },
        //Fout opgetreden, toon alert
        error: function onError() {
            alert('onError!');
        }
    }

    var ball = {
        //Standaard positie van ball
        position: {
            x: 0,
            y: 0
        },
        //Standaard velocity van ball
        velocity: {
            x: 0,
            y: 4
        },
        //Zet de waarde van de acceleratie om in horizontale velocity
        move: function (acceleration) {
            ball.velocity.x = acceleration.x;
        },
        update: function () {
            ball.collision();
            //Positie van de bal word verekend met de velocity
            ball.position.x += ball.velocity.x;
            ball.position.y += ball.velocity.y;

            //Pas zwaartekracht toe
            if (ball.velocity.y < 4) {
                ball.velocity.y += 0.07;
                ball.color = 'yellow';
            }

            //Als bal buiten scherm raakt, verschijnt hij aan andere kant
            if (ball.position.x > 150) ball.position.x = -150;
            if (ball.position.x < -150) ball.position.x = 150;
            if (ball.position.y > 265) ball.position.y = -265;
            //Ball blijft hangen aan de bovenkant
            if (ball.position.y < -265) ball.position.y = -265;
        },
        draw: function () {
            // bepaal middenpunt van object ten op zichte van het midden van het scherm
            var centerX = (canvas.width / 2) + this.position.x;
            var centerY = (canvas.height / 2) + this.position.y;
            var radius = 12;

            //Begin lijn
            context.beginPath();
            //Teken cirkel
            context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            //Inkleuren
            context.fillStyle = this.color;
            context.fill();
            //Teken Stroke
            context.lineWidth = 2;
            context.strokeStyle = '#003300';
            context.stroke();
        },
        color: 'green',
        collision: function () {
            //Loopt door alle platforms heen
            for (var i in platforms) {
                //Kijkt of de ball een platform raakt
                var b = ball.position,
                    p = platforms[i].position,
                    w = platforms[i].width / 2,
                    h = platforms[i].height / 2;                
                if (b.x > p.x - w && b.x < p.x + w && b.y > p.y - h && b.y < p.y + h) {
                    //Maak een sprong
                                        
                    ball.velocity.y = -4;                
                }
            }
        }
    }

    var Platform = function () {
        //Standaard horizontale en verticale positie van een platform
        this.position = {
            x: 0,
            y: 0
        }
        //Begin positie en grootte van het platform
        this.position.x = getRandomArbitary(-120, 120);
        this.position.y = -200;
        this.width = 70;
        this.height = 8;
    }


    Platform.prototype.update = function () {
        //Pas zwaartekracht toe op balkjes
        this.position.y += 0.65;
        //Delete platform wanneer hij buiten beeld komt
        if (this.position.y > window.innerHeight) {
            //Laatste item in array is de onderste, dus deze mag weg
            platforms.shift();
        }
    }

    Platform.prototype.draw = function () {
        // bepaal middenpunt van platform ten op zichte van het midden van het scherm
        var centerX = (canvas.width / 2) + this.position.x;
        var centerY = (canvas.height / 2) + this.position.y;

        //Teken platform
        //Begin lijn
        context.beginPath();
        //Bepaal kleur
        context.fillStyle = 'red';
        //Teken rechthoek
        context.fillRect(centerX - 20, centerY - 4, this.width, this.height);
    }

    //Start lancher.init wanneer het device ready is
    $(document).ready(function () {
        launcher.init();
    });

})();