import { ShoppingProductPage } from './../shopping-product/shopping-product';
import { ShoppingCartPage } from './../shopping-cart/shopping-cart';
import { Functions } from './../../services/shopping-services/functions';
import { Values } from './../../services/shopping-services/values';
import { CategoryService } from './../../services/shopping-services/category-service';
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, PopoverController, ViewController,IonicPage } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { Content } from 'ionic-angular';
import { Service} from './../../services/shopping-services/service'
import { WishlistPage } from '../account/wishlist/wishlist'
import { PopoverPage } from '../about-popover/about-popover';

/**
 * Generated class for the ShoppingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-shopping',
  templateUrl: 'shopping.html',
})
export class ShoppingPage {

    @ViewChild("contentRef") contentHandle: Content;
    products: any;
    moreProducts: any;
    count: any;
    offset: any;
    category: any;
    has_more_items: boolean = true;
    listview: boolean = false;
    noProducts: boolean = false;
    status: any;
    options: any;
    pop: any;
    categories: any;
    subCategories: any;
    items: any;
    quantity: any;
    filter: any;
    q: any;
    shouldShowCancel: boolean = true;
    sort: number = 0;
    categoryName: any;
    loading: boolean = false;
    data: any;
    private tabBarHeight;
    private topOrBottom:string;
    private contentBox;
    related: any;

    constructor(public modalCtrl: ModalController, private viewCtrl: ViewController, public nav: NavController, public popoverCtrl: PopoverController, public service: CategoryService, params: NavParams, public values: Values, public functions: Functions, public homeservice: Service) {
        this.data = {};
        this.filter = {};
        this.q = "";
        this.filter.page = 1;
        this.count = 10;
        this.offset = 0;
        this.values.filter = {};
        this.options = [];
        this.subCategories = [];
        this.items = [];
        this.quantity = "1";
        this.filter.category = params.data.id;
        this.categoryName = params.data.name;
        if (params.data.categories) {
            this.categories = params.data.categories;
            for (var i = 0; i < this.categories.length; i++) {
                    this.subCategories.push(this.categories[i]);
            }
        }
        if (params.data.attributeSlug) {
            this.filter.attribute = params.data.attributeSlug;
        }
        if (params.data.attributeId) {
            this.filter.attribute_term = params.data.attributeId;
        }
        this.service.load(this.filter).then((results) => this.handleProducts(results));
    }
    handleProducts(results) {
        console.log(results);
        this.products = results;
        this.viewCtrl.showBackButton(true);
    }
    getCategory(id, slug, name) {
        this.items.id = id;
        this.items.slug = slug;
        this.items.name = name;
        this.items.categories = this.categories;
        this.nav.push(ShoppingProductPage, this.items);
    }
    parseText(id, count, offset, obj2) {
        var text = '{';
        text += '"category' + '":"' + id + '"}';
        var obj1 = JSON.parse(text);
        var obj3 = {};
        for (var attrname in obj1) {
            obj3[attrname] = obj1[attrname];
        }
        for (attrname in obj2) {
            obj3[attrname] = obj2[attrname];
        }
        return obj3;
    }
    getProducts(id) {
        this.nav.push(ShoppingProductPage, id);
    }
    getProduct(id) {
        this.nav.push(ShoppingProductPage, id);
    }
    getCart() {
        console.log("asdfasdf");
        this.values.hideTabbar = false;
        this.nav.push(ShoppingCartPage);
    }
    doInfinite(infiniteScroll) {
        this.filter.page += 1;
        this.service.loadMore(this.filter).then((results) => this.handleMore(results, infiniteScroll));
    }
    handleMore(results, infiniteScroll) {
        if (results != undefined) {
            for (var i = 0; i < results.length; i++) {
                this.products.push(results[i]);
            };
        }
        if (results.length == 0) {
            this.has_more_items = false;
        }
        infiniteScroll.complete();
    }

    doRefresh(refresher){
        this.has_more_items = true;
        this.filter.page = 1;
        this.service.load(this.filter).then((results) => this.handleRefreshProducts(results, refresher));
    }
    handleRefreshProducts(results, refresher){
        console.log(results);
        this.products = results;
        refresher.complete();
    }

    setListView() {
        this.values.listview = true;
    }
    setGridView() {
        this.values.listview = false;
    }
    deleteFromCart(id) {
        this.service.deleteFromCart(id).then((results) => this.status = results);
    }
    updateToCart(id) {
        this.service.updateToCart(id).then((results) => this.status = results);
    }
    addToCart(id, type) {
        if (type == 'variable') {
            this.nav.push(ShoppingProductPage, id);
        } else {
            var text = '{';
            var i;
            for (i = 0; i < this.options.length; i++) {
                var res = this.options[i].split(":");
                text += '"' + res[0] + '":"' + res[1] + '",';
            }
            text += '"product_id":"' + id + '",';
            text += '"quantity":"' + this.quantity + '"}';
            var obj = JSON.parse(text);
            this.service.addToCart(obj).then((results) => this.updateCart(results));
        }
    }
    updateCart(result) {
        console.log(result);
    }
    onInput($event) {
        this.loading = true;
        this.filter = "";
        this.filter = {};
        this.filter.page = 1;
        this.filter.search = $event.srcElement.value;
        //this.filter.order = "DESC";
        this.service.search(this.filter).then((results) => this.handleSearchResults(results));
    }
    handleSearchResults(results) {
        this.loading = false;
        this.products = results;
    }
    onCancel($event) {
        console.log('cancelled');
    }
    addToWishlist(id) {
        if (this.values.isLoggedIn) {
            this.values.wishlistId[id] = true;
            this.service.addToWishlist(id).then((results) => this.update(results, id));
        } else {
            this.functions.showAlert("Warning", "You must login to add product to wishlist");
        }
    }
    update(results, id) {
        if (results.success == "Success") {
            this.values.wishlistId[id] = true;
        } else {}
    }
    removeFromWishlist(id) {
        this.values.wishlistId[id] = false;
        this.service.deleteItem(id).then((results) => this.updateWish(results, id));
    }
    updateWish(results, id) {
        if (results.status == "success") {
            this.values.wishlistId[id] = false;
        }
    }
    getWishlist() {
        this.nav.push(WishlistPage);
    }
    getFilter() {
        /*let modal = this.modalCtrl.create(Filter, this.filter);
        modal.onDidDismiss(data => {
            if (this.values.applyFilter) {
                this.filter = this.values.filter;
                this.has_more_items = true;
                this.filter.page = 1;
                this.filter.opts = undefined;
                this.filter.component = undefined;
                this.service.load(this.filter).then((results) => this.handleFilterResults(results));
            }
        });
        modal.present();*/
        console.log("Filter");
    }
    handleFilterResults(results) {
        this.products = results;
    }
    getSort() {
        /*let modal = this.modalCtrl.create(Sort, this.filter);
        modal.onDidDismiss(data => {
            if (this.values.applyFilter) {
                this.filter = this.values.filter;
                this.has_more_items = true;
                this.filter.page = 1;
                this.filter.opts = undefined;
                this.filter.component = undefined;
                this.service.load(this.filter).then((results) => this.handleFilterResults(results));
            }
        });
        modal.present();*/
        console.log("Sort");
    }
    scrollingFun(e) {
        if (e.scrollTop > this.contentHandle.getContentDimensions().contentHeight) {
            if (document.querySelector(".tabbar")) document.querySelector(".tabbar")['style'].display = 'flex';
            if (this.topOrBottom == "top") {
                this.contentBox.marginTop = 0;
            } else if (this.topOrBottom == "bottom") {
                this.contentBox.marginBottom = 0;
            }
        } else {
            if (document.querySelector(".tabbar")) document.querySelector(".tabbar")['style'].display = 'flex';
            if (this.topOrBottom == "top") {
                this.contentBox.marginTop = this.tabBarHeight;
            } else if (this.topOrBottom == "bottom") {
                this.contentBox.marginBottom = this.tabBarHeight;
            }
        } //if else
    }
    ionViewDidEnter() {
        this.contentBox = document.querySelector(".scroll-content")['style'];
        this.tabBarHeight = this.contentBox.marginBottom;
    }
    ionViewDidLeave() {
        this.related = "";
    }
    presentPopover(event: Event) {
        let popover = this.popoverCtrl.create(PopoverPage);
        popover.present({
            ev: event
        });
        console.log("popover");
    }



}
