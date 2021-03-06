import { Config } from '../../../services/shopping-services/config';
import { Service } from '../../../services/shopping-services/service';
import { Functions } from '../../../services/shopping-services/functions';
import { Values } from '../../../services/shopping-services/values';
import { Component } from '@angular/core';
import { NavController, ToastController,LoadingController} from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import {AccountRegister} from '../register/register';
import {TabsPage} from '../../tabs/tabs';
import {AccountForgotten} from '../forgotten/forgotten';
import { Naver } from "ionic-plugin-naver";

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var KakaoTalk: any;

@Component({
  templateUrl: 'login.html',
})
export class AccountLogin {

    loginData: any;
    loadLogin: any;
    status: any;
    error: any;
    public disableSubmit: boolean = false;
    LogIn: any;
    errors: any;
    loginStatus: any;
    showPasswordEnable: boolean = false;
    facebookSpinner: boolean = false;
    googleSpinner: boolean = false;
    gres: any;
    payloading: any;

    constructor(public nav: NavController, public service: Service, public functions: Functions, public config: Config, public values: Values, public fb: Facebook, public toast :ToastController, public naver: Naver, public loadingCtrl:LoadingController) {
        this.loginData = [];
        this.LogIn = "LogIn";
        this.payloading = this.loadingCtrl.create();
    }
    login() {
        if (this.validateForm()) {
            this.disableSubmit = true;
            this.LogIn = "Logging In";
            this.service.login(this.loginData)
                .then((results) => this.handleResults(results));
        }
    }
    validateForm() {
        if (this.loginData.username == undefined || this.loginData.username == "") {
            return false
        }
        if (this.loginData.password == undefined || this.loginData.password == "") {
            return false
        }
        else {
            return true
        }
    }
    goregister(){
      let param = {
        token : 'test',
        sns : 'facebook'
      };
      this.facebookSpinner = false;
      this.nav.push(AccountRegister, param);
    }
    handleResults(results) {
        this.disableSubmit = false;
        this.LogIn = "LogIn";
        if (!results.errors && results.data) {
            this.functions.showAlert('로그인', '로그인하셨습니다.');
            if(this.values.cartLoadEnable){
                //this.nav.setRoot(CartPage);
            }
            else{
            this.nav.setRoot(TabsPage);
            }
        }
        else if (results.errors) {
            this.functions.showAlert('에러', '계정이나 비밀번호가 맞지 않습니다.');
        }
    }
    forgotten() {
        this.nav.push(AccountForgotten);
    }

  dismiss() {
    this.nav.pop();
  }

  showPassword(){
    this.showPasswordEnable = true; 
  }
  hidePassword(){
    this.showPasswordEnable = false; 
  }
  facebookLogin() {
       this.facebookSpinner = true;
        this.payloading.present();
       this.fb.login(['public_profile', 'email']).then((response) => {
            this.service.facebookLoginChk(response.authResponse.accessToken, response.authResponse.userID + "@facebook.com").then((results) =>{
                this.payloading.dismiss();
                if(results == 'need_register'){
                    let param = {
                        token : response.authResponse.accessToken,
                        result : response.authResponse.userID + "@facebook.com",
                        sns : 'facebook'
                    };
                    this.facebookSpinner = false;
                    this.nav.push(AccountRegister, param);
                }
                else{
                  this.service.load().then(results => {
                    this.nav.popAll();
                    this.functions.showAlert('성공', '로그인 되었습니다.');
                    this.service.getPoint();
                  });
                }
            });
        }).catch((error) => {
          this.payloading.dismiss();
            if(error.errorMessage == "Facebook error: User logged in as different Facebook user."){
              this.facebookSpinner = false;
              this.facebookLogin();
            }else{
              this.functions.showAlert('에러', '다시 로그인 해주세요.');
            }
        });
    }
    naverLogin(){
      this.payloading.present();
        this.naver.login()
        .then(
            response => {
                this.naver.requestMe().then(result =>{
                    this.service.naverLoginChk(response.accessToken, result).then(results => {
                      this.payloading.dismiss();
                        if(results == 'need_register'){
                            let param = {
                                token : response.accessToken,
                                result : result.response,
                                sns : 'naver'
                            };
                            this.facebookSpinner = false;
                            this.nav.push(AccountRegister, param);
                        }
                        else{
                            this.service.load().then(results => {
                              this.nav.popAll();
                              this.functions.showAlert('성공', '로그인 되었습니다.');
                              this.service.getPoint();
                            });
                        }
                    });
                });
            }) // 성공
        .catch(
            error => {
                this.payloading.dismiss();
                console.error(error);
            }
        ); 
    }
    kakaoLogin(){
      this.payloading.present();
        this.doKakaoLogin().then((userid) => {
            this.doKakaoAccess().then((usertoken) =>{
                this.service.kakaoLoginChk(usertoken, userid + '@kakao.com').then(result => {
                  this.payloading.dismiss();
                    if(result == 'need_register'){
                        let param = {
                            token : usertoken,
                            result : userid + '@kakao.com',
                            sns : 'kakao'
                        };
                        this.facebookSpinner = false;
                        this.nav.push(AccountRegister, param);
                    }
                    else{
                        this.service.load().then(results => {
                          this.nav.popAll();
                          this.functions.showAlert('성공', '로그인 되었습니다.');
                          this.service.getPoint();
                        });
                    }
                });
            });
        }).catch(
            error => {
                this.payloading.dismiss();
                this.functions.showAlert('에러','다시 로그인 해 주세요');
            }
        );
    }


    doKakaoLogin(){
        return new Promise((resolve, reject) => {
            KakaoTalk.login(
                userProfile =>{
                    resolve(userProfile.id);
                },
                err => {
                    reject(err);
                }
            )
        });
    }

    doKakaoAccess(){
        return new Promise((resolve, reject) => {
            KakaoTalk.getAccessToken(
                accessToken =>{
                    resolve(accessToken);
                },
                err => {
                    reject(err);
                }
            );
        });
    }
 
    signup(){
        this.nav.push(AccountRegister);
    }

    presentToast(msg) {
        let toast = this.toast.create({
          message: msg,
          duration: 3000,
          position: 'bottom'
        });
      
        toast.onDidDismiss(() => {
          console.log('Dismissed toast');
        });
      
        toast.present();
      }


}
