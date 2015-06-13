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
        clearInterval(mammyBot.room.autodisableInterval);
        clearInterval(mammyBot.room.afkInterval);
        mammyBot.status = false;
    };

    var storeToStorage = function () {
        localStorage.setItem("mammyBotsettings", JSON.stringify(mammyBot.settings));
        localStorage.setItem("mammyBotRoom", JSON.stringify(mammyBot.room));
        var mammyBotStorageInfo = {
            time: Date.now(),
            stored: true,
            version: mammyBot.version
        };
        localStorage.setItem("mammyBotStorageInfo", JSON.stringify(mammyBotStorageInfo));

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
        $.get("https://rawgit.com/penash42/MammyBot/master/lang/langIndex.json", function (json) {
            var link = mammyBot.chatLink;
            if (json !== null && typeof json !== "undefined") {
                langIndex = json;
                link = langIndex[mammyBot.settings.language.toLowerCase()];
                if (mammyBot.settings.chatLink !== mammyBot.chatLink) {
                    link = mammyBot.settings.chatLink;
                }
                else {
                    if (typeof link === "undefined") {
                        link = mammyBot.chatLink;
                    }
                }
                $.get(link, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        mammyBot.chat = json;
                        cb();
                    }
                });
            }
            else {
                $.get(mammyBot.chatLink, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        mammyBot.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function () {
        var settings = JSON.parse(localStorage.getItem("mammyBotsettings"));
        if (settings !== null) {
            for (var prop in settings) {
                mammyBot.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function () {
        var info = localStorage.getItem("mammyBotStorageInfo");
        if (info === null) API.chatLog(mammyBot.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem("mammyBotsettings"));
            var room = JSON.parse(localStorage.getItem("mammyBotRoom"));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(mammyBot.chat.retrievingdata);
                for (var prop in settings) {
                    mammyBot.settings[prop] = settings[prop];
                }
                mammyBot.room.users = room.users;
                mammyBot.room.afkList = room.afkList;
                mammyBot.room.historyList = room.historyList;
                mammyBot.room.mutedUsers = room.mutedUsers;
                mammyBot.room.autoskip = room.autoskip;
                mammyBot.room.roomstats = room.roomstats;
                mammyBot.room.messages = room.messages;
                mammyBot.room.queue = room.queue;
                mammyBot.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(mammyBot.chat.datarestored);
            }
        }
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

    var mammyBot = {
        version: "1.0.0",
        status: false,
        name: "MammyBot",
        loggedInID: null,
        scriptLink: "https://rawgit.com/penash42/MammyBot/master/mammyBot.js",
        cmdLink: "http://git.io/245Ppg",
        chatLink: "https://rawgit.com/penash42/MammyBot/master/lang/en.json",
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: "MammyBot",
            language: "english",
            chatLink: "https://rawgit.com/penash42/MammyBot/master/lang/en.json",
            startupCap: 1, // 1-200
            startupVolume: 0, // 0-100
            startupEmoji: false, // true or false
            maximumAfk: 90,
            afkRemoval: true,
            maximumDc: 60,
            bouncerPlus: true,
            blacklistEnabled: true,
            lockdownEnabled: false,
            lockGuard: false,
            maximumLocktime: 10,
            cycleGuard: true,
            maximumCycletime: 10,
            voteSkip: true,
            voteSkipLimit: 5,
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
            motdEnabled: true,
            motdInterval: 5,
            motd: "Temporary Message of the Day",
            filterChat: true,
            etaRestriction: false,
            welcome: true,
            opLink: null,
            rulesLink: null,
            themeLink: null,
            fbLink: "https://www.facebook.com/groups/531168806910189/",
            youtubeLink: null,
            website: "http://www.ghgaming.net",
            intervalMessages: [],
            messageInterval: 5,
            songstats: true,
            commandLiteral: "!",
            blacklists: {
                NSFW: "https://rawgit.com/penash42/MammyBot-customization/master/blacklists/ExampleNSFWlist.json",
                OP: "https://rawgit.com/penash42/MammyBot-customization/master/blacklists/ExampleOPlist.json"
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
                if (mammyBot.status && mammyBot.settings.autodisable) {
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
                    mammyBot.room.roulette.rouletteStatus = true;
                    mammyBot.room.roulette.countdown = setTimeout(function () {
                        mammyBot.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(mammyBot.chat.isopen);
                },
                endRoulette: function () {
                    mammyBot.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * mammyBot.room.roulette.participants.length);
                    var winner = mammyBot.room.roulette.participants[ind];
                    mammyBot.room.roulette.participants = [];
                    var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = mammyBot.userUtilities.lookupUser(winner);
                    var name = user.username;
                    API.sendChat(subChat(mammyBot.chat.winnerpicked, {name: name, position: pos}));
                    setTimeout(function (winner, pos) {
                        mammyBot.userUtilities.moveUser(winner, pos, false);
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
                user.lastDC.songCount = mammyBot.room.roomstats.songCount;
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
                for (var i = 0; i < mammyBot.room.users.length; i++) {
                    if (mammyBot.room.users[i].id === id) {
                        return mammyBot.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function (name) {
                for (var i = 0; i < mammyBot.room.users.length; i++) {
                    var match = mammyBot.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return mammyBot.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function (id) {
                var user = mammyBot.userUtilities.lookupUser(id);
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
                var user = mammyBot.userUtilities.lookupUser(id);
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
                        for (var i = 0; i < mammyBot.room.queue.id.length; i++) {
                            if (mammyBot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            mammyBot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(mammyBot.chat.alreadyadding, {position: mammyBot.room.queue.position[alreadyQueued]}));
                        }
                        mammyBot.roomUtilities.booth.lockBooth();
                        if (priority) {
                            mammyBot.room.queue.id.unshift(id);
                            mammyBot.room.queue.position.unshift(pos);
                        }
                        else {
                            mammyBot.room.queue.id.push(id);
                            mammyBot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(mammyBot.chat.adding, {name: name, position: mammyBot.room.queue.position.length}));
                    }
                }
                else API.moderateMoveDJ(id, pos);
            },
            dclookup: function (id) {
                var user = mammyBot.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return mammyBot.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(mammyBot.chat.notdisconnected, {name: name});
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return mammyBot.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (mammyBot.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = mammyBot.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(mammyBot.chat.toolongago, {name: mammyBot.userUtilities.getUser(user).username, time: time}));
                var songsPassed = mammyBot.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = mammyBot.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) newPosition = 1;
                var msg = subChat(mammyBot.chat.valid, {name: mammyBot.userUtilities.getUser(user).username, time: time, position: newPosition});
                mammyBot.userUtilities.moveUser(user.id, newPosition, true);
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
                    API.moderateLockWaitList(!mammyBot.roomUtilities.booth.locked);
                    mammyBot.roomUtilities.booth.locked = false;
                    if (mammyBot.settings.lockGuard) {
                        mammyBot.roomUtilities.booth.lockTimer = setTimeout(function () {
                            API.moderateLockWaitList(mammyBot.roomUtilities.booth.locked);
                        }, mammyBot.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function () {
                    API.moderateLockWaitList(mammyBot.roomUtilities.booth.locked);
                    clearTimeout(mammyBot.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function () {
                if (!mammyBot.status || !mammyBot.settings.afkRemoval) return void (0);
                var rank = mammyBot.roomUtilities.rankToNumber(mammyBot.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, mammyBot.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void (0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = mammyBot.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = mammyBot.userUtilities.getUser(user);
                            if (rank !== null && mammyBot.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = mammyBot.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = mammyBot.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > mammyBot.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(mammyBot.chat.warning1, {name: name, time: time}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    }
                                    else if (warncount === 1) {
                                        API.sendChat(subChat(mammyBot.chat.warning2, {name: name}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    }
                                    else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            mammyBot.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(mammyBot.chat.afkremove, {name: name, time: time, position: pos, maximumafk: mammyBot.settings.maximumAfk}));
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
                    if (mammyBot.settings.cycleGuard) {
                        mammyBot.room.cycleTimer = setTimeout(function () {
                            if (toggle.hasClass("enabled")) toggle.click();
                        }, mammyBot.settings.cycleMaxTime * 60 * 1000);
                    }
                }
                else {
                    toggle.click();
                    clearTimeout(mammyBot.room.cycleTimer);
                }
            },
            intervalMessage: function () {
                var interval;
                if (mammyBot.settings.motdEnabled) interval = mammyBot.settings.motdInterval;
                else interval = mammyBot.settings.messageInterval;
                if ((mammyBot.room.roomstats.songCount % interval) === 0 && mammyBot.status) {
                    var msg;
                    if (mammyBot.settings.motdEnabled) {
                        msg = mammyBot.settings.motd;
                    }
                    else {
                        if (mammyBot.settings.intervalMessages.length === 0) return void (0);
                        var messageNumber = mammyBot.room.roomstats.songCount % mammyBot.settings.intervalMessages.length;
                        msg = mammyBot.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function () {
                for (var bl in mammyBot.settings.blacklists) {
                    mammyBot.room.blacklists[bl] = [];
                    if (typeof mammyBot.settings.blacklists[bl] === 'function') {
                        mammyBot.room.blacklists[bl] = mammyBot.settings.blacklists();
                    }
                    else if (typeof mammyBot.settings.blacklists[bl] === 'string') {
                        if (mammyBot.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function (l) {
                                $.get(mammyBot.settings.blacklists[l], function (data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    mammyBot.room.blacklists[l] = list;
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
                    console.table(mammyBot.room.newBlacklisted);
                }
                else {
                    console.log(mammyBot.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function () {
                var list = {};
                for (var i = 0; i < mammyBot.room.newBlacklisted.length; i++) {
                    var track = mammyBot.room.newBlacklisted[i];
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
            for (var i = 0; i < mammyBot.room.users.length; i++) {
                if (mammyBot.room.users[i].id === chat.uid) {
                    mammyBot.userUtilities.setLastActivity(mammyBot.room.users[i]);
                    if (mammyBot.room.users[i].username !== chat.un) {
                        mammyBot.room.users[i].username = chat.un;
                    }
                }
            }
            if (mammyBot.chatUtilities.chatFilter(chat)) return void (0);
            if (!mammyBot.chatUtilities.commandCheck(chat))
                mammyBot.chatUtilities.action(chat);
        },
        eventUserjoin: function (user) {
            var known = false;
            var index = null;
            for (var i = 0; i < mammyBot.room.users.length; i++) {
                if (mammyBot.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            var greet = true;
            var welcomeback = null;
            if (known) {
                mammyBot.room.users[index].inRoom = true;
                var u = mammyBot.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            }
            else {
                mammyBot.room.users.push(new mammyBot.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < mammyBot.room.users.length; j++) {
                if (mammyBot.userUtilities.getUser(mammyBot.room.users[j]).id === user.id) {
                    mammyBot.userUtilities.setLastActivity(mammyBot.room.users[j]);
                    mammyBot.room.users[j].jointime = Date.now();
                }

            }
            if (mammyBot.settings.welcome && greet) {
                welcomeback ?
                    setTimeout(function (user) {
                        API.sendChat(subChat(mammyBot.chat.welcomeback, {name: user.username}));
                    }, 1 * 1000, user)
                    :
                    setTimeout(function (user) {
                        API.sendChat(subChat(mammyBot.chat.welcome, {name: user.username}));
                    }, 1 * 1000, user);
            }
        },
        eventUserleave: function (user) {
            for (var i = 0; i < mammyBot.room.users.length; i++) {
                if (mammyBot.room.users[i].id === user.id) {
                    mammyBot.userUtilities.updateDC(mammyBot.room.users[i]);
                    mammyBot.room.users[i].inRoom = false;
                }
            }
        },
        eventVoteupdate: function (obj) {
            for (var i = 0; i < mammyBot.room.users.length; i++) {
                if (mammyBot.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        mammyBot.room.users[i].votes.woot++;
                    }
                    else {
                        mammyBot.room.users[i].votes.meh++;
                    }
                }
            }

            var mehs = API.getScore().negative;
            var woots = API.getScore().positive;
            var dj = API.getDJ();

            if (mammyBot.settings.voteSkip) {
                if ((mehs - woots) >= (mammyBot.settings.voteSkipLimit)) {
                    API.sendChat(subChat(mammyBot.chat.voteskipexceededlimit, {name: dj.username, limit: mammyBot.settings.voteSkipLimit}));
                    API.moderateForceSkip();
                }
            }

        },
        eventCurateupdate: function (obj) {
            for (var i = 0; i < mammyBot.room.users.length; i++) {
                if (mammyBot.room.users[i].id === obj.user.id) {
                    mammyBot.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function (obj) {
            $("#woot").click();
            var user = mammyBot.userUtilities.lookupUser(obj.dj.id)
            for(var i = 0; i < mammyBot.room.users.length; i++){
                if(mammyBot.room.users[i].id === user.id){
                    mammyBot.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }

            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (mammyBot.settings.songstats) {
                if (typeof mammyBot.chat.songstatistics === "undefined") {
                    API.sendChat("/me " + lastplay.media.author + " - " + lastplay.media.title + ": " + lastplay.score.positive + "W/" + lastplay.score.grabs + "G/" + lastplay.score.negative + "M.")
                }
                else {
                    API.sendChat(subChat(mammyBot.chat.songstatistics, {artist: lastplay.media.author, title: lastplay.media.title, woots: lastplay.score.positive, grabs: lastplay.score.grabs, mehs: lastplay.score.negative}))
                }
            }
            mammyBot.room.roomstats.totalWoots += lastplay.score.positive;
            mammyBot.room.roomstats.totalMehs += lastplay.score.negative;
            mammyBot.room.roomstats.totalCurates += lastplay.score.grabs;
            mammyBot.room.roomstats.songCount++;
            mammyBot.roomUtilities.intervalMessage();
            mammyBot.room.currentDJID = obj.dj.id;

            var mid = obj.media.format + ':' + obj.media.cid;
            for (var bl in mammyBot.room.blacklists) {
                if (mammyBot.settings.blacklistEnabled) {
                    if (mammyBot.room.blacklists[bl].indexOf(mid) > -1) {
                        API.sendChat(subChat(mammyBot.chat.isblacklisted, {blacklist: bl}));
                        return API.moderateForceSkip();
                    }
                }
            }

            var alreadyPlayed = false;
            for (var i = 0; i < mammyBot.room.historyList.length; i++) {
                if (mammyBot.room.historyList[i][0] === obj.media.cid) {
                    var firstPlayed = mammyBot.room.historyList[i][1];
                    var plays = mammyBot.room.historyList[i].length - 1;
                    var lastPlayed = mammyBot.room.historyList[i][plays];
                    API.sendChat(subChat(mammyBot.chat.songknown, {plays: plays, timetotal: mammyBot.roomUtilities.msToStr(Date.now() - firstPlayed), lasttime: mammyBot.roomUtilities.msToStr(Date.now() - lastPlayed)}));
                    mammyBot.room.historyList[i].push(+new Date());
                    alreadyPlayed = true;
                }
            }
            if (!alreadyPlayed) {
                mammyBot.room.historyList.push([obj.media.cid, +new Date()]);
            }
            var newMedia = obj.media;
            if (mammyBot.settings.timeGuard && newMedia.duration > mammyBot.settings.maximumSongLength * 60 && !mammyBot.room.roomevent) {
                var name = obj.dj.username;
                API.sendChat(subChat(mammyBot.chat.timelimit, {name: name, maxlength: mammyBot.settings.maximumSongLength}));
                API.moderateForceSkip();
            }
            if (user.ownSong) {
                API.sendChat(subChat(mammyBot.chat.permissionownsong, {name: user.username}));
                user.ownSong = false;
            }
            clearTimeout(mammyBot.room.autoskipTimer);
            if (mammyBot.room.autoskip) {
                var remaining = obj.media.duration * 1000;
                mammyBot.room.autoskipTimer = setTimeout(function () {
                    console.log("Skipping track.");
                    //API.sendChat('Song stuck, skipping...');
                    API.moderateForceSkip();
                }, remaining + 3000);
            }
            storeToStorage();

        },
        eventWaitlistupdate: function (users) {
            if (users.length < 50) {
                if (mammyBot.room.queue.id.length > 0 && mammyBot.room.queueable) {
                    mammyBot.room.queueable = false;
                    setTimeout(function () {
                        mammyBot.room.queueable = true;
                    }, 500);
                    mammyBot.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function () {
                            id = mammyBot.room.queue.id.splice(0, 1)[0];
                            pos = mammyBot.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function (id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    mammyBot.room.queueing--;
                                    if (mammyBot.room.queue.id.length === 0) setTimeout(function () {
                                        mammyBot.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + mammyBot.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = mammyBot.userUtilities.lookupUser(users[i].id);
                mammyBot.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function (chat) {
            if (!mammyBot.settings.filterChat) return false;
            if (mammyBot.userUtilities.getPermission(chat.uid) > 1) return false;
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
                API.sendChat(subChat(mammyBot.chat.caps, {name: chat.un}));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(mammyBot.chat.askskip, {name: chat.un}));
                return true;
            }
            for (var j = 0; j < mammyBot.chatUtilities.spam.length; j++) {
                if (msg === mammyBot.chatUtilities.spam[j]) {
                    API.sendChat(subChat(mammyBot.chat.spam, {name: chat.un}));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function (chat) {
                var msg = chat.message;
                var perm = mammyBot.userUtilities.getPermission(chat.uid);
                var user = mammyBot.userUtilities.lookupUser(chat.uid);
                var isMuted = false;
                for (var i = 0; i < mammyBot.room.mutedUsers.length; i++) {
                    if (mammyBot.room.mutedUsers[i] === chat.uid) isMuted = true;
                }
                if (isMuted) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (mammyBot.settings.lockdownEnabled) {
                    if (perm === 0) {
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                if (mammyBot.chatcleaner(chat)) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                /**
                 var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                 if (plugRoomLinkPatt.exec(msg)) {
                    if (perm === 0) {
                        API.sendChat(subChat(mammyBot.chat.roomadvertising, {name: chat.un}));
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                 **/
                if (msg.indexOf('http://adf.ly/') > -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.sendChat(subChat(mammyBot.chat.adfly, {name: chat.un}));
                    return true;
                }
                if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }

                var rlJoinChat = mammyBot.chat.roulettejoin;
                var rlLeaveChat = mammyBot.chat.rouletteleave;

                var joinedroulette = rlJoinChat.split('%%NAME%%');
                if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                else joinedroulette = joinedroulette[0];

                var leftroulette = rlLeaveChat.split('%%NAME%%');
                if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                else leftroulette = leftroulette[0];

                if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === mammyBot.loggedInID) {
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
                var userPerm = mammyBot.userUtilities.getPermission(chat.uid);
                //console.log("name: " + chat.un + ", perm: " + userPerm);
                if (chat.message !== "!join" && chat.message !== "!leave") {
                    if (userPerm === 0 && !mammyBot.room.usercommand) return void (0);
                    if (!mammyBot.room.allcommand) return void (0);
                }
                if (chat.message === '!eta' && mammyBot.settings.etaRestriction) {
                    if (userPerm < 2) {
                        var u = mammyBot.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            return void (0);
                        }
                        else u.lastEta = Date.now();
                    }
                }
                var executed = false;

                for (var comm in mammyBot.commands) {
                    var cmdCall = mammyBot.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (mammyBot.settings.commandLiteral + cmdCall[i] === cmd) {
                            mammyBot.commands[comm].functionality(chat, mammyBot.settings.commandLiteral + cmdCall[i]);
                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === 0) {
                    mammyBot.room.usercommand = false;
                    setTimeout(function () {
                        mammyBot.room.usercommand = true;
                    }, mammyBot.settings.commandCooldown * 1000);
                }
                if (executed) {
                    API.moderateDeleteChat(chat.cid);
                    mammyBot.room.allcommand = false;
                    setTimeout(function () {
                        mammyBot.room.allcommand = true;
                    }, 5 * 1000);
                }
                return executed;
            },
            action: function (chat) {
                var user = mammyBot.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < mammyBot.room.users.length; j++) {
                        if (mammyBot.userUtilities.getUser(mammyBot.room.users[j]).id === chat.uid) {
                            mammyBot.userUtilities.setLastActivity(mammyBot.room.users[j]);
                        }

                    }
                }
                mammyBot.room.roomstats.chatmessages++;
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
            if (mammyBot.userUtilities.getPermission(u) < 2) return API.chatLog(mammyBot.chat.greyuser);
            if (mammyBot.userUtilities.getPermission(u) === 2) API.chatLog(mammyBot.chat.bouncer);
            mammyBot.connectAPI();
            API.moderateDeleteChat = function (cid) {
                $.ajax({
                    url: "https://plug.dj/_/chat/" + cid,
                    type: "DELETE"
                })
            };
            retrieveSettings();
            retrieveFromStorage();
            window.bot = mammyBot;
            mammyBot.roomUtilities.updateBlacklists();
            setInterval(mammyBot.roomUtilities.updateBlacklists, 60 * 60 * 1000);
            mammyBot.getNewBlacklistedSongs = mammyBot.roomUtilities.exportNewBlacklistedSongs;
            mammyBot.logNewBlacklistedSongs = mammyBot.roomUtilities.logNewBlacklistedSongs;
            if (mammyBot.room.roomstats.launchTime === null) {
                mammyBot.room.roomstats.launchTime = Date.now();
            }

            for (var j = 0; j < mammyBot.room.users.length; j++) {
                mammyBot.room.users[j].inRoom = false;
            }
            var userlist = API.getUsers();
            for (var i = 0; i < userlist.length; i++) {
                var known = false;
                var ind = null;
                for (var j = 0; j < mammyBot.room.users.length; j++) {
                    if (mammyBot.room.users[j].id === userlist[i].id) {
                        known = true;
                        ind = j;
                    }
                }
                if (known) {
                    mammyBot.room.users[ind].inRoom = true;
                }
                else {
                    mammyBot.room.users.push(new mammyBot.User(userlist[i].id, userlist[i].username));
                    ind = mammyBot.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(mammyBot.room.users[ind].id) + 1;
                mammyBot.userUtilities.updatePosition(mammyBot.room.users[ind], wlIndex);
            }
            mammyBot.room.afkInterval = setInterval(function () {
                mammyBot.roomUtilities.afkCheck()
            }, 10 * 1000);
            mammyBot.room.autodisableInterval = setInterval(function () {
                mammyBot.room.autodisableFunc();
            }, 60 * 60 * 1000);
            mammyBot.loggedInID = API.getUser().id;
            mammyBot.status = true;
            API.sendChat('/cap ' + mammyBot.settings.startupCap);
            API.setVolume(mammyBot.settings.startupVolume);
            $("#woot").click();
            if (mammyBot.settings.startupEmoji) {
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
            API.chatLog('Avatars capped at ' + mammyBot.settings.startupCap);
            API.chatLog('Volume set to ' + mammyBot.settings.startupVolume);
            loadChat(API.sendChat(subChat(mammyBot.chat.online, {botname: mammyBot.settings.botName, version: mammyBot.version})));
        },
        commands: {
            executable: function (minRank, chat) {
                var id = chat.uid;
                var perm = mammyBot.userUtilities.getPermission(id);
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
                        if (mammyBot.settings.bouncerPlus) {
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
                                if( !mammyBot.commands.executable(this.rank, chat) ) return void (0);
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;
                        if (msg.length === cmd.length) time = 60;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(mammyBot.chat.invalidtime, {name: chat.un}));
                        }
                        for (var i = 0; i < mammyBot.room.users.length; i++) {
                            userTime = mammyBot.userUtilities.getLastActivity(mammyBot.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(mammyBot.chat.activeusersintime, {name: chat.un, amount: chatters, time: time}));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(mammyBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = mammyBot.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (mammyBot.room.roomevent) {
                                    mammyBot.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(mammyBot.chat.invaliduserspecified, {name: chat.un}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(mammyBot.chat.nolimitspecified, {name: chat.un}));
                        var limit = msg.substring(cmd.length + 1);
                        if (!isNaN(limit)) {
                            mammyBot.settings.maximumAfk = parseInt(limit, 10);
                            API.sendChat(subChat(mammyBot.chat.maximumafktimeset, {name: chat.un, time: mammyBot.settings.maximumAfk}));
                        }
                        else API.sendChat(subChat(mammyBot.chat.invalidlimitspecified, {name: chat.un}));
                    }
                }
            },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (mammyBot.settings.afkRemoval) {
                            mammyBot.settings.afkRemoval = !mammyBot.settings.afkRemoval;
                            clearInterval(mammyBot.room.afkInterval);
                            API.sendChat(subChat(mammyBot.chat.toggleoff, {name: chat.un, 'function': mammyBot.chat.afkremoval}));
                        }
                        else {
                            mammyBot.settings.afkRemoval = !mammyBot.settings.afkRemoval;
                            mammyBot.room.afkInterval = setInterval(function () {
                                mammyBot.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(mammyBot.chat.toggleon, {name: chat.un, 'function': mammyBot.chat.afkremoval}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(mammyBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = mammyBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(mammyBot.chat.invaliduserspecified, {name: chat.un}));
                        mammyBot.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(mammyBot.chat.afkstatusreset, {name: chat.un, username: name}));
                    }
                }
            },

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(mammyBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = mammyBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(mammyBot.chat.invaliduserspecified, {name: chat.un}));
                        var lastActive = mammyBot.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = mammyBot.roomUtilities.msToStr(inactivity);
                        API.sendChat(subChat(mammyBot.chat.inactivefor, {name: chat.un, username: name, time: time}));
                    }
                }
            },

            autodisableCommand: {
                command: 'autodisable',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (mammyBot.settings.autodisable) {
                            mammyBot.settings.autodisable = !mammyBot.settings.autodisable;
                            return API.sendChat(subChat(mammyBot.chat.toggleoff, {name: chat.un, 'function': mammyBot.chat.autodisable}));
                        }
                        else {
                            mammyBot.settings.autodisable = !mammyBot.settings.autodisable;
                            return API.sendChat(subChat(mammyBot.chat.toggleon, {name: chat.un, 'function': mammyBot.chat.autodisable}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (mammyBot.room.autoskip) {
                            mammyBot.room.autoskip = !mammyBot.room.autoskip;
                            clearTimeout(mammyBot.room.autoskipTimer);
                            return API.sendChat(subChat(mammyBot.chat.toggleoff, {name: chat.un, 'function': mammyBot.chat.autoskip}));
                        }
                        else {
                            mammyBot.room.autoskip = !mammyBot.room.autoskip;
                            return API.sendChat(subChat(mammyBot.chat.toggleon, {name: chat.un, 'function': mammyBot.chat.autoskip}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(mammyBot.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(mammyBot.chat.brandambassador);
                    }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(mammyBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = mammyBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(mammyBot.chat.invaliduserspecified, {name: chat.un}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(mammyBot.chat.nolistspecified, {name: chat.un}));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof mammyBot.room.blacklists[list] === 'undefined') return API.sendChat(subChat(mammyBot.chat.invalidlistspecified, {name: chat.un}));
                        else {
                            var media = API.getMedia();
                            var track = {
                                list: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            };
                            mammyBot.room.newBlacklisted.push(track);
                            mammyBot.room.blacklists[list].push(media.format + ':' + media.cid);
                            API.sendChat(subChat(mammyBot.chat.newblacklisted, {name: chat.un, blacklist: list, author: media.author, title: media.title, mid: media.format + ':' + media.cid}));
                            API.moderateForceSkip();
                            if (typeof mammyBot.room.newBlacklistedSongFunction === 'function') {
                                mammyBot.room.newBlacklistedSongFunction(track);
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ":" + cid;

                        API.sendChat(subChat(mammyBot.chat.blinfo, {name: name, author: author, title: title, songid: songid}));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (mammyBot.settings.bouncerPlus) {
                            mammyBot.settings.bouncerPlus = false;
                            return API.sendChat(subChat(mammyBot.chat.toggleoff, {name: chat.un, 'function': 'Bouncer+'}));
                        }
                        else {
                            if (!mammyBot.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = mammyBot.userUtilities.getPermission(id);
                                if (perm > 2) {
                                    mammyBot.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(mammyBot.chat.toggleon, {name: chat.un, 'function': 'Bouncer+'}));
                                }
                            }
                            else return API.sendChat(subChat(mammyBot.chat.bouncerplusrank, {name: chat.un}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute("data-cid"));
                        }
                        return API.sendChat(subChat(mammyBot.chat.chatcleared, {name: chat.un}));
                    }
                }
            },

            commandsCommand: {
                command: 'commands',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(mammyBot.chat.commandslink, {botname: mammyBot.settings.botName, link: mammyBot.cmdLink}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(mammyBot.chat.eatcookie);
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = mammyBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(mammyBot.chat.nousercookie, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(mammyBot.chat.selfcookie, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(mammyBot.chat.cookie, {nameto: user.username, namefrom: chat.un, cookie: this.getCookie()}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        mammyBot.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (mammyBot.settings.cycleGuard) {
                            mammyBot.settings.cycleGuard = !mammyBot.settings.cycleGuard;
                            return API.sendChat(subChat(mammyBot.chat.toggleoff, {name: chat.un, 'function': mammyBot.chat.cycleguard}));
                        }
                        else {
                            mammyBot.settings.cycleGuard = !mammyBot.settings.cycleGuard;
                            return API.sendChat(subChat(mammyBot.chat.toggleon, {name: chat.un, 'function': mammyBot.chat.cycleguard}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== "") {
                            mammyBot.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(mammyBot.chat.cycleguardtime, {name: chat.un, time: mammyBot.settings.maximumCycletime}));
                        }
                        else return API.sendChat(subChat(mammyBot.chat.invalidtime, {name: chat.un}));

                    }
                }
            },

            voteskipCommand: {
                command: 'voteskip',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(mammyBot.chat.voteskiplimit, {name: chat.un, limit: mammyBot.settings.voteSkipLimit}));
                        var argument = msg.substring(cmd.length + 1);
                        if (!mammyBot.settings.voteSkip) mammyBot.settings.voteSkip = !mammyBot.settings.voteSkip;
                        if (isNaN(argument)) {
                            API.sendChat(subChat(mammyBot.chat.voteskipinvalidlimit, {name: chat.un}));
                        }
                        else {
                            mammyBot.settings.voteSkipLimit = argument;
                            API.sendChat(subChat(mammyBot.chat.voteskipsetlimit, {name: chat.un, limit: mammyBot.settings.voteSkipLimit}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (mammyBot.settings.voteSkip) {
                            mammyBot.settings.voteSkip = !mammyBot.settings.voteSkip;
                            API.sendChat(subChat(mammyBot.chat.toggleoff, {name: chat.un, 'function': mammyBot.chat.voteskip}));
                        }
                        else {
                            mammyBot.settings.motdEnabled = !mammyBot.settings.motdEnabled;
                            API.sendChat(subChat(mammyBot.chat.toggleon, {name: chat.un, 'function': mammyBot.chat.voteskip}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = mammyBot.userUtilities.getPermission(chat.uid);
                            if (perm < 2) return API.sendChat(subChat(mammyBot.chat.dclookuprank, {name: chat.un}));
                        }
                        var user = mammyBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(mammyBot.chat.invaliduserspecified, {name: chat.un}));
                        var toChat = mammyBot.userUtilities.dclookup(user.id);
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(mammyBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = mammyBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(mammyBot.chat.invaliduserspecified, {name: chat.un}));
                        var chats = $('.from');
                        for (var i = 0; i < chats.length; i++) {
                            var n = chats[i].textContent;
                            if (name.trim() === n.trim()) {
                                var cid = $(chats[i]).parent()[0].getAttribute('data-cid');
                                API.moderateDeleteChat(cid);
                            }
                        }
                        API.sendChat(subChat(mammyBot.chat.deletechat, {name: chat.un, username: name}));
                    }
                }
            },*/

            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(mammyBot.chat.emojilist, {link: link}));
                    }
                }
            },

            etaCommand: {
                command: 'eta',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var perm = mammyBot.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < 2) return void (0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = mammyBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(mammyBot.chat.invaliduserspecified, {name: chat.un}));
                        var pos = API.getWaitListPosition(user.id);
                        if (pos < 0) return API.sendChat(subChat(mammyBot.chat.notinwaitlist, {name: name}));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = mammyBot.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(mammyBot.chat.eta, {name: name, time: estimateString}));
                    }
                }
            },

            fbCommand: {
                command: 'fb',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof mammyBot.settings.fbLink === "string")
                            API.sendChat(subChat(mammyBot.chat.facebook, {link: mammyBot.settings.fbLink}));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (mammyBot.settings.filterChat) {
                            mammyBot.settings.filterChat = !mammyBot.settings.filterChat;
                            return API.sendChat(subChat(mammyBot.chat.toggleoff, {name: chat.un, 'function': mammyBot.chat.chatfilter}));
                        }
                        else {
                            mammyBot.settings.filterChat = !mammyBot.settings.filterChat;
                            return API.sendChat(subChat(mammyBot.chat.toggleon, {name: chat.un, 'function': mammyBot.chat.chatfilter}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = "http://i.imgur.com/SBAso1N.jpg";
                        API.sendChat(subChat(mammyBot.chat.starterhelp, {link: link}));
                    }
                }
            },

            joinCommand: {
                command: 'join',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (mammyBot.room.roulette.rouletteStatus && mammyBot.room.roulette.participants.indexOf(chat.uid) < 0) {
                            mammyBot.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(mammyBot.chat.roulettejoin, {name: chat.un}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(mammyBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = mammyBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(mammyBot.chat.invaliduserspecified, {name: chat.un}));
                        var join = mammyBot.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = mammyBot.roomUtilities.msToStr(time);
                        API.sendChat(subChat(mammyBot.chat.jointime, {namefrom: chat.un, username: name, time: timeString}));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
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

                        var user = mammyBot.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(mammyBot.chat.nouserspecified, {name: chat.un}));

                        var permFrom = mammyBot.userUtilities.getPermission(chat.uid);
                        var permTokick = mammyBot.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(mammyBot.chat.kickrank, {name: chat.un}));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(mammyBot.chat.kick, {name: chat.un, username: name, time: time}));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function (id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        }
                        else API.sendChat(subChat(mammyBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            killCommand: {
                command: 'kill',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        API.sendChat(mammyBot.chat.kill);
                        mammyBot.disconnectAPI();
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var ind = mammyBot.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            mammyBot.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(mammyBot.chat.rouletteleave, {name: chat.un}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = mammyBot.userUtilities.lookupUser(chat.uid);
                        var perm = mammyBot.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= 1 || isDj) {
                            if (media.format === 1) {
                                var linkToSong = "https://www.youtube.com/watch?v=" + media.cid;
                                API.sendChat(subChat(mammyBot.chat.songlink, {name: from, link: linkToSong}));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function (sound) {
                                    API.sendChat(subChat(mammyBot.chat.songlink, {name: from, link: sound.permalink_url}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        mammyBot.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = mammyBot.settings.lockdownEnabled;
                        mammyBot.settings.lockdownEnabled = !temp;
                        if (mammyBot.settings.lockdownEnabled) {
                            return API.sendChat(subChat(mammyBot.chat.toggleon, {name: chat.un, 'function': mammyBot.chat.lockdown}));
                        }
                        else return API.sendChat(subChat(mammyBot.chat.toggleoff, {name: chat.un, 'function': mammyBot.chat.lockdown}));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (mammyBot.settings.lockGuard) {
                            mammyBot.settings.lockGuard = !mammyBot.settings.lockGuard;
                            return API.sendChat(subChat(mammyBot.chat.toggleoff, {name: chat.un, 'function': mammyBot.chat.lockdown}));
                        }
                        else {
                            mammyBot.settings.lockGuard = !mammyBot.settings.lockGuard;
                            return API.sendChat(subChat(mammyBot.chat.toggleon, {name: chat.un, 'function': mammyBot.chat.lockguard}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (mammyBot.room.skippable) {
                            var dj = API.getDJ();
                            var id = dj.id;
                            var name = dj.username;
                            var msgSend = '@' + name + ': ';
                            mammyBot.room.queueable = false;

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(mammyBot.chat.usedlockskip, {name: chat.un}));
                                mammyBot.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    mammyBot.room.skippable = false;
                                    setTimeout(function () {
                                        mammyBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        mammyBot.userUtilities.moveUser(id, mammyBot.settings.lockskipPosition, false);
                                        mammyBot.room.queueable = true;
                                        setTimeout(function () {
                                            mammyBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < mammyBot.settings.lockskipReasons.length; i++) {
                                var r = mammyBot.settings.lockskipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += mammyBot.settings.lockskipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(mammyBot.chat.usedlockskip, {name: chat.un}));
                                mammyBot.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    mammyBot.room.skippable = false;
                                    API.sendChat(msgSend);
                                    setTimeout(function () {
                                        mammyBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        mammyBot.userUtilities.moveUser(id, mammyBot.settings.lockskipPosition, false);
                                        mammyBot.room.queueable = true;
                                        setTimeout(function () {
                                            mammyBot.roomUtilities.booth.unlockBooth();
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            mammyBot.settings.lockskipPosition = pos;
                            return API.sendChat(subChat(mammyBot.chat.lockskippos, {name: chat.un, position: mammyBot.settings.lockskipPosition}));
                        }
                        else return API.sendChat(subChat(mammyBot.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== "") {
                            mammyBot.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(mammyBot.chat.lockguardtime, {name: chat.un, time: mammyBot.settings.maximumLocktime}));
                        }
                        else return API.sendChat(subChat(mammyBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            mammyBot.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(mammyBot.chat.maxlengthtime, {name: chat.un, time: mammyBot.settings.maximumSongLength}));
                        }
                        else return API.sendChat(subChat(mammyBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + mammyBot.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!mammyBot.settings.motdEnabled) mammyBot.settings.motdEnabled = !mammyBot.settings.motdEnabled;
                        if (isNaN(argument)) {
                            mammyBot.settings.motd = argument;
                            API.sendChat(subChat(mammyBot.chat.motdset, {msg: mammyBot.settings.motd}));
                        }
                        else {
                            mammyBot.settings.motdInterval = argument;
                            API.sendChat(subChat(mammyBot.chat.motdintervalset, {interval: mammyBot.settings.motdInterval}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(mammyBot.chat.nouserspecified, {name: chat.un}));
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
                        var user = mammyBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(mammyBot.chat.invaliduserspecified, {name: chat.un}));
                        if (user.id === mammyBot.loggedInID) return API.sendChat(subChat(mammyBot.chat.addbotwaitlist, {name: chat.un}));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(mammyBot.chat.move, {name: chat.un}));
                            mammyBot.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(mammyBot.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            muteCommand: {
                command: 'mute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(mammyBot.chat.nouserspecified, {name: chat.un}));
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
                                return API.sendChat(subChat(mammyBot.chat.invalidtime, {name: chat.un}));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = mammyBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(mammyBot.chat.invaliduserspecified, {name: chat.un}));
                        var permFrom = mammyBot.userUtilities.getPermission(chat.uid);
                        var permUser = mammyBot.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {
                            /*
                             mammyBot.room.mutedUsers.push(user.id);
                             if (time === null) API.sendChat(subChat(mammyBot.chat.mutednotime, {name: chat.un, username: name}));
                             else {
                             API.sendChat(subChat(mammyBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                             setTimeout(function (id) {
                             var muted = mammyBot.room.mutedUsers;
                             var wasMuted = false;
                             var indexMuted = -1;
                             for (var i = 0; i < muted.length; i++) {
                             if (muted[i] === id) {
                             indexMuted = i;
                             wasMuted = true;
                             }
                             }
                             if (indexMuted > -1) {
                             mammyBot.room.mutedUsers.splice(indexMuted);
                             var u = mammyBot.userUtilities.lookupUser(id);
                             var name = u.username;
                             API.sendChat(subChat(mammyBot.chat.unmuted, {name: chat.un, username: name}));
                             }
                             }, time * 60 * 1000, user.id);
                             }
                             */
                            if (time > 45) {
                                API.sendChat(subChat(mammyBot.chat.mutedmaxtime, {name: chat.un, time: "45"}));
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                            }
                            else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(mammyBot.chat.mutedtime, {name: chat.un, username: name, time: time}));

                            }
                            else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(mammyBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(mammyBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(mammyBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                        }
                        else API.sendChat(subChat(mammyBot.chat.muterank, {name: chat.un}));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof mammyBot.settings.opLink === "string")
                            return API.sendChat(subChat(mammyBot.chat.oplist, {link: mammyBot.settings.opLink}));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(mammyBot.chat.pong)
                    }
                }
            },

            refreshCommand: {
                command: 'refresh',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        mammyBot.disconnectAPI();
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(mammyBot.chat.reload);
                        storeToStorage();
                        mammyBot.disconnectAPI();
                        kill();
                        setTimeout(function () {
                            $.getScript(mammyBot.scriptLink);
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = mammyBot.userUtilities.lookupUserName(name);
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
                            } else API.sendChat(subChat(mammyBot.chat.removenotinwl, {name: chat.un, username: name}));
                        } else API.sendChat(subChat(mammyBot.chat.nouserspecified, {name: chat.un}));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (mammyBot.settings.etaRestriction) {
                            mammyBot.settings.etaRestriction = !mammyBot.settings.etaRestriction;
                            return API.sendChat(subChat(mammyBot.chat.toggleoff, {name: chat.un, 'function': mammyBot.chat.etarestriction}));
                        }
                        else {
                            mammyBot.settings.etaRestriction = !mammyBot.settings.etaRestriction;
                            return API.sendChat(subChat(mammyBot.chat.toggleon, {name: chat.un, 'function': mammyBot.chat.etarestriction}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (!mammyBot.room.roulette.rouletteStatus) {
                            mammyBot.room.roulette.startRoulette();
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof mammyBot.settings.rulesLink === "string")
                            return API.sendChat(subChat(mammyBot.chat.roomrules, {link: mammyBot.settings.rulesLink}));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var woots = mammyBot.room.roomstats.totalWoots;
                        var mehs = mammyBot.room.roomstats.totalMehs;
                        var grabs = mammyBot.room.roomstats.totalCurates;
                        API.sendChat(subChat(mammyBot.chat.sessionstats, {name: from, woots: woots, mehs: mehs, grabs: grabs}));
                    }
                }
            },

            skipCommand: {
                command: 'skip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(mammyBot.chat.skip, {name: chat.un}));
                        API.moderateForceSkip();
                        mammyBot.room.skippable = false;
                        setTimeout(function () {
                            mammyBot.room.skippable = true
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (mammyBot.settings.songstats) {
                            mammyBot.settings.songstats = !mammyBot.settings.songstats;
                            return API.sendChat(subChat(mammyBot.chat.toggleoff, {name: chat.un, 'function': mammyBot.chat.songstats}));
                        }
                        else {
                            mammyBot.settings.songstats = !mammyBot.settings.songstats;
                            return API.sendChat(subChat(mammyBot.chat.toggleon, {name: chat.un, 'function': mammyBot.chat.songstats}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var msg = '/me [@' + from + '] ';

                        msg += mammyBot.chat.afkremoval + ': ';
                        if (mammyBot.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += mammyBot.chat.afksremoved + ": " + mammyBot.room.afkList.length + '. ';
                        msg += mammyBot.chat.afklimit + ': ' + mammyBot.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (mammyBot.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
												
                        msg += mammyBot.chat.blacklist + ': ';
                        if (mammyBot.settings.blacklistEnabled) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += mammyBot.chat.lockguard + ': ';
                        if (mammyBot.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += mammyBot.chat.cycleguard + ': ';
                        if (mammyBot.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += mammyBot.chat.timeguard + ': ';
                        if (mammyBot.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += mammyBot.chat.chatfilter + ': ';
                        if (mammyBot.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += mammyBot.chat.voteskip + ': ';
                        if (mammyBot.settings.voteskip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        var launchT = mammyBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = mammyBot.roomUtilities.msToStr(durationOnline);
                        msg += subChat(mammyBot.chat.activefor, {time: since});

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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(mammyBot.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.substring(cmd.length + 2, lastSpace);
                        var name2 = msg.substring(lastSpace + 2);
                        var user1 = mammyBot.userUtilities.lookupUserName(name1);
                        var user2 = mammyBot.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(mammyBot.chat.swapinvalid, {name: chat.un}));
                        if (user1.id === mammyBot.loggedInID || user2.id === mammyBot.loggedInID) return API.sendChat(subChat(mammyBot.chat.addbottowaitlist, {name: chat.un}));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 || p2 < 0) return API.sendChat(subChat(mammyBot.chat.swapwlonly, {name: chat.un}));
                        API.sendChat(subChat(mammyBot.chat.swapping, {'name1': name1, 'name2': name2}));
                        if (p1 < p2) {
                            mammyBot.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function (user1, p2) {
                                mammyBot.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        }
                        else {
                            mammyBot.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function (user2, p1) {
                                mammyBot.userUtilities.moveUser(user2.id, p1, false);
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof mammyBot.settings.themeLink === "string")
                            API.sendChat(subChat(mammyBot.chat.genres, {link: mammyBot.settings.themeLink}));
                    }
                }
            },

            timeguardCommand: {
                command: 'timeguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (mammyBot.settings.timeGuard) {
                            mammyBot.settings.timeGuard = !mammyBot.settings.timeGuard;
                            return API.sendChat(subChat(mammyBot.chat.toggleoff, {name: chat.un, 'function': mammyBot.chat.timeguard}));
                        }
                        else {
                            mammyBot.settings.timeGuard = !mammyBot.settings.timeGuard;
                            return API.sendChat(subChat(mammyBot.chat.toggleon, {name: chat.un, 'function': mammyBot.chat.timeguard}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = mammyBot.settings.blacklistEnabled;
                        mammyBot.settings.blacklistEnabled = !temp;
                        if (mammyBot.settings.blacklistEnabled) {
                          return API.sendChat(subChat(mammyBot.chat.toggleon, {name: chat.un, 'function': mammyBot.chat.blacklist}));
                        }
                        else return API.sendChat(subChat(mammyBot.chat.toggleoff, {name: chat.un, 'function': mammyBot.chat.blacklist}));
                    }
                }
            },
						
            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (mammyBot.settings.motdEnabled) {
                            mammyBot.settings.motdEnabled = !mammyBot.settings.motdEnabled;
                            API.sendChat(subChat(mammyBot.chat.toggleoff, {name: chat.un, 'function': mammyBot.chat.motd}));
                        }
                        else {
                            mammyBot.settings.motdEnabled = !mammyBot.settings.motdEnabled;
                            API.sendChat(subChat(mammyBot.chat.toggleon, {name: chat.un, 'function': mammyBot.chat.motd}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
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
                                return API.sendChat(subChat(mammyBot.chat.notbanned, {name: chat.un}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        mammyBot.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            unmuteCommand: {
                command: 'unmute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var permFrom = mammyBot.userUtilities.getPermission(chat.uid);
                        var from = chat.un;
                        var name = msg.substr(cmd.length + 2);

                        var user = mammyBot.userUtilities.lookupUserName(name);

                        if (typeof user === 'boolean') return API.sendChat(subChat(mammyBot.chat.invaliduserspecified, {name: chat.un}));

                        var permUser = mammyBot.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {
                            try {
                                API.moderateUnmuteUser(user.id);
                                API.sendChat(subChat(mammyBot.chat.unmuted, {name: chat.un, username: name}));
                            }
                            catch (e) {
                                API.sendChat(subChat(mammyBot.chat.notmuted, {name: chat.un}));
                            }
                        }
                        else API.sendChat(subChat(mammyBot.chat.unmuterank, {name: chat.un}));
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            mammyBot.settings.commandCooldown = cd;
                            return API.sendChat(subChat(mammyBot.chat.commandscd, {name: chat.un, time: mammyBot.settings.commandCooldown}));
                        }
                        else return API.sendChat(subChat(mammyBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (mammyBot.settings.usercommandsEnabled) {
                            API.sendChat(subChat(mammyBot.chat.toggleoff, {name: chat.un, 'function': mammyBot.chat.usercommands}));
                            mammyBot.settings.usercommandsEnabled = !mammyBot.settings.usercommandsEnabled;
                        }
                        else {
                            API.sendChat(subChat(mammyBot.chat.toggleon, {name: chat.un, 'function': mammyBot.chat.usercommands}));
                            mammyBot.settings.usercommandsEnabled = !mammyBot.settings.usercommandsEnabled;
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(mammyBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = mammyBot.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(mammyBot.chat.invaliduserspecified, {name: chat.un}));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(mammyBot.chat.voteratio, {name: chat.un, username: name, woot: vratio.woot, mehs: vratio.meh, ratio: ratio.toFixed(2)}));
                    }
                }
            },

            welcomeCommand: {
                command: 'welcome',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (mammyBot.settings.welcome) {
                            mammyBot.settings.welcome = !mammyBot.settings.welcome;
                            return API.sendChat(subChat(mammyBot.chat.toggleoff, {name: chat.un, 'function': mammyBot.chat.welcomemsg}));
                        }
                        else {
                            mammyBot.settings.welcome = !mammyBot.settings.welcome;
                            return API.sendChat(subChat(mammyBot.chat.toggleon, {name: chat.un, 'function': mammyBot.chat.welcomemsg}));
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
                    if (!mammyBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof mammyBot.settings.website === "string")
                            API.sendChat(subChat(mammyBot.chat.website, {link: mammyBot.settings.website}));
                    }
                }
            }
        }
    };

    loadChat(mammyBot.startup);
}).call(this);