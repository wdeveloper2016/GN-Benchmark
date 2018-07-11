//  Created by react-native-create-bridge

#import "FastSecp256k1Bridge.h"

// import RCTBridge
#if __has_include(<React/RCTBridge.h>)
#import <React/RCTBridge.h>
#import <secp256k1_lib/utility.h>

#elif __has_include(“RCTBridge.h”)
#import “RCTBridge.h”
#else
#import “React/RCTBridge.h” // Required when used as a Pod in a Swift project
#endif

// import RCTEventDispatcher
#if __has_include(<React/RCTEventDispatcher.h>)
#import <React/RCTEventDispatcher.h>
#elif __has_include(“RCTEventDispatcher.h”)
#import “RCTEventDispatcher.h”
#else
#import “React/RCTEventDispatcher.h” // Required when used as a Pod in a Swift project
#endif

@implementation FastSecp256k1Bridge
@synthesize bridge = _bridge;

// Export a native module
// https://facebook.github.io/react-native/docs/native-modules-ios.html
RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

// Export constants
// https://facebook.github.io/react-native/releases/next/docs/native-modules-ios.html#exporting-constants
- (NSDictionary *)constantsToExport
{
  return @{
           @"EXAMPLE": @"example"
         };
}
//* RCT_EXPORT_METHOD(doSomething:(NSString *)aString
//                    *                   withA:(NSInteger)a
//                    *                   andB:(NSInteger)b)
RCT_REMAP_METHOD(verifyMessage,
                 data:(NSString*)data
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject){

  [[Utility instance] testSignatureVerification2];
  resolve(data);

  // } else {
  //   reject(@"get_error", @"Error getting system volume", nil);
  // }
}


RCT_REMAP_METHOD(keccak256,
                 hexData:(NSString*)hexData
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject){
  @try{
    NSString* hashedData = [[Utility instance] keccak256: hexData];
    resolve(hashedData);
  }@catch(NSException * e){
    reject(@"get_error", e.name,nil);
  }
}

RCT_REMAP_METHOD(ecsign,
                  ecsign: (NSString*)hexData
                  key: (NSString*) key
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject){
  @try{
    NSString* hashedData = [[Utility instance] ecsign:hexData withKey:key];
    resolve(hashedData);
  }@catch(NSException * e){
    reject(@"get_error", e.name,nil);
  }
}

RCT_REMAP_METHOD(ecrecover,
                  ecrecover: (NSString*)hexData
                  r: (NSString*) r
                  s: (NSString*) s
                  v: (int) v
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject){
  @try{
    NSString* address = [[Utility instance] ecrecover:hexData withR:r withS:s withV:v];
    resolve(address);
  }@catch(NSException * e){
    reject(@"get_error", e.name,nil);
  }
}

// Export methods to a native module
// https://facebook.github.io/react-native/docs/native-modules-ios.html
RCT_EXPORT_METHOD(exampleMethod)
{
  Utility * util = [Utility instance];
  [util testSignatureVerification2];
  [self emitMessageToRN:@"SampleEvent" :nil];
}

// List all your events here
// https://facebook.github.io/react-native/releases/next/docs/native-modules-ios.html#sending-events-to-javascript
- (NSArray<NSString *> *)supportedEvents
{
  return @[@"SampleEvent"];
}

#pragma mark - Private methods

// Implement methods that you want to export to the native module
- (void) emitMessageToRN: (NSString *)eventName :(NSDictionary *)params {
  // The bridge eventDispatcher is used to send events from native to JS env
  // No documentation yet on DeviceEventEmitter: https://github.com/facebook/react-native/issues/2819
  [self sendEventWithName: eventName body: params];
}

@end
