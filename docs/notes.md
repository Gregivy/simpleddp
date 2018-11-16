## Can websocket messages arrive out-of-order?
[link](https://stackoverflow.com/questions/11804721/can-websocket-messages-arrive-out-of-order)
Short answer: No.

Long answer:

WebSocket runs over TCP, so on that level @EJP 's answer applies. WebSocket can be "intercepted" by intermediaries (like WS proxies): those are allowed to reorder WebSocket control frames (i.e. WS pings/pongs), but not message frames when no WebSocket extension is in place. If there is a neogiated extension in place that in principle allows reordering, then an intermediary may only do so if it understands the extension and the reordering rules that apply.
