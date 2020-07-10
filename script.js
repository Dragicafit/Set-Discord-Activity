let status = "online", since = 0, afk = false, HandleActivityData;
window.SetDiscordActivityData = {
    activityType: 0,
    activityName: "Set Discord Activity",
    activityUrl: "https://twitch.tv/settings",
    activityDetails: "",
    activityState: "",
    activityPartyCur: "",
    activityPartyMax: ""
};

window.WebSocket.prototype.originalSend = window.WebSocket.prototype.send;
window.WebSocket.prototype.send = function (d) {
    console.log(d);
    const start = d.substr(0, 8);
    if (start == '{"op":3,') {
        const j = JSON.parse(d);
        status = j.d.status;
        since = j.d.since;
        afk = j.d.afk;
        this.SetDiscordActivitySendStatus();
    }
    else {
        if (start == '{"op":2,') {
        }
        console.log(this);
        window.removeEventListener("message", HandleActivityData);
        HandleActivityData = function (event) {
            if (event.source !== window || !event.data.direction || event.data.direction !== "from-content-SDA")
                return;
            if (event.data.command === 'SetDiscordActivityData') {
                console.log(this);
                this.SetDiscordActivitySendStatus();
            }
        }.bind(this);
        window.addEventListener("message", HandleActivityData);
        return this.originalSend(d);
    }
};
window.WebSocket.prototype.SetDiscordActivitySendStatus = function () {
    let activity = {
        type: window.SetDiscordActivityData.activityType,
        name: window.SetDiscordActivityData.activityName
    };
    if (window.SetDiscordActivityData.activityType == 1) {
        activity.url = window.activityUrl;
    }
    if (window.SetDiscordActivityData.activityPartyCur != "" && window.SetDiscordActivityData.activityPartyMax != "") {
        activity.party = { size: [window.SetDiscordActivityData.activityPartyCur, window.SetDiscordActivityData.activityPartyMax] };
    }
    if (window.SetDiscordActivityData.activityDetails) {
        activity.details = window.SetDiscordActivityData.activityDetails;
    }
    if (window.SetDiscordActivityData.activityState) {
        activity.state = window.SetDiscordActivityData.activityState;
    }
    this.originalSend(JSON.stringify({
        op: 3, d: {
            status,
            activities: [activity],
            since,
            afk
        }
    }));
};