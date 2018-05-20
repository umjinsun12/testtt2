import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Config } from './config';
import 'rxjs/add/operator/map';
import { LoadingController } from 'ionic-angular';

@Injectable()
export class CardnewsService {
    data: any;
    product: any;
    code: any;
    loader: any;
    posts: any;
    cardnewsCategoryId: any;
    categoryContent: any;
    pagelength:any;
    cardnews_order:any;
    categoryAlldata:any;
    categoryArray:any;
    filter:any={};
    has_more_items: boolean = true;
    constructor(private http: Http, private config: Config, private loadingController: LoadingController) {
        this.cardnewsCategoryId = 20;
        this.cardnews_order = [];
        this.categoryArray = {};
        this.filter.page = 0;
    }


    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    getCardnewsCategory(results){
        for(let categoryData of results){
            this.categoryArray[results.id] = results.name;
        }
    }


    getPostEmbedbyCategory(category, page:number = 1){
        return new Promise(resolve => {
            this.http.get( this.config.WORDPRESS_REST_API_URL + "/posts?_embed&categories=" + category + "&page=" + page).map(res => res.json())
                .subscribe(data => {
                    console.log("reqeust data : " + this.config.WORDPRESS_REST_API_URL + "/posts?_embed&categories=" + category + "&page=" + page);
                    this.posts = data;
                    resolve(this.posts);
                })
        });
    }

    getCategory(category){
        return new Promise(resolve =>{
            this.http.get(this.config.WORDPRESS_REST_API_URL + "/categories/" + category).map(res => res.json())
                .subscribe(data =>{
                    this.categoryContent = data;
                    resolve(this.categoryContent);
                })
        })
    }

    getAllCategory(){
        return new Promise(resolve =>{
            this.http.get(this.config.WORDPRESS_REST_API_URL + "/categories/").map(res => res.json())
                .subscribe(data =>{
                    this.categoryAlldata = data;
                    resolve(this.categoryAlldata);
                })
        })
    }


    getRandomCardnews(){
        return new Promise(resolve =>{
            this.getAllCategory().then((results) => {
                this.categoryContent = results;
                let pagenum;
                this.cardnews_order = [];
                this.categoryContent.forEach(item => {
                    this.categoryArray[item.id] = item.name;
                    if(item.id == 20){
                        pagenum = Math.ceil(item.count/10);
                        for(let i=0; i < pagenum-1 ; i++){
                            this.cardnews_order.push(i+1);
                        }
                    }
                });

                this.shuffle(this.cardnews_order);
                this.cardnews_order.push(pagenum);
                console.log(this.cardnews_order);
                this.getPostEmbedbyCategory(this.cardnewsCategoryId, this.cardnews_order[0]).then((posts) => {
                    this.shuffle(posts);
                    resolve(posts);
                });
            });
        });
    }

    getDetailCards(postid){
        return new Promise(resolve =>{
            this.http.get(this.config.WORDPRESS_REST_API_URL + "/posts/" + postid).map(res => res.json())
                .subscribe(data =>{
                    resolve(data);
                })
        });
    }


    loadMore() {
        this.filter.page += 1;
        return new Promise(resolve => {
            this.getPostEmbedbyCategory(this.cardnewsCategoryId, this.cardnews_order[this.filter.page]).then((results) => {
                this.shuffle(results);
                resolve(results);
            });
        });
    }


    handleCategoryResults(results){
        this.categoryContent = results;
        this.pagelength = this.categoryContent.count;
    }


    presentLoading(text) {
        this.loader = this.loadingController.create({
            content: text,
        });
        this.loader.present();
    }
    dismissLoading() {
        this.loader.dismiss();
    }

}