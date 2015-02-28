/**
 *Copyright 2014 Yemasthui
 *Modifications (including forks) of the code to fit personal needs are allowed only for personal use and should refer back to the original source.
 *This software is not for profit, any extension, or unauthorised person providing this software is not authorised to be in a position of any monetary gain from this use of this software. Any and all money gained under the use of the software (which includes donations) must be passed on to the original author.
 */


(function () {

    API.getWaitListPosition = function(id){
        if(typeof id === 'undefined' || id === null){
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for(var i = 0; i < wl.length; i++){
            if(wl[i].id === id){
                return i;
            }
        }
        return -1;
    };

    var kill = function () {
        clearInterval(nanoBot.room.autodisableInterval);
        clearInterval(nanoBot.room.afkInterval);
        nanoBot.status = false;
    };

    var storeToStorage = function () {
        localStorage.setItem("nanoBotsettings", JSON.stringify(nanoBot.settings));
        localStorage.setItem("nanoBotRoom", JSON.stringify(nanoBot.room));
        var nanoBotStorageInfo = {
            time: Date.now(),
            stored: true,
            version: nanoBot.version
        };
        localStorage.setItem("nanoBotStorageInfo", JSON.stringify(nanoBotStorageInfo));

    };

    var subChat = function (chat, obj) {
        if (typeof chat === "undefined") {
            API.chatLog("There is a chat text missing.");
            console.log("There is a chat text missing.");
            return "[Error] No text message found.";
        }
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        return chat;
    };

    var loadChat = function (cb) {
        if (!cb) cb = function () {
        };
        $.get("https://rawgit.com/ThunderGemios10/nanoBot/master/lang/langIndex.json", function (json) {
            var link = nanoBot.chatLink;
            if (json !== null && typeof json !== "undefined") {
                langIndex = json;
                link = langIndex[nanoBot.settings.language.toLowerCase()];
                if (nanoBot.settings.chatLink !== nanoBot.chatLink) {
                    link = nanoBot.settings.chatLink;
                }
                else {
                    if (typeof link === "undefined") {
                        link = nanoBot.chatLink;
                    }
                }
                $.get(link, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        nanoBot.chat = json;
                        cb();
                    }
                });
            }
            else {
                $.get(nanoBot.chatLink, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        nanoBot.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function () {
        var settings = JSON.parse(localStorage.getItem("nanoBotsettings"));
        if (settings !== null) {
            for (var prop in settings) {
                nanoBot.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function () {
        var info = localStorage.getItem("nanoBotStorageInfo");
        if (info === null) API.chatLog(nanoBot.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem("nanoBotsettings"));
            var room = JSON.parse(localStorage.getItem("nanoBotRoom"));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(nanoBot.chat.retrievingdata);
                for (var prop in settings) {
                    nanoBot.settings[prop] = settings[prop];
                }
                nanoBot.room.users = room.users;
                nanoBot.room.afkList = room.afkList;
                nanoBot.room.historyList = room.historyList;
                nanoBot.room.mutedUsers = room.mutedUsers;
                nanoBot.room.autoskip = room.autoskip;
                nanoBot.room.roomstats = room.roomstats;
                nanoBot.room.messages = room.messages;
                nanoBot.room.queue = room.queue;
                nanoBot.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(nanoBot.chat.datarestored);
            }
        }
        /*var json_sett = null;
        var roominfo = document.getElementById("room-info");
        info = roominfo.textContent;
        var ref_bot = "@nanoBot=";
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(" ") < link.indexOf("\n")) ind_space = link.indexOf(" ");
            else ind_space = link.indexOf("\n");
            link = link.substring(0, ind_space);
            $.get(link, function (json) {
                if (json !== null && typeof json !== "undefined") {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        nanoBot.settings[prop] = json_sett[prop];
                    }
                }
            });
        }*/

    };

    String.prototype.splitBetween = function (a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            }
            else arr.push(self[i]);
        }
        return arr;
    };

    var linkFixer = function (msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

    var botCreator = "Matthew (Yemasthui)";
    var botMaintainer = "Benzi (Quoona)"
    var botCreatorIDs = ["3851534", "3934992", "4105209"];

    var nanoBot = {
        version: "2.2.1",
        status: false,
        name: "nanoBot",
        loggedInID: null,
        scriptLink: "https://rawgit.com/ThunderGemios10/nanoBot/master/nanoBot.js",
        cmdLink: "http://git.io/245Ppg",
        chatLink: "https://rawgit.com/ThunderGemios10/nanoBot/master/lang/en.json",
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: "nanoBot",
            language: "english",
            chatLink: "https://rawgit.com/ThunderGemios10/nanoBot/master/lang/en.json",
            startupCap: 1, // 1-200
            startupVolume: 0, // 0-100
            startupEmoji: false, // true or false
            maximumAfk: 120,
            afkRemoval: true,
            maximumDc: 60,
            bouncerPlus: true,
            blacklistEnabled: true,
            lockdownEnabled: false,
            lockGuard: false,
            maximumLocktime: 10,
            cycleGuard: true,
            maximumCycletime: 10,
            voteSkip: false,
            voteSkipLimit: 10,
            timeGuard: true,
            maximumSongLength: 10,
            autodisable: true,
            commandCooldown: 30,
            usercommandsEnabled: true,
            lockskipPosition: 3,
            lockskipReasons: [
                ["theme", "This song does not fit the room theme. "],
                ["op", "This song is on the OP list. "],
                ["history", "This song is in the history. "],
                ["mix", "You played a mix, which is against the rules. "],
                ["sound", "The song you played had bad sound quality or no sound. "],
                ["nsfw", "The song you contained was NSFW (image or sound). "],
                ["unavailable", "The song you played was not available for some users. "]
            ],
            afkpositionCheck: 15,
            afkRankCheck: "ambassador",
            motdEnabled: false,
            motdInterval: 5,
            motd: "Temporary Message of the Day",
            filterChat: true,
            etaRestriction: false,
            welcome: true,
            opLink: null,
            rulesLink: null,
            themeLink: null,
            fbLink: null,
            youtubeLink: null,
            website: null,
            intervalMessages: [],
            messageInterval: 5,
            songstats: true,
            commandLiteral: "!",
            blacklists: {
                NSFW: "https://rawgit.com/ThunderGemios10/nanoBot-customization/master/blacklists/ExampleNSFWlist.json",
                OP: "https://rawgit.com/ThunderGemios10/nanoBot-customization/master/blacklists/ExampleOPlist.json"
            }
        },
        room: {
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: true,
            allcommand: true,
            afkInterval: null,
            autoskip: false,
            autoskipTimer: null,
            autodisableInterval: null,
            autodisableFunc: function () {
                if (nanoBot.status && nanoBot.settings.autodisable) {
                    API.sendChat('!afkdisable');
                    API.sendChat('!joindisable');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function () {
            }, 1),
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
            blacklists: {

            },
            newBlacklisted: [],
            newBlacklistedSongFunction: null,
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function () {
                    nanoBot.room.roulette.rouletteStatus = true;
                    nanoBot.room.roulette.countdown = setTimeout(function () {
                        nanoBot.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(nanoBot.chat.isopen);
                },
                endRoulette: function () {
                    nanoBot.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * nanoBot.room.roulette.participants.length);
                    var winner = nanoBot.room.roulette.participants[ind];
                    nanoBot.room.roulette.participants = [];
                    var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = nanoBot.userUtilities.lookupUser(winner);
                    var name = user.username;
                    API.sendChat(subChat(nanoBot.chat.winnerpicked, {name: name, position: pos}));
                    setTimeout(function (winner, pos) {
                        nanoBot.userUtilities.moveUser(winner, pos, false);
                    }, 1 * 1000, winner, pos);
                }
            }
        },
        User: function (id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.lastKnownPosition = null;
        },
        userUtilities: {
            getJointime: function (user) {
                return user.jointime;
            },
            getUser: function (user) {
                return API.getUser(user.id);
            },
            updatePosition: function (user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function (user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = nanoBot.room.roomstats.songCount;
            },
            setLastActivity: function (user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function (user) {
                return user.lastActivity;
            },
            getWarningCount: function (user) {
                return user.afkWarningCount;
            },
            setWarningCount: function (user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function (id) {
                for (var i = 0; i < nanoBot.room.users.length; i++) {
                    if (nanoBot.room.users[i].id === id) {
                        return nanoBot.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function (name) {
                for (var i = 0; i < nanoBot.room.users.length; i++) {
                    var match = nanoBot.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return nanoBot.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function (id) {
                var user = nanoBot.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function (obj) { //1 requests
                var u;
                if (typeof obj === "object") u = obj;
                else u = API.getUser(obj);
                for (var i = 0; i < botCreatorIDs.length; i++) {
                    if (botCreatorIDs[i].indexOf(u.id) > -1) return 10;
                }
                if (u.gRole < 2) return u.role;
                else {
                    switch (u.gRole) {
                        case 2:
                            return 7;
                        case 3:
                            return 8;
                        case 4:
                            return 9;
                        case 5:
                            return 10;
                    }
                }
                return 0;
            },
            moveUser: function (id, pos, priority) {
                var user = nanoBot.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function (id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    }
                    else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < nanoBot.room.queue.id.length; i++) {
                            if (nanoBot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            nanoBot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(nanoBot.chat.alreadyadding, {position: nanoBot.room.queue.position[alreadyQueued]}));
                        }
                        nanoBot.roomUtilities.booth.lockBooth();
                        if (priority) {
                            nanoBot.room.queue.id.unshift(id);
                            nanoBot.room.queue.position.unshift(pos);
                        }
                        else {
                            nanoBot.room.queue.id.push(id);
                            nanoBot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(nanoBot.chat.adding, {name: name, position: nanoBot.room.queue.position.length}));
                    }
                }
                else API.moderateMoveDJ(id, pos);
            },
            dclookup: function (id) {
                var user = nanoBot.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return nanoBot.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(nanoBot.chat.notdisconnected, {name: name});
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return nanoBot.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (nanoBot.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = nanoBot.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(nanoBot.chat.toolongago, {name: nanoBot.userUtilities.getUser(user).username, time: time}));
                var songsPassed = nanoBot.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = nanoBot.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) newPosition = 1;
                var msg = subChat(nanoBot.chat.valid, {name: nanoBot.userUtilities.getUser(user).username, time: time, position: newPosition});
                nanoBot.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            }
        },

        roomUtilities: {
            rankToNumber: function (rankString) {
                var rankInt = null;
                switch (rankString) {
                    case "admin":
                        rankInt = 10;
                        break;
                    case "ambassador":
                        rankInt = 7;
                        break;
                    case "host":
                        rankInt = 5;
                        break;
                    case "cohost":
                        rankInt = 4;
                        break;
                    case "manager":
                        rankInt = 3;
                        break;
                    case "bouncer":
                        rankInt = 2;
                        break;
                    case "residentdj":
                        rankInt = 1;
                        break;
                    case "user":
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function (msTime) {
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                    'days': 0,
                    'hours': 0,
                    'minutes': 0,
                    'seconds': 0
                };
                ms = {
                    'day': 24 * 60 * 60 * 1000,
                    'hour': 60 * 60 * 1000,
                    'minute': 60 * 1000,
                    'second': 1000
                };
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            booth: {
                lockTimer: setTimeout(function () {
                }, 1000),
                locked: false,
                lockBooth: function () {
                    API.moderateLockWaitList(!nanoBot.roomUtilities.booth.locked);
                    nanoBot.roomUtilities.booth.locked = false;
                    if (nanoBot.settings.lockGuard) {
                        nanoBot.roomUtilities.booth.lockTimer = setTimeout(function () {
                            API.moderateLockWaitList(nanoBot.roomUtilities.booth.locked);
                        }, nanoBot.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function () {
                    API.moderateLockWaitList(nanoBot.roomUtilities.booth.locked);
                    clearTimeout(nanoBot.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function () {
                if (!nanoBot.status || !nanoBot.settings.afkRemoval) return void (0);
                var rank = nanoBot.roomUtilities.rankToNumber(nanoBot.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, nanoBot.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void (0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = nanoBot.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = nanoBot.userUtilities.getUser(user);
                            if (rank !== null && nanoBot.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = nanoBot.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = nanoBot.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > nanoBot.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(nanoBot.chat.warning1, {name: name, time: time}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    }
                                    else if (warncount === 1) {
                                        API.sendChat(subChat(nanoBot.chat.warning2, {name: name}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    }
                                    else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            nanoBot.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(nanoBot.chat.afkremove, {name: name, time: time, position: pos, maximumafk: nanoBot.settings.maximumAfk}));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            changeDJCycle: function () {
                var toggle = $(".cycle-toggle");
                if (toggle.hasClass("disabled")) {
                    toggle.click();
                    if (nanoBot.settings.cycleGuard) {
                        nanoBot.room.cycleTimer = setTimeout(function () {
                            if (toggle.hasClass("enabled")) toggle.click();
                        }, nanoBot.settings.cycleMaxTime * 60 * 1000);
                    }
                }
                else {
                    toggle.click();
                    clearTimeout(nanoBot.room.cycleTimer);
                }
            },
            intervalMessage: function () {
                var interval;
                if (nanoBot.settings.motdEnabled) interval = nanoBot.settings.motdInterval;
                else interval = nanoBot.settings.messageInterval;
                if ((nanoBot.room.roomstats.songCount % interval) === 0 && nanoBot.status) {
                    var msg;
                    if (nanoBot.settings.motdEnabled) {
                        msg = nanoBot.settings.motd;
                    }
                    else {
                        if (nanoBot.settings.intervalMessages.length === 0) return void (0);
                        var messageNumber = nanoBot.room.roomstats.songCount % nanoBot.settings.intervalMessages.length;
                        msg = nanoBot.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function () {
                for (var bl in nanoBot.settings.blacklists) {
                    nanoBot.room.blacklists[bl] = [];
                    if (typeof nanoBot.settings.blacklists[bl] === 'function') {
                        nanoBot.room.blacklists[bl] = nanoBot.settings.blacklists();
                    }
                    else if (typeof nanoBot.settings.blacklists[bl] === 'string') {
                        if (nanoBot.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function (l) {
                                $.get(nanoBot.settings.blacklists[l], function (data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    nanoBot.room.blacklists[l] = list;
                                })
                            })(bl);
                        }
                        catch (e) {
                            API.chatLog('Error setting' + bl + 'blacklist.');
                            console.log('Error setting' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function () {
                if (typeof console.table !== 'undefined') {
                    console.table(nanoBot.room.newBlacklisted);
                }
                else {
                    console.log(nanoBot.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function () {
                var list = {};
                for (var i = 0; i < nanoBot.room.newBlacklisted.length; i++) {
                    var track = nanoBot.room.newBlacklisted[i];
                    list[track.list] = [];
                    list[track.list].push({
                        title: track.title,
                        author: track.author,
                        mid: track.mid
                    });
                }
                return list;
            }
        },
        eventChat: function (chat) {
            chat.message = linkFixer(chat.message);
            chat.message = chat.message.trim();
            for (var i = 0; i < nanoBot.room.users.length; i++) {
                if (nanoBot.room.users[i].id === chat.uid) {
                    nanoBot.userUtilities.setLastActivity(nanoBot.room.users[i]);
                    if (nanoBot.room.users[i].username !== chat.un) {
                        nanoBot.room.users[i].username = chat.un;
                    }
                }
            }
            if (nanoBot.chatUtilities.chatFilter(chat)) return void (0);
            if (!nanoBot.chatUtilities.commandCheck(chat))
                nanoBot.chatUtilities.action(chat);
        },
        eventUserjoin: function (user) {
            var known = false;
            var index = null;
            for (var i = 0; i < nanoBot.room.users.length; i++) {
                if (nanoBot.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            var greet = true;
            var welcomeback = null;
            if (known) {
                nanoBot.room.users[index].inRoom = true;
                var u = nanoBot.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            }
            else {
                nanoBot.room.users.push(new nanoBot.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < nanoBot.room.users.length; j++) {
                if (nanoBot.userUtilities.getUser(nanoBot.room.users[j]).id === user.id) {
                    nanoBot.userUtilities.setLastActivity(nanoBot.room.users[j]);
                    nanoBot.room.users[j].jointime = Date.now();
                }

            }
            if (nanoBot.settings.welcome && greet) {
                welcomeback ?
                    setTimeout(function (user) {
                        API.sendChat(subChat(nanoBot.chat.welcomeback, {name: user.username}));
                    }, 1 * 1000, user)
                    :
                    setTimeout(function (user) {
                        API.sendChat(subChat(nanoBot.chat.welcome, {name: user.username}));
                    }, 1 * 1000, user);
            }
        },
        eventUserleave: function (user) {
            for (var i = 0; i < nanoBot.room.users.length; i++) {
                if (nanoBot.room.users[i].id === user.id) {
                    nanoBot.userUtilities.updateDC(nanoBot.room.users[i]);
                    nanoBot.room.users[i].inRoom = false;
                }
            }
        },
        eventVoteupdate: function (obj) {
            for (var i = 0; i < nanoBot.room.users.length; i++) {
                if (nanoBot.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        nanoBot.room.users[i].votes.woot++;
                    }
                    else {
                        nanoBot.room.users[i].votes.meh++;
                    }
                }
            }

            var mehs = API.getScore().negative;
            var woots = API.getScore().positive;
            var dj = API.getDJ();

            if (nanoBot.settings.voteSkip) {
                if ((mehs - woots) >= (nanoBot.settings.voteSkipLimit)) {
                    API.sendChat(subChat(nanoBot.chat.voteskipexceededlimit, {name: dj.username, limit: nanoBot.settings.voteSkipLimit}));
                    API.moderateForceSkip();
                }
            }

        },
        eventCurateupdate: function (obj) {
            for (var i = 0; i < nanoBot.room.users.length; i++) {
                if (nanoBot.room.users[i].id === obj.user.id) {
                    nanoBot.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function (obj) {
            $("#woot").click();
            var user = nanoBot.userUtilities.lookupUser(obj.dj.id)
            for(var i = 0; i < nanoBot.room.users.length; i++){
                if(nanoBot.room.users[i].id === user.id){
                    nanoBot.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }

            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (nanoBot.settings.songstats) {
                if (typeof nanoBot.chat.songstatistics === "undefined") {
                    API.sendChat("/me " + lastplay.media.author + " - " + lastplay.media.title + ": " + lastplay.score.positive + "W/" + lastplay.score.grabs + "G/" + lastplay.score.negative + "M.")
                }
                else {
                    API.sendChat(subChat(nanoBot.chat.songstatistics, {artist: lastplay.media.author, title: lastplay.media.title, woots: lastplay.score.positive, grabs: lastplay.score.grabs, mehs: lastplay.score.negative}))
                }
            }
            nanoBot.room.roomstats.totalWoots += lastplay.score.positive;
            nanoBot.room.roomstats.totalMehs += lastplay.score.negative;
            nanoBot.room.roomstats.totalCurates += lastplay.score.grabs;
            nanoBot.room.roomstats.songCount++;
            nanoBot.roomUtilities.intervalMessage();
            nanoBot.room.currentDJID = obj.dj.id;

            var mid = obj.media.format + ':' + obj.media.cid;
            for (var bl in nanoBot.room.blacklists) {
                if (nanoBot.settings.blacklistEnabled) {
                    if (nanoBot.room.blacklists[bl].indexOf(mid) > -1) {
                        API.sendChat(subChat(nanoBot.chat.isblacklisted, {blacklist: bl}));
                        return API.moderateForceSkip();
                    }
                }
            }

            var alreadyPlayed = false;
            for (var i = 0; i < nanoBot.room.historyList.length; i++) {
                if (nanoBot.room.historyList[i][0] === obj.media.cid) {
                    var firstPlayed = nanoBot.room.historyList[i][1];
                    var plays = nanoBot.room.historyList[i].length - 1;
                    var lastPlayed = nanoBot.room.historyList[i][plays];
                    API.sendChat(subChat(nanoBot.chat.songknown, {plays: plays, timetotal: nanoBot.roomUtilities.msToStr(Date.now() - firstPlayed), lasttime: nanoBot.roomUtilities.msToStr(Date.now() - lastPlayed)}));
                    nanoBot.room.historyList[i].push(+new Date());
                    alreadyPlayed = true;
                }
            }
            if (!alreadyPlayed) {
                nanoBot.room.historyList.push([obj.media.cid, +new Date()]);
            }
            var newMedia = obj.media;
            if (nanoBot.settings.timeGuard && newMedia.duration > nanoBot.settings.maximumSongLength * 60 && !nanoBot.room.roomevent) {
                var name = obj.dj.username;
                API.sendChat(subChat(nanoBot.chat.timelimit, {name: name, maxlength: nanoBot.settings.maximumSongLength}));
                API.moderateForceSkip();
            }
            if (user.ownSong) {
                API.sendChat(subChat(nanoBot.chat.permissionownsong, {name: user.username}));
                user.ownSong = false;
            }
            clearTimeout(nanoBot.room.autoskipTimer);
            if (nanoBot.room.autoskip) {
                var remaining = obj.media.duration * 1000;
                nanoBot.room.autoskipTimer = setTimeout(function () {
                    console.log("Skipping track.");
                    //API.sendChat('Song stuck, skipping...');
                    API.moderateForceSkip();
                }, remaining + 3000);
            }
            storeToStorage();

        },
        eventWaitlistupdate: function (users) {
            if (users.length < 50) {
                if (nanoBot.room.queue.id.length > 0 && nanoBot.room.queueable) {
                    nanoBot.room.queueable = false;
                    setTimeout(function () {
                        nanoBot.room.queueable = true;
                    }, 500);
                    nanoBot.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function () {
                            id = nanoBot.room.queue.id.splice(0, 1)[0];
                            pos = nanoBot.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function (id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    nanoBot.room.queueing--;
                                    if (nanoBot.room.queue.id.length === 0) setTimeout(function () {
                                        nanoBot.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + nanoBot.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = nanoBot.userUtilities.lookupUser(users[i].id);
                nanoBot.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function (chat) {
            if (!nanoBot.settings.filterChat) return false;
            if (nanoBot.userUtilities.getPermission(chat.uid) > 1) return false;
            var msg = chat.message;
            var containsLetters = false;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
            }
            if (msg === '') {
                return true;
            }
            if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
            msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
            var capitals = 0;
            var ch;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if (ch >= 'A' && ch <= 'Z') capitals++;
            }
            if (capitals >= 40) {
                API.sendChat(subChat(nanoBot.chat.caps, {name: chat.un}));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(nanoBot.chat.askskip, {name: chat.un}));
                return true;
            }
            for (var j = 0; j < nanoBot.chatUtilities.spam.length; j++) {
                if (msg === nanoBot.chatUtilities.spam[j]) {
                    API.sendChat(subChat(nanoBot.chat.spam, {name: chat.un}));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function (chat) {
                var msg = chat.message;
                var perm = nanoBot.userUtilities.getPermission(chat.uid);
                var user = nanoBot.userUtilities.lookupUser(chat.uid);
                var isMuted = false;
                for (var i = 0; i < nanoBot.room.mutedUsers.length; i++) {
                    if (nanoBot.room.mutedUsers[i] === chat.uid) isMuted = true;
                }
                if (isMuted) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (nanoBot.settings.lockdownEnabled) {
                    if (perm === 0) {
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                if (nanoBot.chatcleaner(chat)) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                /**
                 var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                 if (plugRoomLinkPatt.exec(msg)) {
                    if (perm === 0) {
                        API.sendChat(subChat(nanoBot.chat.roomadvertising, {name: chat.un}));
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                 **/
                if (msg.indexOf('http://adf.ly/') > -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.sendChat(subChat(nanoBot.chat.adfly, {name: chat.un}));
                    return true;
                }
                if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }

                var rlJoinChat = nanoBot.chat.roulettejoin;
                var rlLeaveChat = nanoBot.chat.rouletteleave;

                var joinedroulette = rlJoinChat.split('%%NAME%%');
                if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                else joinedroulette = joinedroulette[0];

                var leftroulette = rlLeaveChat.split('%%NAME%%');
                if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                else leftroulette = leftroulette[0];

                if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === nanoBot.loggedInID) {
                    setTimeout(function (id) {
                        API.moderateDeleteChat(id);
                    }, 2 * 1000, chat.cid);
                    return true;
                }
                return false;
            },
            commandCheck: function (chat) {
                var cmd;
                if (chat.message.charAt(0) === '!') {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    }
                    else cmd = chat.message.substring(0, space);
                }
                else return false;
                var userPerm = nanoBot.userUtilities.getPermission(chat.uid);
                //console.log("name: " + chat.un + ", perm: " + userPerm);
                if (chat.message !== "!join" && chat.message !== "!leave") {
                    if (userPerm === 0 && !nanoBot.room.usercommand) return void (0);
                    if (!nanoBot.room.allcommand) return void (0);
                }
                if (chat.message === '!eta' && nanoBot.settings.etaRestriction) {
                    if (userPerm < 2) {
                        var u = nanoBot.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            return void (0);
                        }
                        else u.lastEta = Date.now();
                    }
                }
                var executed = false;

                for (var comm in nanoBot.commands) {
                    var cmdCall = nanoBot.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (nanoBot.settings.commandLiteral + cmdCall[i] === cmd) {
                            nanoBot.commands[comm].functionality(chat, nanoBot.settings.commandLiteral + cmdCall[i]);
                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === 0) {
                    nanoBot.room.usercommand = false;
                    setTimeout(function () {
                        nanoBot.room.usercommand = true;
                    }, nanoBot.settings.commandCooldown * 1000);
                }
                if (executed) {
                    API.moderateDeleteChat(chat.cid);
                    nanoBot.room.allcommand = false;
                    setTimeout(function () {
                        nanoBot.room.allcommand = true;
                    }, 5 * 1000);
                }
                return executed;
            },
            action: function (chat) {
                var user = nanoBot.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < nanoBot.room.users.length; j++) {
                        if (nanoBot.userUtilities.getUser(nanoBot.room.users[j]).id === chat.uid) {
                            nanoBot.userUtilities.setLastActivity(nanoBot.room.users[j]);
                        }

                    }
                }
                nanoBot.room.roomstats.chatmessages++;
            },
            spam: [
                'hueh', 'hu3', 'brbr', 'heu', 'brbr', 'kkkk', 'spoder', 'mafia', 'zuera', 'zueira',
                'zueria', 'aehoo', 'aheu', 'alguem', 'algum', 'brazil', 'zoeira', 'fuckadmins', 'affff', 'vaisefoder', 'huenaarea',
                'hitler', 'ashua', 'ahsu', 'ashau', 'lulz', 'huehue', 'hue', 'huehuehue', 'merda', 'pqp', 'puta', 'mulher', 'pula', 'retarda', 'caralho', 'filha', 'ppk',
                'gringo', 'fuder', 'foder', 'hua', 'ahue', 'modafuka', 'modafoka', 'mudafuka', 'mudafoka', 'ooooooooooooooo', 'foda'
            ],
            curses: [
                'nigger', 'faggot', 'nigga', 'niqqa', 'motherfucker', 'modafocka'
            ]
        },
        connectAPI: function () {
            this.proxy = {
                eventChat: $.proxy(this.eventChat, this),
                eventUserskip: $.proxy(this.eventUserskip, this),
                eventUserjoin: $.proxy(this.eventUserjoin, this),
                eventUserleave: $.proxy(this.eventUserleave, this),
                eventUserfan: $.proxy(this.eventUserfan, this),
                eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                eventFanjoin: $.proxy(this.eventFanjoin, this),
                eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                eventDjadvance: $.proxy(this.eventDjadvance, this),
                eventDjupdate: $.proxy(this.eventDjupdate, this),
                eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                eventVoteskip: $.proxy(this.eventVoteskip, this),
                eventModskip: $.proxy(this.eventModskip, this),
                eventChatcommand: $.proxy(this.eventChatcommand, this),
                eventHistoryupdate: $.proxy(this.eventHistoryupdate, this)

            };
            API.on(API.CHAT, this.proxy.eventChat);
            API.on(API.USER_SKIP, this.proxy.eventUserskip);
            API.on(API.USER_JOIN, this.proxy.eventUserjoin);
            API.on(API.USER_LEAVE, this.proxy.eventUserleave);
            API.on(API.USER_FAN, this.proxy.eventUserfan);
            API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
            API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.on(API.ADVANCE, this.proxy.eventDjadvance);
            API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.on(API.MOD_SKIP, this.proxy.eventModskip);
            API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        disconnectAPI: function () {
            API.off(API.CHAT, this.proxy.eventChat);
            API.off(API.USER_SKIP, this.proxy.eventUserskip);
            API.off(API.USER_JOIN, this.proxy.eventUserjoin);
            API.off(API.USER_LEAVE, this.proxy.eventUserleave);
            API.off(API.USER_FAN, this.proxy.eventUserfan);
            API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
            API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.off(API.ADVANCE, this.proxy.eventDjadvance);
            API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.off(API.MOD_SKIP, this.proxy.eventModskip);
            API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        startup: function () {
            Function.prototype.toString = function () {
                return 'Function.'
            };
            var u = API.getUser();
            if (nanoBot.userUtilities.getPermission(u) < 2) return API.chatLog(nanoBot.chat.greyuser);
            if (nanoBot.userUtilities.getPermission(u) === 2) API.chatLog(nanoBot.chat.bouncer);
            nanoBot.connectAPI();
            API.moderateDeleteChat = function (cid) {
                $.ajax({
                    url: "https://plug.dj/_/chat/" + cid,
                    type: "DELETE"
                })
            };
            retrieveSettings();
            retrieveFromStorage();
            window.bot = nanoBot;
            nanoBot.roomUtilities.updateBlacklists();
            setInterval(nanoBot.roomUtilities.updateBlacklists, 60 * 60 * 1000);
            nanoBot.getNewBlacklistedSongs = nanoBot.roomUtilities.exportNewBlacklistedSongs;
            nanoBot.logNewBlacklistedSongs = nanoBot.roomUtilities.logNewBlacklistedSongs;
            if (nanoBot.room.roomstats.launchTime === null) {
                nanoBot.room.roomstats.launchTime = Date.now();
            }

            for (var j = 0; j < nanoBot.room.users.length; j++) {
                nanoBot.room.users[j].inRoom = false;
            }
            var userlist = API.getUsers();
            for (var i = 0; i < userlist.length; i++) {
                var known = false;
                var ind = null;
                for (var j = 0; j < nanoBot.room.users.length; j++) {
                    if (nanoBot.room.users[j].id === userlist[i].id) {
                        known = true;
                        ind = j;
                    }
                }
                if (known) {
                    nanoBot.room.users[ind].inRoom = true;
                }
                else {
                    nanoBot.room.users.push(new nanoBot.User(userlist[i].id, userlist[i].username));
                    ind = nanoBot.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(nanoBot.room.users[ind].id) + 1;
                nanoBot.userUtilities.updatePosition(nanoBot.room.users[ind], wlIndex);
            }
            nanoBot.room.afkInterval = setInterval(function () {
                nanoBot.roomUtilities.afkCheck()
            }, 10 * 1000);
            nanoBot.room.autodisableInterval = setInterval(function () {
                nanoBot.room.autodisableFunc();
            }, 60 * 60 * 1000);
            nanoBot.loggedInID = API.getUser().id;
            nanoBot.status = true;
            API.sendChat('/cap ' + nanoBot.settings.startupCap);
            API.setVolume(nanoBot.settings.startupVolume);
            $("#woot").click();
            if (nanoBot.settings.startupEmoji) {
                var emojibuttonoff = $(".icon-emoji-off");
                if (emojibuttonoff.length > 0) {
                    emojibuttonoff[0].click();
                }
                API.chatLog(':smile: Emojis enabled.');
            }
            else {
                var emojibuttonon = $(".icon-emoji-on");
                if (emojibuttonon.length > 0) {
                    emojibuttonon[0].click();
                }
                API.chatLog('Emojis disabled.');
            }
            API.chatLog('Avatars capped at ' + nanoBot.settings.startupCap);
            API.chatLog('Volume set to ' + nanoBot.settings.startupVolume);
            loadChat(API.sendChat(subChat(nanoBot.chat.online, {botname: nanoBot.settings.botName, version: nanoBot.version})));
        },
        commands: {
            executable: function (minRank, chat) {
                var id = chat.uid;
                var perm = nanoBot.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = 10;
                        break;
                    case 'ambassador':
                        minPerm = 7;
                        break;
                    case 'host':
                        minPerm = 5;
                        break;
                    case 'cohost':
                        minPerm = 4;
                        break;
                    case 'manager':
                        minPerm = 3;
                        break;
                    case 'mod':
                        if (nanoBot.settings.bouncerPlus) {
                            minPerm = 2;
                        }
                        else {
                            minPerm = 3;
                        }
                        break;
                    case 'bouncer':
                        minPerm = 2;
                        break;
                    case 'residentdj':
                        minPerm = 1;
                        break;
                    case 'user':
                        minPerm = 0;
                        break;
                    default:
                        API.chatLog('error assigning minimum permission');
                }
                return perm >= minPerm;

            },
            /**
             command: {
                        command: 'cmd',
                        rank: 'user/bouncer/mod/manager',
                        type: 'startsWith/exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !nanoBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                
                                }
                        }
                },
             **/

            activeCommand: {
                command: 'active',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;
                        if (msg.length === cmd.length) time = 60;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(nanoBot.chat.invalidtime, {name: chat.un}));
                        }
                        for (var i = 0; i < nanoBot.room.users.length; i++) {
                            userTime = nanoBot.userUtilities.getLastActivity(nanoBot.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(nanoBot.chat.activeusersintime, {name: chat.un, amount: chatters, time: time}));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(nanoBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = nanoBot.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (nanoBot.room.roomevent) {
                                    nanoBot.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(nanoBot.chat.invaliduserspecified, {name: chat.un}));
                        }
                    }
                }
            },

            afklimitCommand: {
                command: 'afklimit',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(nanoBot.chat.nolimitspecified, {name: chat.un}));
                        var limit = msg.substring(cmd.length + 1);
                        if (!isNaN(limit)) {
                            nanoBot.settings.maximumAfk = parseInt(limit, 10);
                            API.sendChat(subChat(nanoBot.chat.maximumafktimeset, {name: chat.un, time: nanoBot.settings.maximumAfk}));
                        }
                        else API.sendChat(subChat(nanoBot.chat.invalidlimitspecified, {name: chat.un}));
                    }
                }
            },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (nanoBot.settings.afkRemoval) {
                            nanoBot.settings.afkRemoval = !nanoBot.settings.afkRemoval;
                            clearInterval(nanoBot.room.afkInterval);
                            API.sendChat(subChat(nanoBot.chat.toggleoff, {name: chat.un, 'function': nanoBot.chat.afkremoval}));
                        }
                        else {
                            nanoBot.settings.afkRemoval = !nanoBot.settings.afkRemoval;
                            nanoBot.room.afkInterval = setInterval(function () {
                                nanoBot.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(nanoBot.chat.toggleon, {name: chat.un, 'function': nanoBot.chat.afkremoval}));
                        }
                    }
                }
            },

            afkresetCommand: {
                command: 'afkreset',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(nanoBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = nanoBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(nanoBot.chat.invaliduserspecified, {name: chat.un}));
                        nanoBot.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(nanoBot.chat.afkstatusreset, {name: chat.un, username: name}));
                    }
                }
            },

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(nanoBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = nanoBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(nanoBot.chat.invaliduserspecified, {name: chat.un}));
                        var lastActive = nanoBot.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = nanoBot.roomUtilities.msToStr(inactivity);
                        API.sendChat(subChat(nanoBot.chat.inactivefor, {name: chat.un, username: name, time: time}));
                    }
                }
            },

            autodisableCommand: {
                command: 'autodisable',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (nanoBot.settings.autodisable) {
                            nanoBot.settings.autodisable = !nanoBot.settings.autodisable;
                            return API.sendChat(subChat(nanoBot.chat.toggleoff, {name: chat.un, 'function': nanoBot.chat.autodisable}));
                        }
                        else {
                            nanoBot.settings.autodisable = !nanoBot.settings.autodisable;
                            return API.sendChat(subChat(nanoBot.chat.toggleon, {name: chat.un, 'function': nanoBot.chat.autodisable}));
                        }

                    }
                }
            },

            autoskipCommand: {
                command: 'autoskip',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (nanoBot.room.autoskip) {
                            nanoBot.room.autoskip = !nanoBot.room.autoskip;
                            clearTimeout(nanoBot.room.autoskipTimer);
                            return API.sendChat(subChat(nanoBot.chat.toggleoff, {name: chat.un, 'function': nanoBot.chat.autoskip}));
                        }
                        else {
                            nanoBot.room.autoskip = !nanoBot.room.autoskip;
                            return API.sendChat(subChat(nanoBot.chat.toggleon, {name: chat.un, 'function': nanoBot.chat.autoskip}));
                        }
                    }
                }
            },

            autowootCommand: {
                command: 'autowoot',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(nanoBot.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(nanoBot.chat.brandambassador);
                    }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(nanoBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = nanoBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(nanoBot.chat.invaliduserspecified, {name: chat.un}));
                        API.moderateBanUser(user.id, 1, API.BAN.DAY);
                    }
                }
            },

            blacklistCommand: {
                command: ['blacklist', 'bl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(nanoBot.chat.nolistspecified, {name: chat.un}));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof nanoBot.room.blacklists[list] === 'undefined') return API.sendChat(subChat(nanoBot.chat.invalidlistspecified, {name: chat.un}));
                        else {
                            var media = API.getMedia();
                            var track = {
                                list: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            };
                            nanoBot.room.newBlacklisted.push(track);
                            nanoBot.room.blacklists[list].push(media.format + ':' + media.cid);
                            API.sendChat(subChat(nanoBot.chat.newblacklisted, {name: chat.un, blacklist: list, author: media.author, title: media.title, mid: media.format + ':' + media.cid}));
                            API.moderateForceSkip();
                            if (typeof nanoBot.room.newBlacklistedSongFunction === 'function') {
                                nanoBot.room.newBlacklistedSongFunction(track);
                            }
                        }
                    }
                }
            },

            blinfoCommand: {
                command: 'blinfo',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ":" + cid;

                        API.sendChat(subChat(nanoBot.chat.blinfo, {name: name, author: author, title: title, songid: songid}));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (nanoBot.settings.bouncerPlus) {
                            nanoBot.settings.bouncerPlus = false;
                            return API.sendChat(subChat(nanoBot.chat.toggleoff, {name: chat.un, 'function': 'Bouncer+'}));
                        }
                        else {
                            if (!nanoBot.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = nanoBot.userUtilities.getPermission(id);
                                if (perm > 2) {
                                    nanoBot.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(nanoBot.chat.toggleon, {name: chat.un, 'function': 'Bouncer+'}));
                                }
                            }
                            else return API.sendChat(subChat(nanoBot.chat.bouncerplusrank, {name: chat.un}));
                        }
                    }
                }
            },

            clearchatCommand: {
                command: 'clearchat',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute("data-cid"));
                        }
                        return API.sendChat(subChat(nanoBot.chat.chatcleared, {name: chat.un}));
                    }
                }
            },

            commandsCommand: {
                command: 'commands',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(nanoBot.chat.commandslink, {botname: nanoBot.settings.botName, link: nanoBot.cmdLink}));
                    }
                }
            },

            cookieCommand: {
                command: 'cookie',
                rank: 'user',
                type: 'startsWith',
                cookies: ['has given you a chocolate chip cookie!',
                    'has given you a soft homemade oatmeal cookie!',
                    'has given you a plain, dry, old cookie. It was the last one in the bag. Gross.',
                    'gives you a sugar cookie. What, no frosting and sprinkles? 0/10 would not touch.',
                    'gives you a chocolate chip cookie. Oh wait, those are raisins. Bleck!',
                    'gives you an enormous cookie. Poking it gives you more cookies. Weird.',
                    'gives you a fortune cookie. It reads "Why aren\'t you working on any projects?"',
                    'gives you a fortune cookie. It reads "Give that special someone a compliment"',
                    'gives you a fortune cookie. It reads "Take a risk!"',
                    'gives you a fortune cookie. It reads "Go outside."',
                    'gives you a fortune cookie. It reads "Don\'t forget to eat your veggies!"',
                    'gives you a fortune cookie. It reads "Do you even lift?"',
                    'gives you a fortune cookie. It reads "m808 pls"',
                    'gives you a fortune cookie. It reads "If you move your hips, you\'ll get all the ladies."',
                    'gives you a fortune cookie. It reads "I love you."',
                    'gives you a Golden Cookie. You can\'t eat it because it is made of gold. Dammit.',
                    'gives you an Oreo cookie with a glass of milk!',
                    'gives you a rainbow cookie made with love :heart:',
                    'gives you an old cookie that was left out in the rain, it\'s moldy.',
                    'bakes you fresh cookies, it smells amazing.'
                ],
                getCookie: function () {
                    var c = Math.floor(Math.random() * this.cookies.length);
                    return this.cookies[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(nanoBot.chat.eatcookie);
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = nanoBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(nanoBot.chat.nousercookie, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(nanoBot.chat.selfcookie, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(nanoBot.chat.cookie, {nameto: user.username, namefrom: chat.un, cookie: this.getCookie()}));
                            }
                        }
                    }
                }
            },

            cycleCommand: {
                command: 'cycle',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        nanoBot.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (nanoBot.settings.cycleGuard) {
                            nanoBot.settings.cycleGuard = !nanoBot.settings.cycleGuard;
                            return API.sendChat(subChat(nanoBot.chat.toggleoff, {name: chat.un, 'function': nanoBot.chat.cycleguard}));
                        }
                        else {
                            nanoBot.settings.cycleGuard = !nanoBot.settings.cycleGuard;
                            return API.sendChat(subChat(nanoBot.chat.toggleon, {name: chat.un, 'function': nanoBot.chat.cycleguard}));
                        }

                    }
                }
            },

            cycletimerCommand: {
                command: 'cycletimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== "") {
                            nanoBot.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(nanoBot.chat.cycleguardtime, {name: chat.un, time: nanoBot.settings.maximumCycletime}));
                        }
                        else return API.sendChat(subChat(nanoBot.chat.invalidtime, {name: chat.un}));

                    }
                }
            },

            voteskipCommand: {
                command: 'voteskip',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(nanoBot.chat.voteskiplimit, {name: chat.un, limit: nanoBot.settings.voteSkipLimit}));
                        var argument = msg.substring(cmd.length + 1);
                        if (!nanoBot.settings.voteSkip) nanoBot.settings.voteSkip = !nanoBot.settings.voteSkip;
                        if (isNaN(argument)) {
                            API.sendChat(subChat(nanoBot.chat.voteskipinvalidlimit, {name: chat.un}));
                        }
                        else {
                            nanoBot.settings.voteSkipLimit = argument;
                            API.sendChat(subChat(nanoBot.chat.voteskipsetlimit, {name: chat.un, limit: nanoBot.settings.voteSkipLimit}));
                        }
                    }
                }
            },

            togglevoteskipCommand: {
                command: 'togglevoteskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (nanoBot.settings.voteSkip) {
                            nanoBot.settings.voteSkip = !nanoBot.settings.voteSkip;
                            API.sendChat(subChat(nanoBot.chat.toggleoff, {name: chat.un, 'function': nanoBot.chat.voteskip}));
                        }
                        else {
                            nanoBot.settings.motdEnabled = !nanoBot.settings.motdEnabled;
                            API.sendChat(subChat(nanoBot.chat.toggleon, {name: chat.un, 'function': nanoBot.chat.voteskip}));
                        }
                    }
                }
            },

            dclookupCommand: {
                command: ['dclookup', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = nanoBot.userUtilities.getPermission(chat.uid);
                            if (perm < 2) return API.sendChat(subChat(nanoBot.chat.dclookuprank, {name: chat.un}));
                        }
                        var user = nanoBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(nanoBot.chat.invaliduserspecified, {name: chat.un}));
                        var toChat = nanoBot.userUtilities.dclookup(user.id);
                        API.sendChat(toChat);
                    }
                }
            },

            /*deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(nanoBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = nanoBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(nanoBot.chat.invaliduserspecified, {name: chat.un}));
                        var chats = $('.from');
                        for (var i = 0; i < chats.length; i++) {
                            var n = chats[i].textContent;
                            if (name.trim() === n.trim()) {
                                var cid = $(chats[i]).parent()[0].getAttribute('data-cid');
                                API.moderateDeleteChat(cid);
                            }
                        }
                        API.sendChat(subChat(nanoBot.chat.deletechat, {name: chat.un, username: name}));
                    }
                }
            },*/

            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(nanoBot.chat.emojilist, {link: link}));
                    }
                }
            },

            etaCommand: {
                command: 'eta',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var perm = nanoBot.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < 2) return void (0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = nanoBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(nanoBot.chat.invaliduserspecified, {name: chat.un}));
                        var pos = API.getWaitListPosition(user.id);
                        if (pos < 0) return API.sendChat(subChat(nanoBot.chat.notinwaitlist, {name: name}));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = nanoBot.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(nanoBot.chat.eta, {name: name, time: estimateString}));
                    }
                }
            },

            fbCommand: {
                command: 'fb',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof nanoBot.settings.fbLink === "string")
                            API.sendChat(subChat(nanoBot.chat.facebook, {link: nanoBot.settings.fbLink}));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (nanoBot.settings.filterChat) {
                            nanoBot.settings.filterChat = !nanoBot.settings.filterChat;
                            return API.sendChat(subChat(nanoBot.chat.toggleoff, {name: chat.un, 'function': nanoBot.chat.chatfilter}));
                        }
                        else {
                            nanoBot.settings.filterChat = !nanoBot.settings.filterChat;
                            return API.sendChat(subChat(nanoBot.chat.toggleon, {name: chat.un, 'function': nanoBot.chat.chatfilter}));
                        }
                    }
                }
            },

            helpCommand: {
                command: 'help',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = "http://i.imgur.com/SBAso1N.jpg";
                        API.sendChat(subChat(nanoBot.chat.starterhelp, {link: link}));
                    }
                }
            },

            joinCommand: {
                command: 'join',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (nanoBot.room.roulette.rouletteStatus && nanoBot.room.roulette.participants.indexOf(chat.uid) < 0) {
                            nanoBot.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(nanoBot.chat.roulettejoin, {name: chat.un}));
                        }
                    }
                }
            },

            jointimeCommand: {
                command: 'jointime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(nanoBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = nanoBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(nanoBot.chat.invaliduserspecified, {name: chat.un}));
                        var join = nanoBot.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = nanoBot.roomUtilities.msToStr(time);
                        API.sendChat(subChat(nanoBot.chat.jointime, {namefrom: chat.un, username: name, time: timeString}));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var time;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            time = 0.25;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }

                        var user = nanoBot.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(nanoBot.chat.nouserspecified, {name: chat.un}));

                        var permFrom = nanoBot.userUtilities.getPermission(chat.uid);
                        var permTokick = nanoBot.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(nanoBot.chat.kickrank, {name: chat.un}));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(nanoBot.chat.kick, {name: chat.un, username: name, time: time}));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function (id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        }
                        else API.sendChat(subChat(nanoBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            killCommand: {
                command: 'kill',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        API.sendChat(nanoBot.chat.kill);
                        nanoBot.disconnectAPI();
                        setTimeout(function () {
                            kill();
                        }, 1000);
                    }
                }
            },

            leaveCommand: {
                command: 'leave',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var ind = nanoBot.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            nanoBot.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(nanoBot.chat.rouletteleave, {name: chat.un}));
                        }
                    }
                }
            },

            linkCommand: {
                command: 'link',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = nanoBot.userUtilities.lookupUser(chat.uid);
                        var perm = nanoBot.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= 1 || isDj) {
                            if (media.format === 1) {
                                var linkToSong = "https://www.youtube.com/watch?v=" + media.cid;
                                API.sendChat(subChat(nanoBot.chat.songlink, {name: from, link: linkToSong}));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function (sound) {
                                    API.sendChat(subChat(nanoBot.chat.songlink, {name: from, link: sound.permalink_url}));
                                });
                            }
                        }
                    }
                }
            },

            lockCommand: {
                command: 'lock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        nanoBot.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = nanoBot.settings.lockdownEnabled;
                        nanoBot.settings.lockdownEnabled = !temp;
                        if (nanoBot.settings.lockdownEnabled) {
                            return API.sendChat(subChat(nanoBot.chat.toggleon, {name: chat.un, 'function': nanoBot.chat.lockdown}));
                        }
                        else return API.sendChat(subChat(nanoBot.chat.toggleoff, {name: chat.un, 'function': nanoBot.chat.lockdown}));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (nanoBot.settings.lockGuard) {
                            nanoBot.settings.lockGuard = !nanoBot.settings.lockGuard;
                            return API.sendChat(subChat(nanoBot.chat.toggleoff, {name: chat.un, 'function': nanoBot.chat.lockdown}));
                        }
                        else {
                            nanoBot.settings.lockGuard = !nanoBot.settings.lockGuard;
                            return API.sendChat(subChat(nanoBot.chat.toggleon, {name: chat.un, 'function': nanoBot.chat.lockguard}));
                        }
                    }
                }
            },

            lockskipCommand: {
                command: 'lockskip',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (nanoBot.room.skippable) {
                            var dj = API.getDJ();
                            var id = dj.id;
                            var name = dj.username;
                            var msgSend = '@' + name + ': ';
                            nanoBot.room.queueable = false;

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(nanoBot.chat.usedlockskip, {name: chat.un}));
                                nanoBot.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    nanoBot.room.skippable = false;
                                    setTimeout(function () {
                                        nanoBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        nanoBot.userUtilities.moveUser(id, nanoBot.settings.lockskipPosition, false);
                                        nanoBot.room.queueable = true;
                                        setTimeout(function () {
                                            nanoBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < nanoBot.settings.lockskipReasons.length; i++) {
                                var r = nanoBot.settings.lockskipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += nanoBot.settings.lockskipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(nanoBot.chat.usedlockskip, {name: chat.un}));
                                nanoBot.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    nanoBot.room.skippable = false;
                                    API.sendChat(msgSend);
                                    setTimeout(function () {
                                        nanoBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        nanoBot.userUtilities.moveUser(id, nanoBot.settings.lockskipPosition, false);
                                        nanoBot.room.queueable = true;
                                        setTimeout(function () {
                                            nanoBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                        }
                    }
                }
            },

            lockskipposCommand: {
                command: 'lockskippos',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            nanoBot.settings.lockskipPosition = pos;
                            return API.sendChat(subChat(nanoBot.chat.lockskippos, {name: chat.un, position: nanoBot.settings.lockskipPosition}));
                        }
                        else return API.sendChat(subChat(nanoBot.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== "") {
                            nanoBot.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(nanoBot.chat.lockguardtime, {name: chat.un, time: nanoBot.settings.maximumLocktime}));
                        }
                        else return API.sendChat(subChat(nanoBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            nanoBot.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(nanoBot.chat.maxlengthtime, {name: chat.un, time: nanoBot.settings.maximumSongLength}));
                        }
                        else return API.sendChat(subChat(nanoBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + nanoBot.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!nanoBot.settings.motdEnabled) nanoBot.settings.motdEnabled = !nanoBot.settings.motdEnabled;
                        if (isNaN(argument)) {
                            nanoBot.settings.motd = argument;
                            API.sendChat(subChat(nanoBot.chat.motdset, {msg: nanoBot.settings.motd}));
                        }
                        else {
                            nanoBot.settings.motdInterval = argument;
                            API.sendChat(subChat(nanoBot.chat.motdintervalset, {interval: nanoBot.settings.motdInterval}));
                        }
                    }
                }
            },

            moveCommand: {
                command: 'move',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(nanoBot.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var pos;
                        var name;
                        if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                            pos = 1;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            pos = parseInt(msg.substring(lastSpace + 1));
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var user = nanoBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(nanoBot.chat.invaliduserspecified, {name: chat.un}));
                        if (user.id === nanoBot.loggedInID) return API.sendChat(subChat(nanoBot.chat.addbotwaitlist, {name: chat.un}));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(nanoBot.chat.move, {name: chat.un}));
                            nanoBot.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(nanoBot.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            muteCommand: {
                command: 'mute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(nanoBot.chat.nouserspecified, {name: chat.un}));
                        var lastSpace = msg.lastIndexOf(' ');
                        var time = null;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            name = msg.substring(cmd.length + 2);
                            time = 45;
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            if (isNaN(time) || time == "" || time == null || typeof time == "undefined") {
                                return API.sendChat(subChat(nanoBot.chat.invalidtime, {name: chat.un}));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = nanoBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(nanoBot.chat.invaliduserspecified, {name: chat.un}));
                        var permFrom = nanoBot.userUtilities.getPermission(chat.uid);
                        var permUser = nanoBot.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {
                            /*
                             nanoBot.room.mutedUsers.push(user.id);
                             if (time === null) API.sendChat(subChat(nanoBot.chat.mutednotime, {name: chat.un, username: name}));
                             else {
                             API.sendChat(subChat(nanoBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                             setTimeout(function (id) {
                             var muted = nanoBot.room.mutedUsers;
                             var wasMuted = false;
                             var indexMuted = -1;
                             for (var i = 0; i < muted.length; i++) {
                             if (muted[i] === id) {
                             indexMuted = i;
                             wasMuted = true;
                             }
                             }
                             if (indexMuted > -1) {
                             nanoBot.room.mutedUsers.splice(indexMuted);
                             var u = nanoBot.userUtilities.lookupUser(id);
                             var name = u.username;
                             API.sendChat(subChat(nanoBot.chat.unmuted, {name: chat.un, username: name}));
                             }
                             }, time * 60 * 1000, user.id);
                             }
                             */
                            if (time > 45) {
                                API.sendChat(subChat(nanoBot.chat.mutedmaxtime, {name: chat.un, time: "45"}));
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                            }
                            else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(nanoBot.chat.mutedtime, {name: chat.un, username: name, time: time}));

                            }
                            else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(nanoBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(nanoBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(nanoBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                        }
                        else API.sendChat(subChat(nanoBot.chat.muterank, {name: chat.un}));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof nanoBot.settings.opLink === "string")
                            return API.sendChat(subChat(nanoBot.chat.oplist, {link: nanoBot.settings.opLink}));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(nanoBot.chat.pong)
                    }
                }
            },

            refreshCommand: {
                command: 'refresh',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        nanoBot.disconnectAPI();
                        setTimeout(function () {
                            window.location.reload(false);
                        }, 1000);

                    }
                }
            },

            reloadCommand: {
                command: 'reload',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(nanoBot.chat.reload);
                        storeToStorage();
                        nanoBot.disconnectAPI();
                        kill();
                        setTimeout(function () {
                            $.getScript(nanoBot.scriptLink);
                        }, 2000);
                    }
                }
            },

            removeCommand: {
                command: 'remove',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = nanoBot.userUtilities.lookupUserName(name);
                            if (typeof user !== 'boolean') {
                                user.lastDC = {
                                    time: null,
                                    position: null,
                                    songCount: 0
                                };
                                if (API.getDJ().id === user.id) {
                                    API.moderateForceSkip();
                                    setTimeout(function () {
                                        API.moderateRemoveDJ(user.id);
                                    }, 1 * 1000, user);
                                }
                                else API.moderateRemoveDJ(user.id);
                            } else API.sendChat(subChat(nanoBot.chat.removenotinwl, {name: chat.un, username: name}));
                        } else API.sendChat(subChat(nanoBot.chat.nouserspecified, {name: chat.un}));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (nanoBot.settings.etaRestriction) {
                            nanoBot.settings.etaRestriction = !nanoBot.settings.etaRestriction;
                            return API.sendChat(subChat(nanoBot.chat.toggleoff, {name: chat.un, 'function': nanoBot.chat.etarestriction}));
                        }
                        else {
                            nanoBot.settings.etaRestriction = !nanoBot.settings.etaRestriction;
                            return API.sendChat(subChat(nanoBot.chat.toggleon, {name: chat.un, 'function': nanoBot.chat.etarestriction}));
                        }
                    }
                }
            },

            rouletteCommand: {
                command: 'roulette',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (!nanoBot.room.roulette.rouletteStatus) {
                            nanoBot.room.roulette.startRoulette();
                        }
                    }
                }
            },

            rulesCommand: {
                command: 'rules',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof nanoBot.settings.rulesLink === "string")
                            return API.sendChat(subChat(nanoBot.chat.roomrules, {link: nanoBot.settings.rulesLink}));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var woots = nanoBot.room.roomstats.totalWoots;
                        var mehs = nanoBot.room.roomstats.totalMehs;
                        var grabs = nanoBot.room.roomstats.totalCurates;
                        API.sendChat(subChat(nanoBot.chat.sessionstats, {name: from, woots: woots, mehs: mehs, grabs: grabs}));
                    }
                }
            },

            skipCommand: {
                command: 'skip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(nanoBot.chat.skip, {name: chat.un}));
                        API.moderateForceSkip();
                        nanoBot.room.skippable = false;
                        setTimeout(function () {
                            nanoBot.room.skippable = true
                        }, 5 * 1000);

                    }
                }
            },

            songstatsCommand: {
                command: 'songstats',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (nanoBot.settings.songstats) {
                            nanoBot.settings.songstats = !nanoBot.settings.songstats;
                            return API.sendChat(subChat(nanoBot.chat.toggleoff, {name: chat.un, 'function': nanoBot.chat.songstats}));
                        }
                        else {
                            nanoBot.settings.songstats = !nanoBot.settings.songstats;
                            return API.sendChat(subChat(nanoBot.chat.toggleon, {name: chat.un, 'function': nanoBot.chat.songstats}));
                        }
                    }
                }
            },

            sourceCommand: {
                command: 'source',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat('/me This bot was created by ' + botCreator + ', but is now maintained by ' + botMaintainer + ".");
                    }
                }
            },

            statusCommand: {
                command: 'status',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var msg = '/me [@' + from + '] ';

                        msg += nanoBot.chat.afkremoval + ': ';
                        if (nanoBot.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += nanoBot.chat.afksremoved + ": " + nanoBot.room.afkList.length + '. ';
                        msg += nanoBot.chat.afklimit + ': ' + nanoBot.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (nanoBot.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
												
                        msg += nanoBot.chat.blacklist + ': ';
                        if (nanoBot.settings.blacklistEnabled) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += nanoBot.chat.lockguard + ': ';
                        if (nanoBot.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += nanoBot.chat.cycleguard + ': ';
                        if (nanoBot.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += nanoBot.chat.timeguard + ': ';
                        if (nanoBot.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += nanoBot.chat.chatfilter + ': ';
                        if (nanoBot.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += nanoBot.chat.voteskip + ': ';
                        if (nanoBot.settings.voteskip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        var launchT = nanoBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = nanoBot.roomUtilities.msToStr(durationOnline);
                        msg += subChat(nanoBot.chat.activefor, {time: since});

                        return API.sendChat(msg);
                    }
                }
            },

            swapCommand: {
                command: 'swap',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(nanoBot.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.substring(cmd.length + 2, lastSpace);
                        var name2 = msg.substring(lastSpace + 2);
                        var user1 = nanoBot.userUtilities.lookupUserName(name1);
                        var user2 = nanoBot.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(nanoBot.chat.swapinvalid, {name: chat.un}));
                        if (user1.id === nanoBot.loggedInID || user2.id === nanoBot.loggedInID) return API.sendChat(subChat(nanoBot.chat.addbottowaitlist, {name: chat.un}));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 || p2 < 0) return API.sendChat(subChat(nanoBot.chat.swapwlonly, {name: chat.un}));
                        API.sendChat(subChat(nanoBot.chat.swapping, {'name1': name1, 'name2': name2}));
                        if (p1 < p2) {
                            nanoBot.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function (user1, p2) {
                                nanoBot.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        }
                        else {
                            nanoBot.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function (user2, p1) {
                                nanoBot.userUtilities.moveUser(user2.id, p1, false);
                            }, 2000, user2, p1);
                        }
                    }
                }
            },

            themeCommand: {
                command: 'theme',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof nanoBot.settings.themeLink === "string")
                            API.sendChat(subChat(nanoBot.chat.genres, {link: nanoBot.settings.themeLink}));
                    }
                }
            },

            timeguardCommand: {
                command: 'timeguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (nanoBot.settings.timeGuard) {
                            nanoBot.settings.timeGuard = !nanoBot.settings.timeGuard;
                            return API.sendChat(subChat(nanoBot.chat.toggleoff, {name: chat.un, 'function': nanoBot.chat.timeguard}));
                        }
                        else {
                            nanoBot.settings.timeGuard = !nanoBot.settings.timeGuard;
                            return API.sendChat(subChat(nanoBot.chat.toggleon, {name: chat.un, 'function': nanoBot.chat.timeguard}));
                        }

                    }
                }
            },

            toggleblCommand: {
                command: 'togglebl',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = nanoBot.settings.blacklistEnabled;
                        nanoBot.settings.blacklistEnabled = !temp;
                        if (nanoBot.settings.blacklistEnabled) {
                          return API.sendChat(subChat(nanoBot.chat.toggleon, {name: chat.un, 'function': nanoBot.chat.blacklist}));
                        }
                        else return API.sendChat(subChat(nanoBot.chat.toggleoff, {name: chat.un, 'function': nanoBot.chat.blacklist}));
                    }
                }
            },
						
            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (nanoBot.settings.motdEnabled) {
                            nanoBot.settings.motdEnabled = !nanoBot.settings.motdEnabled;
                            API.sendChat(subChat(nanoBot.chat.toggleoff, {name: chat.un, 'function': nanoBot.chat.motd}));
                        }
                        else {
                            nanoBot.settings.motdEnabled = !nanoBot.settings.motdEnabled;
                            API.sendChat(subChat(nanoBot.chat.toggleon, {name: chat.un, 'function': nanoBot.chat.motd}));
                        }
                    }
                }
            },

            unbanCommand: {
                command: 'unban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        $(".icon-population").click();
                        $(".icon-ban").click();
                        setTimeout(function (chat) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return API.sendChat();
                            var name = msg.substring(cmd.length + 2);
                            var bannedUsers = API.getBannedUsers();
                            var found = false;
                            var bannedUser = null;
                            for (var i = 0; i < bannedUsers.length; i++) {
                                var user = bannedUsers[i];
                                if (user.username === name) {
                                    bannedUser = user;
                                    found = true;
                                }
                            }
                            if (!found) {
                                $(".icon-chat").click();
                                return API.sendChat(subChat(nanoBot.chat.notbanned, {name: chat.un}));
                            }
                            API.moderateUnbanUser(bannedUser.id);
                            console.log("Unbanned " + name);
                            setTimeout(function () {
                                $(".icon-chat").click();
                            }, 1000);
                        }, 1000, chat);
                    }
                }
            },

            unlockCommand: {
                command: 'unlock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        nanoBot.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            unmuteCommand: {
                command: 'unmute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var permFrom = nanoBot.userUtilities.getPermission(chat.uid);
                        /**
                         if (msg.indexOf('@') === -1 && msg.indexOf('all') !== -1) {
                            if (permFrom > 2) {
                                nanoBot.room.mutedUsers = [];
                                return API.sendChat(subChat(nanoBot.chat.unmutedeveryone, {name: chat.un}));
                            }
                            else return API.sendChat(subChat(nanoBot.chat.unmuteeveryonerank, {name: chat.un}));
                        }
                         **/
                        var from = chat.un;
                        var name = msg.substr(cmd.length + 2);

                        var user = nanoBot.userUtilities.lookupUserName(name);

                        if (typeof user === 'boolean') return API.sendChat(subChat(nanoBot.chat.invaliduserspecified, {name: chat.un}));

                        var permUser = nanoBot.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {
                            /*
                             var muted = nanoBot.room.mutedUsers;
                             var wasMuted = false;
                             var indexMuted = -1;
                             for (var i = 0; i < muted.length; i++) {
                             if (muted[i] === user.id) {
                             indexMuted = i;
                             wasMuted = true;
                             }

                             }
                             if (!wasMuted) return API.sendChat(subChat(nanoBot.chat.notmuted, {name: chat.un}));
                             nanoBot.room.mutedUsers.splice(indexMuted);
                             API.sendChat(subChat(nanoBot.chat.unmuted, {name: chat.un, username: name}));
                             */
                            try {
                                API.moderateUnmuteUser(user.id);
                                API.sendChat(subChat(nanoBot.chat.unmuted, {name: chat.un, username: name}));
                            }
                            catch (e) {
                                API.sendChat(subChat(nanoBot.chat.notmuted, {name: chat.un}));
                            }
                        }
                        else API.sendChat(subChat(nanoBot.chat.unmuterank, {name: chat.un}));
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            nanoBot.settings.commandCooldown = cd;
                            return API.sendChat(subChat(nanoBot.chat.commandscd, {name: chat.un, time: nanoBot.settings.commandCooldown}));
                        }
                        else return API.sendChat(subChat(nanoBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (nanoBot.settings.usercommandsEnabled) {
                            API.sendChat(subChat(nanoBot.chat.toggleoff, {name: chat.un, 'function': nanoBot.chat.usercommands}));
                            nanoBot.settings.usercommandsEnabled = !nanoBot.settings.usercommandsEnabled;
                        }
                        else {
                            API.sendChat(subChat(nanoBot.chat.toggleon, {name: chat.un, 'function': nanoBot.chat.usercommands}));
                            nanoBot.settings.usercommandsEnabled = !nanoBot.settings.usercommandsEnabled;
                        }
                    }
                }
            },

            voteratioCommand: {
                command: 'voteratio',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(nanoBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = nanoBot.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(nanoBot.chat.invaliduserspecified, {name: chat.un}));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(nanoBot.chat.voteratio, {name: chat.un, username: name, woot: vratio.woot, mehs: vratio.meh, ratio: ratio.toFixed(2)}));
                    }
                }
            },

            welcomeCommand: {
                command: 'welcome',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (nanoBot.settings.welcome) {
                            nanoBot.settings.welcome = !nanoBot.settings.welcome;
                            return API.sendChat(subChat(nanoBot.chat.toggleoff, {name: chat.un, 'function': nanoBot.chat.welcomemsg}));
                        }
                        else {
                            nanoBot.settings.welcome = !nanoBot.settings.welcome;
                            return API.sendChat(subChat(nanoBot.chat.toggleon, {name: chat.un, 'function': nanoBot.chat.welcomemsg}));
                        }
                    }
                }
            },

            websiteCommand: {
                command: 'website',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof nanoBot.settings.website === "string")
                            API.sendChat(subChat(nanoBot.chat.website, {link: nanoBot.settings.website}));
                    }
                }
            },

            youtubeCommand: {
                command: 'youtube',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!nanoBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof nanoBot.settings.youtubeLink === "string")
                            API.sendChat(subChat(nanoBot.chat.youtube, {name: chat.un, link: nanoBot.settings.youtubeLink}));
                    }
                }
            }
        }
    };

    loadChat(nanoBot.startup);
}).call(this);
