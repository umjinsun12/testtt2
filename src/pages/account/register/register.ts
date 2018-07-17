import { TermsUsePage } from './../terms-use/terms-use';
import { Component } from '@angular/core';
import { Platform, NavController, AlertController, NavParams } from 'ionic-angular';
import { Service } from '../../../services/shopping-services/service';
import { Functions } from '../../../services/shopping-services/functions';
import { Values } from '../../../services/shopping-services/values';
import { OneSignal } from '@ionic-native/onesignal';
import { TabsPage } from '../../tabs/tabs';
import { TermsPage } from '../terms/terms';
//import { Post } from '../../post/post';
//import { Facebook } from '@ionic-native/facebook';
//import { GooglePlus } from '@ionic-native/google-plus';

@Component({
    templateUrl: 'register.html'
})
export class AccountRegister {
    registerData: any;
    loadRegister: any;
    countries: any;
    status: any;
    public disableSubmit: boolean = false;
    errors: any;
    loginStatus: any;
    country: any;
    billing_states: any;
    shipping_states: any;
    Register: any;
    lattitude: any;
    longitude: any;
    locationAddress: any;
    showPasswordEnable: boolean = false;
    facebookSpinner: boolean = false;
    googleSpinner: boolean = false;
    gres: any;
    error: any;
    termsChk : boolean = false;
    termsInfoChk : boolean = false;
    nameChk : boolean = false;
    token : any;
    sns : any;
    response_data : any;


    constructor(public nav: NavController, public service: Service, public platform: Platform,params: NavParams, public functions: Functions, private oneSignal: OneSignal, public values: Values, public alertCtrl: AlertController) {
        this.Register = "Register";
        this.registerData = {};
        this.countries = {};
        this.registerData.billing = {};
        this.registerData.shipping = {};
        this.token = params.data.token;
        this.sns = params.data.sns;
        this.response_data = params.data.result;
        
        this.service.getNonce()
            .then((results) => this.handleResults(results));
    }
    handleResults(results) {
        this.countries = results;
    }
    getBillingRegion(countryId) {
        this.registerData.billing_state = "";
        this.billing_states = this.countries.state[countryId];
    }
    getShippingRegion(countryId) {
        this.shipping_states = this.countries.state[countryId];
    }
    validateForm() {
        if (this.registerData.display_name == undefined || this.registerData.disply_name == "") {
            this.functions.showAlert("에러", "닉네임을 입력해 주세요");
            return false
        }
        if (this.registerData.phone1 == undefined || this.registerData.phone1 == "" || this.registerData.phone2 == undefined || this.registerData.phone2 == "" || this.registerData.phone3 == undefined || this.registerData.phone3 == "" ) {
            this.functions.showAlert("에러", "휴대폰 번호를 입력해 주세요");
            return false
        }
        if (this.termsChk == false || this.termsInfoChk == false) {
            this.functions.showAlert("에러", "약관에 동의하셔야 다음단계로 진행됩니다.");
            return false
        }
        if (this.nameChk == false) {
            this.functions.showAlert("에러", "닉네임 중복확인을 해주세요.");
            return false
        }

        return true;
    }
    registerCustomer() {
        if (this.validateForm()) {
            let phonenum = this.registerData.phone1 + "-" + this.registerData.phone2 + "-" + this.registerData.phone3;
            let alert = this.alertCtrl.create({
                title: '휴대폰 번호 확인',
                message: phonenum + ' 번호가 확실한가요?',
                buttons: [
                  {
                    text: '취소',
                    role: 'cancel',
                    handler: () => {
                      console.log('Cancel clicked');
                    }
                  },
                  {
                    text: '확인',
                    handler: () => {
                        this.disableSubmit = true;
                        this.Register = "등록중";
                        this.service.registerSnsCustomer(this.token,this.response_data, this.sns, phonenum, this.registerData.display_name).then(results =>{
                            console.log(results);
                            this.functions.showAlert('성공','회원가입 성공');
                            this.nav.popAll();
                        });
                    }
                  }
                ]
              });
              alert.present();
        }
    }
    handleRegister(results) {
        this.disableSubmit = false;
        this.Register = "Register";
        if (results.code) {
            this.errors = results;
        } else if (!results.code) {
            this.countries.checkout_login;
            this.service.login(this.registerData).then((results) => this.loginStatus = results);
            if (this.platform.is('cordova')) {
                this.oneSignal.sendTags({
                    email: this.registerData.email,
                    pincode: this.registerData.billing_address.postcode,
                    city: this.registerData.billing_address.city
                });
            }
            this.functions.showAlert("Success", "Registration successfull..");
            this.nav.setRoot(TabsPage);
        }
    }
    showPassword() {
        this.showPasswordEnable = true;
    }
    hidePassword() {
        this.showPasswordEnable = false;
    }
    dismiss() {
        this.nav.pop();
    }

    nickChange(){
        this.nameChk = false;
    }

    nickChk(){
        if(this.registerData.display_name == undefined ){
            this.functions.showAlert('경고', '닉네임을 입력해주세요');
        }
        else{
            this.service.nicknameChk(this.registerData.display_name).then(results =>{
                console.log(results);
                if(results){
                    this.functions.showAlert('알림', '이미 사용중인 닉네임입니다.');
                }else{
                    this.functions.showAlert('알림', '사용하셔도 되는 닉네임입니다.');
                    this.nameChk = true;
                }
            });
        }
    }
   /* facebookLogin() {
        this.facebookSpinner = true;
        this.fb.login(['email']).then((response) => {
            console.log(response.authResponse.accessToken);
            this.service.sendToken(response.authResponse.accessToken).then((results) => {
                this.facebookSpinner = false;
                this.nav.setRoot(TabsPage);
                this.functions.showAlert('success', 'Logged in sus');
            });
        }).catch((error) => {
            console.log(error)
            this.facebookSpinner = false;
            this.functions.showAlert('Error', error);
        });
    }
    gmailLogin() {
        this.googleSpinner = true;
        this.googlePlus.login({}).then((res) => {
            console.log(this.gres);
            this.googleSpinner = false;
            this.service.googleLogin(res).then((results) => {
                this.functions.showAlert('success', 'Logged in success');
                this.nav.setRoot(TabsPage);
            });
        }).catch((err) => {
            this.googleSpinner = false;
            this.error = err;
            this.functions.showAlert('Error', err);
            console.error(err);
        });
    }*/
    terms() {
        //this.nav.push(Post, id);
        this.nav.push(TermsPage);
    }
    termsUse(){
        this.nav.push(TermsUsePage);
    }
}