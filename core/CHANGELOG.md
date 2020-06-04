# 1.0.6

* Pausing message queue prevents holds every out-coming message.

# 1.0.5

* Now disconnect event won't fire on failed reconnecting events.

# 1.0.4

* Now method calls can be put at the beginning of the call queue.
* Pause/continue outcoming ddp messages queue.
* `autoReconnect` value is being saved on disconnect.

# 1.0.3

* Updated `wolfy87-eventemitter` to 5.2.5.

# 1.0.2

* Replaced id checking inside sub method.

# 1.0.1

* Added EJSON support.
* Added message object to connect emit.
* Added session id.
* Added boolean parameter `cleanQueue` to the `DDP` constructor.
  Determine whether to clean ddp message queue on disconnect or not.
