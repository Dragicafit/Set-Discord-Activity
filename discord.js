let s = document.createElement("script");
s.src = browser.runtime.getURL('/script.js');
s.onload = function () {
	this.remove();
	browser.runtime.sendMessage({
		command: 'scipt loaded'
	});
};
(document.head || document.documentElement).appendChild(s);
let port = browser.runtime.connect({ name: "discord" }), closeOK = false;
port.onMessage.addListener(msg => {
	console.info(msg);
	if (msg.action) {
		switch (msg.action) {
			case "close":
				closeOK = true;
				break;

			default:
				console.warn("Unknown action", msg.action);
		}
	}
	else if (msg.type !== undefined && msg.name !== undefined) {
		window.postMessage({
			direction: "from-content-SDA",
			command: "SetDiscordActivityData",
			activityType: msg.type,
			activityName: msg.name,
			activityUrl: msg.streamurl,
			activityDetails: msg.details,
			activityState: msg.state,
			activityPartyCur: msg.partycur,
			activityPartyMax: msg.partymax
		}, "https://discord.com");
	}
});
port.onDisconnect.addListener(() => {
	console.info("port closed");
	if (closeOK) {
		closeOK = false;
	}
	else {
		location.reload();
	}
});
