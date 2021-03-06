import { Component, ViewChild, ElementRef} from '@angular/core';
import { Values } from '../../../services/shopping-services/values';
import { Functions } from '../../../services/shopping-services/functions';
import { Service } from '../../../services/shopping-services/service'
import { CheckoutService } from '../../../services/shopping-services/checkout-service';
import { NavController, NavParams, ViewController, LoadingController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { OrderSummary } from '../../checkout/order-summary/order-summary';
import { FormGroup,  FormBuilder, Validators }	from '@angular/forms';
import { AddressSearchFormPage } from '../address-search-form/address-search-form';

import { IamportService } from 'iamport-ionic-inicis3';

import {TabsPage} from '../../tabs/tabs';
import {CmsService} from "../../../services/cms-service.service";
import {TermsPage} from "../../account/terms/terms";


/**
 * Generated class for the BillingAddressFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  templateUrl: 'billing-address-form.html'
})
export class BillingAddressForm {
  @ViewChild('addrDetail') inputAddrDetail: ElementRef;
  billingAddressForm: any;
  billing: any;
  regions: any;
  status: any;
  errorMessage: any;
  address: any;
  form: any;
  states: any;
  OrderReview: any;
  loginData: any;
  id: any;
  couponStatus: any;
  buttonSubmit: boolean = false;
  buttonSubmitLogin: boolean = false;
  buttonSubmitCoupon: boolean = false;
  PlaceOrder: any;
  buttonText1: any;
  LogIn: any;
  mydate: any;
  time: any;
  date: any;
  selectedDate: any;
  shipping: any;
  order: any;
  buttonText : any;
  enableBillingAddress: boolean = true;
  enableShippingMethods: boolean = true;
  enableShippingForm : boolean = false;
  enableLogin: boolean = false;
  enableAddressSearch: boolean = false;
  chosen_shipping: any;
  showPasswordEnable: boolean = false;
  enablePaymentMethods : boolean = true;
  showAddress: boolean = true;
  tabBarElement: any;
  payloading:any;

  addrForm: FormGroup = this.builder.group({
    zip: ['', [Validators.required]],
    addr: ['', [Validators.required]],
    addrDetail: [''],
  });

  
  
  constructor(
      private viewCtrl: ViewController, 
      public iab: InAppBrowser, 
      public nav: NavController, 
      public service: CheckoutService, 
      params: NavParams, 
      public functions: Functions, 
      public values: Values, 
      public addressservice : Service,
      private builder: FormBuilder,
      public iamport: IamportService,
      public loadingCtrl: LoadingController,
      public cmsService : CmsService) {




      this.PlaceOrder = "Place Order";
      this.buttonText1 = "Apply";
      this.LogIn = "LogIn";
      this.loginData = [];
      this.form = params.data;
      this.fillShippingForm();
      console.log(this.form);
      this.billing = {};
      if(document.querySelector(".tabbar"))
      this.tabBarElement = document.querySelector(".tabbar")['style'];
      this.billing.save_in_address_book = true;
      this.getRegion(this.form.billing_country);
      this.getRegion(this.form.shipping_country);
      this.form.shipping = true;
      this.shipping = {};
      this.shipping.save_in_address_book = true;



      if(this.values.isLoggedIn){
          if(this.form.billing_country == "" || this.form.billing_country == undefined || this.form.billing_state =="" || this.form.billing_state == undefined || this.form.billing_postcode == "" || this.form.billing_postcode == undefined){
              this.enableBillingAddress = true;
              this.enableLogin = false;
          }
          else {
          this.showAddress = true;
          this.enableLogin = false;
          this.enableShippingMethods = true;
          this.enablePaymentMethods = true;
          this.form.biterms = true;
          }
      }
      else if(!this.values.isLoggedIn){
          this.enableLogin = false; // 로그인 처리
      }
  }
  fillShippingForm() {
      this.form.shipping_first_name = this.form.billing_first_name;
      this.form.shipping_last_name = this.form.billing_last_name;
      this.form.shipping_address_1 = this.form.billing_address_1;
      this.form.shipping_address_2 = this.form.billing_address_2;
      this.form.shipping_city = this.form.billing_city;
      this.form.shipping_country = this.form.billing_country;
      this.form.shipping_state = this.form.billing_state;
      this.form.shipping_postcode = this.form.billing_postcode;
  }
  getRegion(countryId) {
      //this.form.billing_state = "";
      this.states = this.form.state[countryId];
      this.service.updateOrderReview(this.form).then((results) => this.handleOrderReviews(results));
  }
  handleOrderReviews(results) {
      console.log(results);
      this.OrderReview = results;
      this.chosen_shipping = this.OrderReview.chosen_shipping;

      console.log(this.form.payment);
      if(this.OrderReview.totals.total == 0){
        this.form.payment = {
          'cod' : this.form.payment['cod']
        };
      }else{
        this.form.payment = {
          'bacs' : this.form.payment['bacs'],
          'iamport_card' : this.form.payment['iamport_card'],
          'iamport_trans' : this.form.payment['iamport_trans']
        };
      }
  }
  checkout() {
      if (this.validateAddress()) {
          this.buttonSubmit = true;
          this.PlaceOrder = "Placing Order";
          console.log(this.form.payment_method);
          if (this.form.shipping) {
              this.form.shipping_first_name = this.form.billing_first_name;
              this.form.shipping_last_name = this.form.billing_last_name;
              this.form.shipping_company = this.form.billing_company;
              this.form.shipping_address_1 = this.form.billing_address_1;
              this.form.shipping_address_2 = this.form.billing_address_2;
              this.form.shipping_city = this.form.billing_city;
              this.form.shipping_country = this.form.billing_country;
              this.form.shipping_state = this.form.billing_state;
              this.form.shipping_postcode = this.form.billing_postcode;
          }
          if (this.form.payment_method == 'bacs' || this.form.payment_method == 'cheque') {
              this.payloading = this.loadingCtrl.create();
              this.payloading.present();
              this.service.checkout(this.form).then((results) => this.handleBilling(results));
          }
          else if(this.form.payment_method == 'cod'){
              this.payloading = this.loadingCtrl.create();
              this.payloading.present();
              this.service.checkout(this.form).then((results) => this.handlePoint(results));
          }
          else if (this.form.payment_method == 'stripe') {
              this.service.getStripeToken(this.form).then((results) => this.handleStripeToken(results));
          } else {
              console.log('paymethod');
              this.payloading = this.loadingCtrl.create();
              this.payloading.present();
              this.service.checkout(this.form).then((results) => this.handlePayment(results));
          }
      }

  }
  handlePayment(results) {
      if (results.result == 'success') {
          let mdata = {
              imp_uid : results.iamport.user_code,
              merchant_uid : results.iamport.merchant_uid,
              order_id : results.order_id
          };

          

          const param = {
            pay_method : this.form.payment_method.split('_')[1],
            merchant_uid : results.iamport.merchant_uid,
            name : results.iamport.name,
            amount : results.iamport.amount,
            buyer_email : results.iamport.buyer_email,
            buyer_name : results.iamport.buyer_name,
            buyer_tel : results.iamport.buyer_tel,
            buyer_addr : results.iamport.buyer_addr,
            buyer_postcode : results.iamport.buyer_postcode,
            app_scheme : 'ionicinicis3'
          };
          
          // 아임포트 관리자 페이지 가입 후 발급된 가맹점 식별코드를 사용
          this.iamport.payment("imp78559751", param )
            .then((response)=> {
              console.log(response);
              if ( response.isSuccess() ) {
                 this.payloading.dismiss();
                  mdata.imp_uid = response.getResponse()['imp_uid'];
                  console.log(mdata);
                  this.service.checkPaymentResponse(mdata).then((payresults) => {
                    console.log(payresults);
                    var str = results.redirect;
                    var pos1 = str.lastIndexOf("order-received/");
                    var pos2 = str.lastIndexOf("?key=wc_order");
                    var pos3 = pos2 - (pos1 + 15);
                    var order_id = str.substr(pos1 + 15, pos3);
                    this.nav.push(OrderSummary, order_id).then(()=>{
                        const index = this.nav.getActive().index;
                        this.nav.remove(1, index-1); 
                    });
                  });
              }else{
                  this.payloading.dismiss();
                  this.functions.showAlert("실패", "주문이 실패하였습니다. 다시 시도해 주세요.")
              }
            })
            .catch((err)=> {
              this.payloading.dismiss();
              alert(err)
          });
      }
      else if (results.result == 'failure') {
          this.functions.showAlert("STATUS", results.messages);
          this.buttonSubmit = false;
      }
  }
  checkoutStripe() {
      this.buttonSubmit = true;
      this.PlaceOrder = "Placing Order";
      this.service.getStripeToken(this.form).then((results) => this.handleStripeToken(results));
  }
  handleStripeToken(results) {
      if (results.error) {
          this.buttonSubmit = false;
          this.PlaceOrder = "Place Order";
          this.functions.showAlert("ERROR", results.error.message);
      } else {
          this.service.stripePlaceOrder(this.form, results).then((results) => this.handleBilling(results));
          this.buttonSubmit = false;
      }
  }

  biterms(){
    this.nav.push(TermsPage);
  }

  handlePoint(results){
    if (results.result == "success") {
      var str = results.redirect;
      var pos1 = str.lastIndexOf("order-received/");
      var pos2 = str.lastIndexOf("?key=wc_order");
      var pos3 = pos2 - (pos1 + 15);
      var order_id = str.substr(pos1 + 15, pos3);
      this.payloading.dismiss();
      this.nav.push(OrderSummary, order_id);
    } else if (results.result == "failure") {
      this.functions.showAlert("ERROR", results.messages);
    }
    this.buttonSubmit = false;
    this.PlaceOrder = "Place Order";
  }

  handleBilling(results) {
      if (results.result == "success") {
          var str = results.redirect;
          var pos1 = str.lastIndexOf("order-received/");
          var pos2 = str.lastIndexOf("?key=wc_order");
          var pos3 = pos2 - (pos1 + 15);
          var order_id = str.substr(pos1 + 15, pos3);
          this.cmsService.receiveSmsAcount(this.form.billing_first_name, this.OrderReview.totals.total).subscribe(result => {
            this.payloading.dismiss();
            this.nav.push(OrderSummary, order_id);
          });
      } else if (results.result == "failure") {
          this.functions.showAlert("ERROR", results.messages);
      }
      this.buttonSubmit = false;
      this.PlaceOrder = "Place Order";
  }
  login() {
      if (this.validateForm()) {
          this.buttonSubmitLogin = true;
          this.loginData.checkout_login = this.form.checkout_login;
          this.LogIn = "Please Wait";
          this.service.login(this.loginData).then((results) => this.handleResults(results));
      }
  }
  validateForm() {
      if (this.loginData.username == undefined || this.loginData.username == "") {
          return false
      }
      if (this.loginData.password == undefined || this.loginData.password == "") {
          return false
      } else {
          return true
      }
  }
  handleResults(a) {
      this.buttonSubmitLogin = false;
      this.LogIn = "LogIn";
      //this.form.shipping = true;
      if (a.user_logged) {
          this.form = a;
          this.states = this.form.state[this.form.billing_country];
          this.values.isLoggedIn = a.user_logged;
          this.values.customerName = a.billing_first_name;
          this.values.customerId = a.user_id;
          this.values.logoutUrl = a.logout_url;
          this.showAddress = true;
          this.enableLogin = false;
          this.enableShippingMethods = true;
          this.enablePaymentMethods = true;
          this.fillShippingForm();
          this.service.updateOrderReview(this.form).then((results) => this.handleOrderReviews(results));
      } else {
          this.functions.showAlert("Error", 'Login unsuccessful. try again');
      }
  }
  changePayment() {
      this.form.payment_instructions = this.form.payment[this.form.payment_method].description;
      this.buttonSubmit = false;
      this.buttonText = "Continue to " + this.form.payment[this.form.payment_method].method_title;
  }
  terms() {
      //this.nav.push(TermsCondition, this.form.terms_content);
  }

  ordererequal(){
      if(this.form.orderchk == true){
        this.form.shipping_last_name = this.form.billing_last_name;
        this.form.shipping_fitst_name = this.form.billing_first_name;
      }
      else{
        this.form.shipping_last_name = "";
        this.form.shipping_fitst_name = "";
      }
  }

  updateShipping(method) {
      this.form.shipping_method = method;
      this.chosen_shipping = method;
      this.service.updateShipping(method).then((results) => this.handleShipping(results));
  }
  handleShipping(results) {
      this.service.updateOrderReview(this.form).then((results) => this.handleOrderReviews(results));
  }
  updateOrderReview() {
      this.service.updateOrderReview(this.form).then((results) => this.handleOrderReviews(results));
  }
  showPassword() {
      this.showPasswordEnable = true;
  }
  hidePassword() {
      this.showPasswordEnable = false;
  }
  forgotten() {
      //this.nav.push(AccountForgotten);
  }
  continueAsGuest() {
      this.enableBillingAddress = true;
      this.enableLogin = false;
      this.viewCtrl.showBackButton(true);
  }
  showShippingForm() {
      if (this.validateBillingForm()) {
          if (this.form.shipping) {
              this.form.shipping_first_name = this.form.billing_first_name;
              this.form.shipping_last_name = this.form.billing_last_name;
              this.form.shipping_address_1 = this.form.billing_address_1;
              this.form.shipping_address_2 = this.form.billing_address_2;
              this.form.shipping_city = this.form.billing_city;
              this.form.shipping_country = this.form.billing_country;
              this.form.shipping_state = this.form.billing_state;
              this.form.shipping_postcode = this.form.billing_postcode;
              this.showAddress = true;
              this.enableShippingMethods = true;
              this.enablePaymentMethods = true;
              this.enableBillingAddress = false;
              this.viewCtrl.showBackButton(true);
          } else if (!this.form.shipping) {
              if (this.values.isLoggedIn) {
                  this.showAddress = true;
              } else {
                  this.enableShippingForm = true;
                  this.viewCtrl.showBackButton(false);
              }
              this.enableBillingAddress = false;
          }
      }
  }
  showShippingMethods() {
      if (this.validateShippingForm()) {
          this.enableShippingForm = false;
          this.enableBillingAddress = false;
          this.showAddress = true;
          this.enableShippingMethods = true;
          this.enablePaymentMethods = true;
          this.viewCtrl.showBackButton(true);
      }
  }
  validateBillingForm() {
      if (this.form.billing_first_name == undefined || this.form.billing_first_name == "") {
          this.functions.showAlert("에러", "휴대폰 번호를 입력해 주세요");
          return false
      }
      return true
  }
  validateShippingForm() {
      if (this.form.shipping_first_name == undefined || this.form.shipping_first_name == "") {
          this.functions.showAlert("에러", "휴대폰 번호를 입력해 주세요");
          return false
      }
      else {
          return true
      }
  }
  editBillingForm() {
      this.enableBillingAddress = true;
      this.showAddress = false;
      this.enableShippingForm = false;
      this.enableShippingMethods = false;
      this.enablePaymentMethods = false;
      this.viewCtrl.showBackButton(false);
  }
  editShippingForm() {
      this.enableShippingForm = true;
      this.showAddress = false;
      this.enableBillingAddress = false;
      this.enableShippingMethods = false;
      this.enablePaymentMethods = false;
      this.viewCtrl.showBackButton(false);
  }
  backToBillingForm() {
      this.enableBillingAddress = true;
      this.enableShippingForm = false;
      this.viewCtrl.showBackButton(true);
  }
  backToAddressPage() {
      this.enableShippingForm = false;
      this.enableBillingAddress = false;
      this.showAddress = true;
      this.enableShippingMethods = true;
      this.enablePaymentMethods = true;
      this.viewCtrl.showBackButton(true);
  }
  validateAddress() {
      if (this.form.show_terms && !this.form.terms) {
          this.functions.showAlert("에러", "쇼핑 이용약관에 동의해야 합니다.");
          return false;
      }
      if (!this.values.isLoggedIn && !this.form.biterms){
          this.functions.showAlert("에러", "비회원 개인정보내역 수집에 동의하셔야 합니다.");
          return false;
      }
      if (this.form.billing_first_name == undefined || this.form.billing_first_name == "") {
          this.functions.showAlert("에러", "휴대폰 번호를 입력해 주세요");
          //return false            
      }
      if (this.form.billing_address_1 == undefined || this.form.billing_address_1 == "") {
          this.functions.showAlert("에러", "주소를 입력해 주세요");
          //return false
      }
      else {
          return true
      }
  }

  daumAddressOptions =  {
    class: ['btn', 'btn-primary'],
    type : 'layer',
    target : 'layer',
    debug : true
  };
  
  setDaumAddressApi(data){
    this.addrForm.patchValue({
        zip: data.zip,
        addr: data.addr
      });
      this.form.billing_postcode = data.zip;
      this.form.billing_address_1 = data.addr;
      //this.inputAddrDetail.nativeElement.setFocus();
    console.log(data);
  }

  callDaumAddress(){
    this.nav.push(AddressSearchFormPage, {
        data : true,
        callback : (data) => {
            return new Promise((resolve, reject) => {
                console.log(data);
                this.form.billing_postcode = data.zonecode;
                this.form.billing_address_1 = data.address;
                resolve();
            })
        }
    });
  }

  onChangeTime(){
      console.log('changed');
  }
  test(){
    this.form.billing_postcode = "test";
    this.form.billing_address_1 = "test";
  }

  ionViewWillEnter() {
      if (document.querySelector(".tabbar")) this.tabBarElement.display = 'none';
  }
}
