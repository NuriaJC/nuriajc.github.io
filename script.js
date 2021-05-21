var HAIR = 0; //2 = long hair
var LEGS = 1; //2 = long legs
var CONS = 2; //2 = fat
var CAMO = 3; //2 = camouflage
var CLAW = 4; //2 = long claws
var EYES = 5; //2 = big eyes
var FANG = 6; //2 = big teeth
var CHARS_COUNT = 7;

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function fec(charA, charB){
    if ( charA == 0 ) {
        if ( charB == 0 ) {
            return 0;
        } else if ( charB == 1 ) {
            return Math.floor(Math.random() * 2);
        } else {
            return 1;
        }
    } else if ( charA == 1 ) {
        if ( charB == 0 ) {
            return Math.floor(Math.random() * 2);
        } else if ( charB == 1 ) {
            var rand = Math.floor(Math.random() * 4);
            if (rand == 0) {
                return 0;
            } else if (rand == 1) {
                return 2;
            } else {
                return 1;
            }
        } else {
            return 1 + Math.floor(Math.random() * 2);
        }                
    } else {
        if ( charB == 0 ) {
            return 1;
        } else if ( charB == 1 ) {
            return 1 + Math.floor(Math.random() * 2);
        } else {
            return 2;
        }
    }
}

class Individual {
    constructor(chars = []) {
        this.chars = chars;
        this.element = null;
        this.mutationRate = 0.05;
        this.alive = true;
        if ( chars.length == 0 ){
            this.randomizeChars();
        }
    }
    
    randomizeChars(){
        for ( var i = 0; i < CHARS_COUNT; i++ ) {
            this.chars.push(Math.floor(Math.random() * 3));
        }
    }
    
    getChar(char){
        return this.chars[char];
    }
    
    mate(ind){
        var newIndChars = [];
        for ( var i = 0; i < CHARS_COUNT; i++ ) {
            newIndChars.push(fec(this.chars[i], ind.chars[i]))
            if ( Math.random() < this.mutationRate ){
                if (Math.random() < .5){
                    newIndChars[newIndChars.length-1] = Math.min(newIndChars[newIndChars.length-1]+1, 2)
                } else {
                    newIndChars[newIndChars.length-1] = Math.max(newIndChars[newIndChars.length-1]-1, 0)
                }
            }
        }
        return new Individual(newIndChars);
    }
    
    toString() {
        return this.chars.toString()
    }
    
    display(parentElement, callback){
        if ( this.element != null && this.element.parentElement != null) {
            this.element.parentElement.removeChild(this.element);
        }
        this.element = document.createElement('DIV')
        console.log('left-right')
        if ( Math.random() < 0.5 ){
            console.log('left')
            this.element.className = "left";
        }
            this.element.innerHTML += `<div></div>`;
        for ( let char in this.chars){
            this.element.innerHTML += `<div class="char-${this.chars[char]}"></div>`;
        }
        this.element.setAttribute('onclick', callback)
//         this.element.innerHTML = `<img src="img/individual/base.svg" />${this}`;
        parentElement.appendChild(this.element);
        
        
//         parentElement.innerHTML += `<div onclick="${callback}"><img src="img/individual/base.svg" />${this}</div>`
//         this.element = parentElement.children[parentElement.children.length-1];
    }
    switchOn(){
        console.log(this.element)
        console.log(this.element.classList)
        this.element.classList.add('on')
        console.log(this.element.classList) 
    }
    switchOff(){
        console.log(this.element)
        console.log(this.element.classList)
        this.element.classList.remove('on')
        console.log(this.element.classList)
    }
}
class EnvEvent {
    constructor(name, desc, lethality, idealChars){
        /*
         idealChars = [
            {
                0:[2,0.5],
                3:[0,0.5]},
            {
                5:[2,0.75]}]
            
         
         */
        if ( lethality <= 0) {
            throw 'Lethality must be greater than 0';
        }
        this.name = name;
        this.desc = desc;
        this.lethality = lethality;
        this.idealChars = idealChars;
    }
    
    aptitude(ind){
        var aptitude = 0;
        console.debug(ind.chars);
        for ( var i = 0; i < this.idealChars.length; i++ ) {    //for ideal combination of characters
            var tempAptitude = 0
            var idealCharsCount = 0;
            console.debug('aptitude for '+i+'th ideail:');
            console.debug(this.idealChars[i])
            for ( var j = 0; j < CHARS_COUNT; j++ ) {
                if ( this.idealChars[i][j] != undefined ){
                    tempAptitude += (2 - Math.abs(ind.chars[j] - this.idealChars[i][j][0])) * this.idealChars[i][j][1];
                    idealCharsCount++;
                }
                console.debug('  temp aptitude: '+tempAptitude)
            }
            tempAptitude /=  2
            if ( tempAptitude > aptitude ) {
                aptitude = tempAptitude;
            }
        }   
        console.debug('aptitude: '+aptitude)
        return aptitude;
    }
    
    willSurvive(ind){
        return this.aptitude(ind) >= this.lethality;
    }
    toString() {
        return `${this.name} (${this.desc})`
    }
}

class Biome {
    constructor(name, maxPopulation, events, element){
        this.name = name;
        this.population = [];
        this.breedingInds = [];
        this.events = events;
        this.eventsProbability = [];
        
        
        for ( var i = 0; i < maxPopulation ; i++ ) {
            this.population.push(new Individual());
        }
        var maxProbability = 0;
        for ( var i = 0; i < events.length ; i++ ) {
            maxProbability += events[i].lethality;
            this.eventsProbability.push(maxProbability); //List with summed probabilities      
        }
    }
    
    
    generateElements(element){
        this.element = element;
        this.element.innerHTML = '<div class="event-title hidden"><h1></h1><h2></h2></div><div class="individuals"></div>'
        this.element.style.backgroundImage = `url(img/${this.name}_bg.jpg)`;
        this.eventTitleElement = this.element.children[0];
        this.eventNameElement = this.eventTitleElement.children[0];
        this.eventDescElement = this.eventTitleElement.children[1];
        this.individualsElement = this.element.children[1];
    }
    
    updateDisplayIndividuals(){
        for (var i = 0; i < this.population.length ; i++){
            if (!this.population[i].alive){
                this.population[i].element.classList.add('dead');
                this.population[i].element.setAttribute('onclick', '')
            }
        }
    }
    
    displayIndividuals(){
        var tries = 0
        var done = false
        while (!done) {
            tries++
            var iterations = 0;
            var positions = [];
            this.individualsElement.innerHTML = '';
            for ( var i = 0; i < this.population.length && iterations < 256; i++){
                iterations++
//                 console.log(i)
                this.population[i].display(
                    this.individualsElement,
                    `game.toggleIndividual(${i}, '${this.name}');`
                )
                var left = Math.random()*80.72222222222222+2;
                this.population[i].element.dataset.id = i;
                this.population[i].element.style.left = `${left}%`;
                var verticalRandom = Math.random()*100;
                var height = verticalRandom*.1666666666666666666666+20;
                var top = verticalRandom*.3;
                this.population[i].element.style.top = `${top}vh`;
//                 console.log(top * -1000)
                this.population[i].element.style.zIndex = Math.round(top * 10);
//                 console.log( this.population[i].element.style.zIndex)
                this.population[i].element.style.width = `${height / 2.6}vh`;
                this.population[i].element.style.height = `${height}vh`;
                var minDistance = 100;
                for ( var j = 0; j < i; j++ ){
                    var distance = Math.abs(positions[j][0]-left)+Math.abs(positions[j][1]-top)
                    if (distance < minDistance) {
                        minDistance = distance;
                    }
                }
                if (minDistance > 20) {
                    positions.push([left,top]);
                } else {
                    i--;
                }
            }
            if ( iterations < 256 ) {
                done = true
            }
            if ( tries > 24 ) {
                done = true
            }
        }
        console.log(tries)
    }
    chooseLocalEvent() {
        var randomChoice = Math.random() * this.eventsProbability[this.eventsProbability.length - 1];
        for ( var i = 0; i < this.events.length; i++ ) {
            if ( this.eventsProbability[i] > randomChoice ) {
                return this.events[i];
            }
        }
    }
    occurEvent(currentEvent) {
        var survivors = []
        var casualties = []
        for ( var i = 0; i < this.population.length; i++ ) {
            var individual = this.population[i];
            if (currentEvent.willSurvive(individual)) {
                survivors.push(individual);
            } else {
                casualties.push(individual);
                this.population[i].alive = false;
            }
        }
//         this.population = survivors;
        return [currentEvent, casualties];
    }
    
    toggleIndividual(index){
        var breedingIndex = this.breedingInds.indexOf(this.population[index])
        if ( breedingIndex == -1 ){
            if ( this.breedingInds.length < this.breedingCount()){
                this.breedingInds.push(this.population[index]);
                this.population[index].switchOn();
            }
        } else {
            this.breedingInds.splice(breedingIndex, 1);
            this.population[index].switchOff();
        }
    }
    
    breedingCount() {
        return Math.max(Math.round(this.population.length/2),2);
    }
    reproduction() {
        var newPopulation = [];
        for ( var j = 0; j < 3; j++ ) {
            for ( var i = 0; i < this.breedingInds.length ; i++) {
                var mateIndex = Math.floor(Math.random() * (this.breedingInds.length - 1));
                console.log(mateIndex)
                if ( mateIndex >= i ) {
                    //if mate has the same index one is added, the individual can't mate with itself
                    mateIndex++;
                }
                var newInd = this.breedingInds[i].mate(this.breedingInds[mateIndex])
                console.log(`Matting {${this.breedingInds[i]}} with {${this.breedingInds[mateIndex]}} = {${newInd}}`) 
                newPopulation.push(newInd);
            }
        }
        while ( newPopulation.length > 10 ) {
            newPopulation.pop();
        }
        this.population = newPopulation;
        this.breedingInds = [];
    }
    
    displayEvent(currentEvent){
        this.eventNameElement.innerHTML = currentEvent.name;
        this.eventDescElement.innerHTML = currentEvent.desc;
        this.eventTitleElement.classList.remove('hidden');
    }
    
    hideEvent(){
        this.eventTitleElement.classList.add('hidden');
    }
    
    toString() {
        var out = ''
        for ( var i = 0; i < this.population.length;i++){
            out += `  ${i}: ${this.population[i]}\n`;
        }
        return out
    }
    
    survivorsCount() {
        var count = 0;
        for (var i = 0; i < this.population.length; i++){
            if (this.population[i].alive){
                count++;
            }
        }
        return count
    }
}

class Survival {
    constructor(biomePairs, globalEvents) {
        console.log(biomePairs)
        var biomePair = biomePairs[Math.floor(Math.random() * biomePairs.length)]
        console.log(biomePair)
        if (Math.random() < .5){
            this.lBiome = biomePair[0];
            this.rBiome = biomePair[1];
        }else{
            this.lBiome = biomePair[1];
            this.rBiome = biomePair[0];
        }
        this.lBiome.generateElements(document.getElementById('left-biome'));
        this.rBiome.generateElements(document.getElementById('right-biome'));
        console.log(this.lBiome,this.rBiome)
        this.currentPhase = -1;
        this.turnCount = 1;
        this.localEventProb = 1;
        this.globalEvents = shuffle(globalEvents);
        this.globalEventsIndex = 0;
        this.lCurrentEvent = null;
        this.rCurrentEvent = null;
        this.globalEventTitleElement = document.getElementById('global-event-title');   
        this.turnCountElement = document.getElementById('turns');   
        this.userButtonElement = document.getElementById('user-button');   
    }
    
    turnChooseEventPhase() {
        this.currentPhase = 0
        document.body.className='phase-0';
        if ( Math.random() < this.localEventProb) {
            this.lCurrentEvent = this.lBiome.chooseLocalEvent();
            this.rCurrentEvent = this.rBiome.chooseLocalEvent();
            this.localEventProb *= 0.75;
            this.lBiome.displayEvent(this.lCurrentEvent);
            this.rBiome.displayEvent(this.rCurrentEvent);
//             return true;
        }
        else {
            if ( this.globalEventsIndex > this.globalEvents.length ) {
                this.globalEventsIndex = 0;
                this.globalEvents = shuffle(this.globalEvents);
            }
            this.lCurrentEvent = this.globalEvents[this.globalEventsIndex];
            this.rCurrentEvent = this.globalEvents[this.globalEventsIndex];
            this.globalEventsIndex++;
            this.localEventProb = 1;
            this.globalEventTitleElement.children[0].innerHTML = this.lCurrentEvent.name;
            this.globalEventTitleElement.children[1].innerHTML = this.lCurrentEvent.desc;
            this.globalEventTitleElement.className = 'event-title'
//             this.lBiome.displayEvent(this.lCurrentEvent);
//             this.rBiome.displayEvent(this.rCurrentEvent);
            
//             return false;
        }
        this.userButtonElement.innerHTML = 'Breed';
        this.userButtonElement.className = 'disabled';
    }
    turnBreedingPhase() {
        this.turnCountElement.classList.remove('animate');
        this.currentPhase = 1;
        document.body.className='phase-1';
        this.userButtonElement.innerHTML = 'Go to event';
        this.userButtonElement.className = '';
        this.lBiome.reproduction();
        this.rBiome.reproduction();
        this.lBiome.displayIndividuals();
        this.rBiome.displayIndividuals();
    }
    
    turnEventPhase() {
        this.lBiome.hideEvent();
        this.rBiome.hideEvent();
        this.globalEventTitleElement.className = 'event-title hidden';
        this.lBiome.occurEvent(this.lCurrentEvent);
        this.rBiome.occurEvent(this.rCurrentEvent);
        this.lBiome.updateDisplayIndividuals();
        this.rBiome.updateDisplayIndividuals();
        if (this.lBiome.survivorsCount() < 2 || this.rBiome.survivorsCount() < 2 ){
            document.getElementById('popup-death').className='';
            document.getElementById('end-score').innerHTML=this.turnCount;
            var lWins = this.lBiome.survivorsCount() > 1;
            var rWins = this.rBiome.survivorsCount() > 1;
            if ( lWins ){
                document.getElementById('biome-winner').innerHTML='Ha sobrevivido la población del bioma de ' + this.lBiome.name;
            } else if ( rWins ){
                document.getElementById('biome-winner').innerHTML='Ha sobrevivido la población del bioma de ' + this.rBiome.name;
            } else {
                document.getElementById('biome-winner').innerHTML='Ninguna población ha sobrevivido';
            }
                
            
            
        } else {
            this.turnCountElement.innerHTML = ++this.turnCount;
            this.turnCountElement.classList.add('animate');
        }
        this.turnChooseEventPhase();
    }
    
    toggleIndividual(index, biomeName) {
        if (this.currentPhase == 0){
            if (this.lBiome.name == biomeName){
                this.lBiome.toggleIndividual(index);
            } else {
                this.rBiome.toggleIndividual(index);
            }
            if ( this.lBiome.breedingInds.length > 1 && this.rBiome.breedingInds.length > 1 && this.lBiome.breedingInds.length <= this.lBiome.breedingCount() && this.rBiome.breedingInds.length <= this.rBiome.breedingCount() ){
                this.userButtonElement.className = '';
            } else {
                this.userButtonElement.className = 'disabled';
            }
        }
    }
    
    d(){
        console.log('==== LEFT ====')
        console.log('  Event: ' + this.lCurrentEvent.toString());
        for (let idealChar in this.lCurrentEvent.idealChars){
            console.log('    ' + JSON.stringify(this.lCurrentEvent.idealChars[idealChar]))
        }
        console.log(this.lBiome.toString())
        console.log('==== RIGHT ====')
        console.log('  Event: ' + this.rCurrentEvent.toString())
        for (let idealChar in this.rCurrentEvent.idealChars){
            console.log('    ' + JSON.stringify(this.rCurrentEvent.idealChars[idealChar]))
        }
        console.log(this.rBiome.toString())
        
    }
    
    userContinue(){
        if ( this.currentPhase == 0 ) {
            if ( this.lBiome.breedingInds.length > 1 && this.rBiome.breedingInds.length > 1 && this.lBiome.breedingInds.length <= this.lBiome.breedingCount() && this.rBiome.breedingInds.length <= this.rBiome.breedingCount() ){
                this.turnBreedingPhase();
            }
        } else if ( this.currentPhase == 1 ) {
            this.turnEventPhase();
        }
    }
    
    start(){
        this.lBiome.displayIndividuals();
        this.rBiome.displayIndividuals();
        this.turnChooseEventPhase();
    }
    
}

function main(){
    var heat = new EnvEvent(
        'Ola de calor', 'Poco pelo, patas largas para aumentar la transpiración y poca masa corporal será lo mejor',
        0.3,
        [{
            [HAIR]: [0,0.5],
            [LEGS]: [2,0.3],
            [CONS]: [0,0.2]}]
    );

    var cold = new EnvEvent(
        'Hace frío', 'Una buena capa de pelo y patas cortas y mucha masa corporal para mantener el calor vendrá bien',
        0.3,
        [{
            [HAIR]: [2,0.5],
            [LEGS]: [0,0.2],
            [CONS]: [2,0.3]}]
    );

    var predator = new EnvEvent(
        'Depredador', '¡Cuidado! Necesitarás unas patas muy largas y camuflaje para correr y esconderte o una gran constitución y mecanismos de defensa para atacar',
        0.5,
        [{
            [LEGS]: [2,0.4],
            [CAMO]: [2,0.6]},
        {
            [CONS]: [2,0.2],
            [FANG]: [2,0.4],
            [CLAW]: [2,0.4]
        }]
    );

    var drought = new EnvEvent(
        'Sequía', 'Para retener agua lo mejor será unas patas cortas, mucha masa corporal y unas garras para escarbar en busca de agua',
        0.5,
        [{
            [LEGS]: [0,0.2],
            [CONS]: [2,0.4],
            [CLAW]: [2,0.4]}]
    );

    var burriedFood = new EnvEvent(
        'Comida enterrada', 'Para poder desenterrar la comida viene bien patas cortas y unas garras para poder escarbar',
        0.2,
        [{
            [LEGS]: [0,0.2],
            [CLAW]: [2,0.8]}]
    );

    var sandStorm = new EnvEvent(
        'Tormenta de arena', 'Pelo corto, patas cortas y mucha masa corporal es lo mejor para evitar que se te lleve el viento',
        0.3,
        [{
            [HAIR]: [0,0.3],
            [LEGS]: [0,0.4],
            [CONS]: [2,0.3]}]
    );

    var avalanche = new EnvEvent(
        'Avalancha de nieve', 'Pelo largo para el frío y patas largas y poca masa corporal para poder correr vendrá bien',
        0.2,
        [{
            [HAIR]: [2,0.3],
            [LEGS]: [2,0.4],
            [CONS]: [0,0.3]}]
    );
    
    var flooding = new EnvEvent(
        'Inundación', 'Poco pelo que se moje y patas largas y mucha masa corporal para flotar y mantenerse fuera del agua será lo mejor',
        0.4,
        [{
            [HAIR]: [0,0.2],
            [LEGS]: [2,0.5],
            [CONS]: [2,0.3]}]
    );
    
    var fire = new EnvEvent(
        'Incendio', 'Lo mejor será tener poco pelo para que no se queme y patas largas y poca masa corporal para poder huir del fuego',
        0.3,
        [{
            [HAIR]: [0,0.2],
            [LEGS]: [2,0.6],
            [CONS]: [0,0.2]}]
    );
    
    var landslides = new EnvEvent(
        'Deslizamiento', 'Para huir de las rocas lo mejor serán la patas largas y una gran masa corporal para soportar las caídas',
        0.2,
        [{
            [LEGS]: [2,0.65],
            [CONS]: [2,0.35]}]
    );
    
    var rain = new EnvEvent(
        'Lluvias torrenciales', 'Para no carse vendrán bien patar cortas y poca masa corporal',
        0.2,
        [{
            [LEGS]: [0,0.5],
            [CONS]: [0,0.5]}]
    );
    
    var low_food = new EnvEvent(
        'Comida baja', 'Para poder llegar a la baja comida será mejor tener las patas cortas y poca masa corporal',
        0.2,
        [{
            [LEGS]: [0,0.65],
            [CONS]: [0,0.35]}]
    );
    
    var collapse = new EnvEvent(
        'Derrumbamiento', 'Patas largas para poder correr y un buen oído ayudarán a huir de los derrumbamientos',
        0.2,
        [{
            [LEGS]: [2,0.55],
            [EYES]: [0,0.45]}]
    );
    
    var meteorite = new EnvEvent(
        'Meteorito', '¡Una catástrofe mundial! Hay que tener las patas largas para poder esquivar las piedras ardiendo y poco pelo y masa corporal vendrán bien para el calor',
        0.5,
        [{
            [HAIR]: [0,0.2],
            [LEGS]: [2,0.5],
            [CONS]: [0,0.3]}]
    );

    var glaciation = new EnvEvent(
        'Glaciación', 'La temperatura ha bajado mucho, lo mejor será tener una buena capa de pelo y las patas cortas y mucha masa corporal para no perder calor',
        0.6,
        [{
            [HAIR]: [2,0.5],
            [LEGS]: [0,0.2],
            [CONS]: [2,0.3]}]
    );
    
    var desert = new Biome('desierto', 10, [heat, predator, drought, sandStorm])
    var tundra = new Biome('tundra', 10, [cold, predator, burriedFood, avalanche], document.getElementById('right-biome'))
    var jungle = new Biome('jungla', 10, [flooding,fire,landslides,rain], document.getElementById('left-biome'))
    var mountain = new Biome('montaña', 10, [low_food,cold,predator,drought], document.getElementById('right-biome'))
    var savanna = new Biome('savana', 10, [heat, drought,low_food,predator,predator,predator], document.getElementById('right-biome'))
    var cave = new Biome('cueva', 10, [collapse,cold,flooding], document.getElementById('right-biome'))


    game = new Survival([[desert,tundra],[jungle,mountain],[savanna,cave]],[meteorite,glaciation])
    game.start();
    displayBiomeIndividuals = game.displayBiomeIndividuals
}


var displayBiomeIndividuals;
var game;


