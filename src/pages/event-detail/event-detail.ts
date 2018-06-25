import { Component } from '@angular/core';
import { NavController, NavParams,LoadingController } from 'ionic-angular';
import { WordpressService } from '../../services/wordpress.service';
import * as moment from 'moment';

/**
 * Generated class for the EventDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-event-detail',
  templateUrl: 'event-detail.html',
})
export class EventDetailPage {
  
  postId: number;
  postName: string;
  post: any;


  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public wordpressService: WordpressService,
    public loadingCtrl: LoadingController
  ) {
    this.postId = navParams.data.id;
      this.postName = navParams.data.name;
      this.post = {
        categoryName : "",
        content : {
          rendered : ""
        },
        date : "",
        title :{
          rendered : ""
        },
        author : "",
        replies : []
      }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventDetailPage');
    console.log(this.postId);
    console.log(this.post);
    let loading = this.loadingCtrl.create();
    loading.present();
    this.wordpressService.getPostbyId(this.postId).subscribe(data =>{
      this.post = data;
      this.post.categoryName = data._embedded['wp:term'][0][0].name.replace("커뮤니티-","");
      this.post.author = data._embedded['author'][0].name;
      this.post.content.rendered = data.content.rendered.replace("<p>","").replace("</p>","");
      this.post.date = moment(data.date).fromNow();
      if(data._embedded.replies != undefined){
        this.post.replies = data._embedded.replies[0];
        for(var i= 0; i < this.post.replies.length ; i++){
          this.post.replies[i].content.rendered = this.post.replies[i].content.rendered.replace("<p>","").replace("</p>","");
          this.post.replies[i].date = moment(this.post.replies[i].date).fromNow();
        }
      }
      else
        this.post.replies = [];
      console.log(this.post);
      loading.dismiss();
      });
  }

}
