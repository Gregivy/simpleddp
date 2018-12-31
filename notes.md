# Notes

## Can websocket messages arrive out-of-order?
[link](https://stackoverflow.com/questions/11804721/can-websocket-messages-arrive-out-of-order)
Short answer: No.

Long answer:

WebSocket runs over TCP, so on that level @EJP 's answer applies. WebSocket can be "intercepted" by intermediaries (like WS proxies): those are allowed to reorder WebSocket control frames (i.e. WS pings/pongs), but not message frames when no WebSocket extension is in place. If there is a neogiated extension in place that in principle allows reordering, then an intermediary may only do so if it understands the extension and the reordering rules that apply.

## Meteor sessionId

Meteor (tested v1.4-1.8) does not use sessionId for storing subscription data.

## Meter subId

Meteor (tested v1.4-1.8) does not use store subscription data associated with subscription id.
This means that if you subscribe to some publication, close socket connection, make some changes on server
in data being published and then reconnect to server and subscribe with the same id
that previous subscription had, you won't receive any `changed` or `removed` messages.
