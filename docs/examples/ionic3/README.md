## Ionic 3 Example

Let's create a new provider in your ionic project *./src/providers/appglobals.ts*:

```typescript
import { Injectable } from '@angular/core';

import simpleDDP from 'simpleddp';

@Injectable()
export class AppGlobals {

  public server: any = new simpleDDP({
      endpoint: "ws://someserver.com/websocket",
    	SocketConstructor: WebSocket, // both modern android and ios webviews support it
      reconnectInterval: 5000,
      autoConnect: false
  });
}
```

Next we should add this provider in your *./src/app/app.module.ts*:

```typescript

...

import { AppGlobals } from '../providers/appglobals';

@NgModule({
  ...
  providers: [
    ...
    AppGlobals
  ]
})

```

Now you can use SimpleDDP from any page like this:
*./src/pages/somepage/somepage.ts*:
```typescript
import { Component } from '@angular/core';
import { ToastController } from 'ionic-angular';

import { AppGlobals } from '../../providers/appglobals';

@IonicPage()
@Component({
  selector: 'some-page',
  templateUrl: 'somepage.html',
})
export class SomePage {

  connectingMessage: any;
  postsSub: any;
  posts: array = [];
  postsChangeListener: any;

  constructor(public globals: AppGlobals, private toastCtrl: ToastController) {

    this.globals.server.connect();

    this.globals.server.on("disconnected", message => {
      //connection to server has been lost
      this.toggleConnectingMessage();
    });

    this.globals.server.on("connected", async message => {
      //we have successfully connected to server
      this.toggleConnectingMessage();

      //subscribe to something
      this.postsSub = this.globals.server.sub("topTenPosts");

      await this.postsSub.ready();

      //sub is ready, from here we can access the data
      //for example we can filter the posts

      this.posts = this.globals.server.collections.posts.filter(post => post.label=="coffee");

      //be careful here, once we filtered the data
      //this.posts will be an array of links to data objects (posts)
      //so if some post changes, this.posts changes too
      //but if there are new 'coffee' posts arrived from server this.posts won't change
      //we have to re-filter every time something is changing

      this.postsChangeListener = this.globals.server.collection('posts').onChange(()=>{
        this.posts = this.globals.server.collections.posts.filter(post => post.label=="coffee");
      });
    });
  }

  toggleConnectingMessage() {
    if (!this.connectingMessage) {
      this.connectingMessage = this.toastCtrl.create({
        message: 'Connecting to server...',
        position: 'bottom'
      });

      this.connectingMessage.onDidDismiss(() => {
        this.connectingMessage = false;
      });

      this.connectingMessage.present();
    } else {
      this.connectingMessage.dismiss();
    }
  }

  ionViewDidLoad() {
    //don't forget to stop everything you won't need after the page is closed
    this.postsSub.stop();
    this.postsChangeListener.stop();
  }
}
```

Now we can use posts as a source of a reactive data inside the template.

*./src/pages/somepage/somepage.html*:
```html
<ion-content>
  <div *ngIf="posts.length>0">
    <ion-card *ngFor='let post of posts; trackBy: index;'>
      <ion-card-header>
        {{post.title}}
      </ion-card-header>
      <ion-card-content>
        {{post.message}}
      </ion-card-content>
    </ion-card>
  </div>
</ion-content>
```
