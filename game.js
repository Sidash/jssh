
var noPlayers = 0;

var players = [];
var prefPlayers = [];
var iteratePlayers = 0;
var showPlayerRole = false;
var cardstack0 = "FFFFFFFFFFFLLLLLL";
var cardstack = "";
var libEnacted = 0;
var facEnacted = 0;
var discard = "";
var failed = 0;
var enactState = 0;
var cards;
var vetoPower;
var gameOver = false;
var preferred = [];
var prefIterations = 5;

function initSetup() {
    var i = 5;
    while (i--) {
        addPlayer();
    };
    initGame();
    activateDialogue("setup");
}

function activateDialogue(diagName) {
    var dialogues = document.getElementsByClassName("dialogue");
    var i = dialogues.length;
    while (i--) {
        dialogues[i].style.display = "none";
    }
    document.getElementById(diagName).style.display = "";
    parent = document.getElementById(diagName);
    while (parent = parent.parentNode) {
        if (parent.className == "dialogue") {
        parent.style.display = "";
        } else {
            break;
        }
    }
}

function log(msg) {
    var logObj = document.getElementById("log");
    var node = document.createElement("DIV");
    node.innerHTML = msg+'\n';
    logObj.appendChild(node);
}

function showPrefRoles() {
    var msg = "";
    for (name in preferred) {
        if (preferred[name]) {
            msg += name+' ';
            }
        }
        if (msg) {
            msg = 'Preferred roles set for: ' + msg;
        }
        document.getElementById('preference-msg').innerHTML = msg;
}

function setPreferred(role) {
    var name = "";
    name = document.getElementById('pref-name').value.trim();
    document.getElementById('pref-name').value = "";
    if (name) {
        preferred[name] = role;
        if (role) {
            log("set preferred role for "+name);
        } else {
            log("unset preferred role for "+name);
        }
    }
    activateDialogue("setup");
    showPrefRoles();
}

function getPrefScore(locPlayers) {
    var role;
    var prefRole;
    var score = 0;
    for (p of locPlayers) {
        role = p.role;
        if (preferred[p.name]) {
            prefRole = preferred[p.name];
            if (role == prefRole) {
                score += 2;
            } else {
                if ((prefRole != "L") && (role != "L")) {
                    score += 1;
                }
            }
        }
    }
    return score;
}

function setPrefPlayers() {
    setPlayersOnly()
    prefPlayers = players
    var i = 5+noPlayers;
    while (i--) {
        setPlayersOnly();
        if (getPrefScore(players) > getPrefScore(prefPlayers)) {
            prefPlayers = players;
        }
        console.log(getPrefScore(players));
    }
    players = prefPlayers;
}

function setRoles() {
    var roles = getRoles(noPlayers);
}

function setPlayersOnly () {
    if ((noPlayers <= 10) && (noPlayers >= 5)) {
        var roles = getRoles(noPlayers)
        var names = document.getElementsByClassName("player_name");
        var i = noPlayers;
        players = []; // clear player list
        while (i--) {
            var currentPlayer = {name:"",role:""};
            currentPlayer.name = names[noPlayers-1-i].value.trim();
            currentPlayer.role = roles[i];
            currentPlayer.invest = false;
            players.push(currentPlayer);
            if (currentPlayer.name == "") {
                currentPlayer.name = "anon";
                document.getElementById("setup-msg").innerHTML = "player name must not be empty.";
                return false;
            }
        }
        document.getElementById("setup-msg").innerHTML = "";
        return true;
    } else {
        document.getElementById("setup-msg").innerHTML = "player number must be between 5 and 10.";
        return false;
    }
}


function setPlayers() {
    if (setPlayersOnly()) {
        setPrefPlayers()
        activateDialogue("pregame");
    }
}

function preGameInfo() {
    var roles = getRoles(noPlayers);
    var r;
    var fno;
    var lno = 0;
    for (r of roles) {
        lno += (r == "L") ? 1 : 0;
    }
    document.getElementById("pg-playerno").innerHTML = String(noPlayers);
    document.getElementById("pg-fascistno").innerHTML = String(noPlayers-lno);
    document.getElementById("pg-liberalno").innerHTML = String(lno);
    document.getElementById("pg-hknows").innerHTML = (hitKnows()) ? "" : "not";
    activateDialogue("pregame");
}

function addPlayer() {
    document.getElementById("setup-msg").innerHTML = "";
    if (noPlayers < 10) {
        noPlayers++;
        var setup = document.getElementById("players-setup");
        var node = document.createElement("DIV");
        node.innerHTML = '<input class="player_name" type="text" />';
        setup.appendChild(node);
    } else {
        document.getElementById("setup-msg").innerHTML = "Maximum player number is 10";
    }
}

function rmPlayer() {
    document.getElementById("setup-msg").innerHTML = "";
    if (noPlayers > 5) {
        noPlayers--;
        document.getElementById("players-setup").lastChild.remove();
    } else {
        document.getElementById("setup-msg").innerHTML = "Minimum player number is 5";
    }
}

function showRole(playerID) {
    activateDialogue('roles-warning');
    if (playerID < noPlayers) {
        p = players[playerID];
        rolesWarningMsg(p);
        rolesShowMsg(p);
        document.getElementById("roles-show-hide").onclick = function() { showRole(playerID + 1); };
    } else {
        initGame();
        activateDialogue("game");
    }
}

function restart() {
    activateDialogue('setup');
}

function rolesWarningMsg(p) {
    document.getElementById("roles-warning-msg").innerHTML = "Please give the device to "+p.name+". If you're "+p.name+", continue!";
}

function rolesShowMsg(p) {
    var msg = ""
    msg += p.name+", this is for your eyes only. Your role in this game is ";
    switch( p.role) {
        case "L": 
            msg += showRoleLib(); 
            msg += (hitKnows()) ? "Hitler knows who his co-fascists are. " : "Hitler does not know is co-fascists. ";
            break;
        case "H": 
            msg += showRoleHit();
            msg += (hitKnows()) ? showFascists() : "You don't know your other "+String(getFascists().length)+" fascists. "; 
            break;
        case "F": 
            msg += showRoleFac(); 
            msg += (hitKnows()) ? "Hitler knows who his co-fascists are. " : "Hitler does not know is co-fascists. ";
            msg += showFascists();
            break;
    }

    document.getElementById("roles-show-msg").innerHTML = msg;
}

function getFascists() {
    var listOfFascists = []
        for (p of players) {
            if (p.role == "F") {
                listOfFascists.push(p);
            }
        }
    return listOfFascists;
}

function getHitler() {
    for (p of players) {
        if (p.role == "H") {
            return p;
        }
    }
}

function hitKnows() {
    return (players.length < 7);
}

function getRoles(noPlayers){
    var roles = "";
    switch (noPlayers) {
        case 5:
            roles = "FHLLL"; break;
        case 6:
            roles = "FHLLLL"; break;
        case 7:
            roles = "FFHLLLL"; break;
        case 8:
            roles = "FFHLLLLL"; break;
        case 9:
            roles = "FFFHLLLLL"; break;
        case 10:
            roles = "FFFHLLLLLL"; break;
        default:
            roles = ""; break;
    }
    return roles.shuffle();
}

function showRoleLib() {
    var i = String(getRandomInt(1,6));
    return '<div class="center"><img class="lib-ident" src=./resources/lib'+i+'.jpg alt="Liberal"></div>';
}

function showRoleFac() {
    var i = String(getRandomInt(1,3));
    return '<div class="center"><img class="fac-ident" src=./resources/fac'+i+'.jpg alt="Fascist"></div>';
}

function showRoleHit() {
    return '<div class="center"><img class="fac-ident" src=./resources/hit.jpg alt="Hitler"></div>';
}

function showFascists() {
    var msg = "The fascists are ";
    for (p of getFascists()) {
        msg += p.name+", ";
    }
    msg +=" and ";
    msg +=getHitler().name+ " (Hitler).";
    return msg;
}

function initGame() {
    cardstack = cardstack0.shuffle();
    document.getElementById("game-msg").innerHTML = "";    
    discard = "";
    libEnacted = 0;
    facEnacted = 0;
    gameOver = false;
    deactivateVeto();
    failed = 0;
    i = document.getElementsByClassName("enabled").length;
    while (i--) {
        document.getElementsByClassName("enabled")[i].className = "";
    }
    updateState();
}

function updateState() {
    document.getElementById("draw-pile-no").innerHTML = String(cardstack.length);
    document.getElementById("discard-pile-no").innerHTML = String(discard.length);
    document.getElementById("failed-elect-no").innerHTML = String(failed);

    fascist = document.getElementById("fascist-track").childNodes;
    i = facEnacted ;
    while (i--) {
        document.getElementById("fascist-track").children[i].className = "enabled";
    }
    i = libEnacted;
    while (i--) {
        document.getElementById("liberal-track").children[i].className = "enabled";
    }
}

function checkReshuffle() {
    if (cardstack.length < 3) { // reshuffle
        cardstack = cardstack + discard;
        discard = [];
        cardstack = cardstack.shuffle();
    } else {
    }
}

function draw(i) {
    var hand = cardstack.slice(0,i);
    cardstack = cardstack.slice(i,cardstack.length);
    updateState();
    return hand
}

function enactPolicy() {
    if (gameOver) {return}
    activateDialogue("enact-warning-president");
}

function drawCards() {
    activateDialogue("enact-cards-president");
    cards = draw(3);
    container = document.getElementById("container-cards-president");
    var msg = "";
    var i = 0
    while (cards.length > i) {
        msg += '<a href="javascript:discardPolicy('+String(i)+')">';
        msg += cardHTML(cards[i]);
        msg += '</a>';
        i++;
    }
    container.innerHTML = msg;
}

function cardHTML(c) {
    var msg = "";
    msg += '<img class="card ';
    msg += (c == "L") ? 'card-lib' : 'card-fac';
    msg += '" src="./resources/';
    msg += (c == "L") ? 'liberal' : 'fascist';
    msg += '.png" ';
    msg += 'alt="';
    msg += (c == "L") ? 'liberal' : 'fascist';
    msg += '">';
    return msg;
}

function showCardsChancellor() {
    activateDialogue("enact-warning-chancellor")
    container = document.getElementById("container-cards-chancellor");
    var msg = "";
    var i = 0
    while (cards.length > i) {
        msg += '<a href="javascript:discardPolicy('+String(1-i)+')">';
        msg += cardHTML(cards[i]);
        msg += '</a>';
        i++;
    }
    container.innerHTML = msg;
}

function discardPolicy(i) {
    discard += cards[i];
    cards = cards.pop(i);

    switch (cards.length) {
        case 2: showCardsChancellor(); break;
        case 1: 
            executiveAction(); 
        break;
    }
}

function vetoPolicy() {
    discard += cards;
    activateDialogue("veto-success");
    checkReshuffle();
    updateState();
}

function activateVeto() {
    document.getElementById("veto-power").style.display = "";
}

function deactivateVeto() {
    document.getElementById("veto-power").style.display = "none";   
}

function executiveAction() {
    var c = cards[0];
    if (c == "L") {
        activateDialogue("liberal-enacted");
        libEnacted++;
        if (libEnacted > 4) {
            activateDialogue("liberals-win");
            gameOver = True;
        }
    } else {
        activateDialogue("executive-action");
        if (facEnacted < 3) {
            console.log("fac under 3");
            switch(players.length) {
                case 5: case 6:
                    console.log("5,6");
                    switch(facEnacted) {
                        case 0: case 1: activateDialogue("fascist-enacted"); break;
                        case 2: viewNextDraw(); break;
                    } break;
                case 7: case 8:  
                    switch(facEnacted) {
                        case 0: activateDialogue("fascist-enacted"); break;
                        case 1: investPrepare(); break; // investigate
                        case 2: activateDialogue("special-election"); break; // special election
                    } break;
                case 9: case 10: 
                    switch(facEnacted) {
                    case 0: case 1: investPrepare(); break; // investigate
                    case 2: activateDialogue("special-election"); break; // special election
                } break;
            }
            facEnacted++;
        } else {
            console.log("fac in hit zone");
            switch(facEnacted) {
                case 3: activateDialogue("executive-execute"); break;
                case 4: activateDialogue("executive-execute-veto"); activateVeto(); break;
                case 5: activateDialogue("fascists-win"); break;
                gameOver = True;
            }
            facEnacted++;
        }
        console.log("end");
    }
    cards = "";
    failed = 0;
    checkReshuffle();
    updateState();
}

function viewNextDraw() {
    activateDialogue("view-draw-warning");
    container = document.getElementById("container-cards-next");
    var msg = "";

    checkReshuffle()
    var upcomming = cardstack.slice(0,3);
    for (c of upcomming) {
        msg += cardHTML(c);
    }
    container.innerHTML = msg;
}

function investPrepare() {
    activateDialogue("invest-warning");
    var msg = "";
    var i = 0;
    for (p of players) {
        if (!p.invest) {
        msg += '<button class="fullsize big" onclick="investigate('+String(i)+')" >'
        msg += p.name;
        msg += '</button><br>';
        i++;
        }
    }
    document.getElementById("player-invest-container").innerHTML = msg;
}


function investigate(playerID) {
    activateDialogue("invest-show");
    var gameMsg = document.getElementById("game-msg").innerHTML;
    var msg = ""
    p = players[playerID];
    p.invest = true;
    msg += "<p>The membership of "
    msg += p.name;
    msg += " is </p><p>"
    switch (p.role) {
        case "H": case "F": msg += "FASCIST"; break;
        case "L" : msg += "LIBERAL"; break;
    }
    msg += "</p>"
    gameMsg += "<p>"+p.name+" was investigated.</p>";
    document.getElementById("game-msg").innerHTML = gameMsg;
    document.getElementById("player-invest-id").innerHTML = msg;
}

function failedElection() {
    if (gameOver) {return}
    failed++
    if (failed == 3) {
        activateDialogue("3-failed-elect");
        failed = 0;
    }
    updateState();
}

function flipCard() {
    switch( draw(1) ) {
        case "L": libEnacted++; activateDialogue("liberal-enacted"); checkWin(); break;
        case "F": facEnacted++; activateDialogue("fascist-enacted"); checkWin(); break;
    }
    checkReshuffle();
    updateState()
}

function checkWin() {
    if (libEnacted > 4) {
        activateDialogue("liberals-win");
        gameOver = true;
    } else if (facEnacted > 5) {
        activateDialogue("fascists-win");   
        gameOver = true;
    }
}

function reveal() {
        activateDialogue('reveal-roles');
        document.getElementById("reveal-list").innerHTML = "";
        var role = ""
        for (p of players) {
        var node = document.createElement("LI");
        switch(p.role) {
            case "L": role = "liberal"; break;
            case "F": role = "fascist"; break;
            case "H": role = "Hitler"; break;
        }
        node.innerHTML = p.name+' was '+role;
        document.getElementById("reveal-list").appendChild(node)
        }
}

String.prototype.shuffle = function () {
        var a = this.split(""),
                    n = a.length;

            for(var i = n - 1; i > 0; i--) {
                        var j = Math.floor(Math.random() * (i + 1));
                                var tmp = a[i];
                                        a[i] = a[j];
                                                a[j] = tmp;
                                                    }
                return a.join("");
}

String.prototype.pop = function(i) {
    return this.slice(0,i) + this.slice(i+1);
}

function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
}
