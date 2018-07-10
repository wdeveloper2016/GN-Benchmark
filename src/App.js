import React from 'react';
import {
  View,
  Button,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import '../global';
import ethUtils from 'ethereumjs-util';

import FastSecp256k1BridgeNativeModule from './lib/FastSecp256k1BridgeNativeModule';

const FUNC_HASH = 'hash';
const FUNC_SIGN = 'sign';
const FUNC_VERIFY = 'verify';
const NUM_TESTS = 1000;

const FONTSIZE = 12;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [
        {
          title: 'Hash generating',
          latency: [],
        },
        {
          title: 'Signing a message',
          latency: [],
        },
        {
          title: 'Verifying a message',
          latency: [],
        },
      ],
      running: false,
    }
  }

  getLatency(func) {
    return new Promise(async (resolvePromise) => {
      const echash = '82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28';
      const ecprivkey = '3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1';
      const msg = '3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1';

      let promiseEth = null;
      let promiseSecp = null;
      if (func === FUNC_HASH) {
        promiseEth = new Promise((resolve) => {
          ethUtils.keccak256(msg);
          resolve();
        });
        promiseSecp = FastSecp256k1BridgeNativeModule.keccak256(msg);
      } else if (func === FUNC_SIGN) {
        promiseEth = new Promise((resolve) => {
          ethUtils.ecsign(Buffer.from(echash, 'hex'), Buffer.from(ecprivkey, 'hex'));
          resolve();
        });
        promiseSecp = FastSecp256k1BridgeNativeModule.ecsign(echash, ecprivkey);
      } else if (func === FUNC_VERIFY) {
        const r = '99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9';
        const s = '129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66';
        promiseEth = new Promise((resolve) => {
          ethUtils.ecrecover(Buffer.from(echash, 'hex'), 27, Buffer.from(r, 'hex'), Buffer.from(s, 'hex'));
          resolve();
        });
        promiseSecp = FastSecp256k1BridgeNativeModule.ecrecover(echash, r, s, 27);
      }

      let latencyEth, latencySecp;
      let startTime;

      startTime = Date.now();
      for (let i = 0; i < NUM_TESTS; i ++) {
        await promiseEth;
      }
      latencyEth = Date.now() - startTime;

      startTime = Date.now();
      for (let i = 0; i < NUM_TESTS; i ++) {
        await promiseSecp;
      }
      latencySecp = Date.now() - startTime;

      resolvePromise([latencyEth, latencySecp]);
    });
  }

  runTest = async () => {
    this.setState({ running: true });

    const latency = [
      await this.getLatency(FUNC_HASH),
      await this.getLatency(FUNC_SIGN),
      await this.getLatency(FUNC_VERIFY),
    ];

    const { tableData } = this.state;
    this.setState({
      tableData: tableData.map((item, index) => ({
        ...item,
        latency: latency[index]
      })),
      running: false,
    });
  }

  renderRow = ({ item }) => {
    const { title, latency } = item;
    const ethLatency = (latency.length > 0) ? latency[0] : '';
    const secpLatency = (latency.length > 1) ? latency[1] : '';

    const rowStyle = {
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      borderColor: 'gray',
      borderBottomWidth: 0.5,
    };
    const functionTextStyle = {
      flex: 3,
      fontSize: FONTSIZE,
    };
    const latencyTextStyle = {
      flex: 2,
      fontSize: FONTSIZE,
    };

    return (
      <View style={rowStyle}>
        <Text style={functionTextStyle}>{title}</Text>
        <Text style={latencyTextStyle}>{ethLatency}</Text>
        <Text style={latencyTextStyle}>{secpLatency}</Text>
      </View>
    );
  }

  renderHeader = () => {
    const headerStyle = {
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: 'gray',
      borderBottomWidth: 0.5,
    };
    const libTextStyle = {
      flex: 2,
      fontSize: FONTSIZE,
    };

    return (
      <View style={headerStyle}>
        <Text style={{ flex: 3 }} />
        <Text style={libTextStyle}>Ethereum Util</Text>
        <Text style={libTextStyle}>Fast Secp256k</Text>
      </View>
    );
  }

  render() {
    const { tableData, running } = this.state;

    return (
      <View style={styles.container}>
        <FlatList
          renderItem={this.renderRow}
          ListHeaderComponent={this.renderHeader}
          data={tableData}
          keyExtractor={item => item.title}
        />
        <Button
          title="Run Test"
          disabled={running}
          onPress={this.runTest}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 60,
    backgroundColor: '#F5FCFF',
  },
});
