//  Created by react-native-create-bridge

import { NativeModules } from 'react-native'

const { FastSecp256k1Bridge } = NativeModules

export default {
  exampleMethod () {
    return FastSecp256k1Bridge.exampleMethod()
  },
  verifyMessage (data) {
  	//returns a promise
    return FastSecp256k1Bridge.verifyMessage(data)

  },

  keccak256(data){
  	return FastSecp256k1Bridge.keccak256(data);
  },

  ecrecover(hash,r,s,v){
  	return FastSecp256k1Bridge.ecrecover(hash,r,s,v);
  },

  ecsign(data,pk){
  	return FastSecp256k1Bridge.ecsign(data,pk);
  },





  EXAMPLE_CONSTANT: FastSecp256k1Bridge.EXAMPLE_CONSTANT
}
