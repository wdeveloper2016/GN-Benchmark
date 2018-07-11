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

  getLatencies() {
    return new Promise(async (resolvePromise) => {
      const msg = [
        '0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1',
        '3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1',
      ];
      const ecprivkey = [
        Buffer.from('3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1', 'hex'),
        '3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1',
      ];

      let echash = ['', ''];
      let r = ['', ''];
      let s = ['', ''];
      let v = [27, 27];
      let result = ['', ''];

      const promiseFunc1 = () => (new Promise((resolve) => {
        echash[0] = ethUtils.keccak256(msg[0]);
        resolve();
      }));
      const promiseFunc2 = () => (new Promise((resolve) => {
        FastSecp256k1BridgeNativeModule.keccak256(msg[1]).then((hash) => {
          echash[1] = hash;
          resolve();
        });
      }));
      const promiseFunc3 = () => (new Promise((resolve) => {
        const sig = ethUtils.ecsign(echash[0], ecprivkey[0]);
        r[0] = sig.r;
        s[0] = sig.s;
        v[0] = sig.v;
        resolve();
      }));
      const promiseFunc4 = () => (new Promise((resolve) => {
        FastSecp256k1BridgeNativeModule.ecsign(echash[1], ecprivkey[1]).then(sig => {
          r[1] = sig.slice(0, 64);
          s[1] = sig.slice(64, 128);
          v[1] = 27 + parseInt(sig.slice(128, 130));
          resolve();
        });
      }));
      const promiseFunc5 = () => (new Promise((resolve) => {
        result[0] = ethUtils.ecrecover(echash[0], v[0], r[0], s[0]);
        resolve();
      }));
      const promiseFunc6 = () => (new Promise((resolve) => {
        FastSecp256k1BridgeNativeModule.ecrecover(echash[1], r[1], s[1], v[1]).then(pubkey => {
          result[1] = pubkey;
          resolve();
        });
      }));

      const promiseFunctions = [
        promiseFunc1,
        promiseFunc2,
        promiseFunc3,
        promiseFunc4,
        promiseFunc5,
        promiseFunc6,
      ];
      const latencies = [];
      for (let i = 0; i < promiseFunctions.length; i++) {
        const startTime = Date.now();
        for (let j = 0; j < NUM_TESTS; j++) {
          await promiseFunctions[i]();
        }
        const latency = Date.now() - startTime;
        latencies.push(latency);
      }

      resolvePromise(latencies);
    });
  }

  runTest = async () => {
    this.setState({ running: true });

    const latencies = await this.getLatencies();

    const { tableData } = this.state;
    this.setState({
      tableData: tableData.map((item, index) => ({
        ...item,
        latency: [
          latencies[index * 2],
          latencies[(index * 2) + 1]
        ],
      })),
      running: false,
    });
  }

  renderRow = ({ item }) => {
    const { title, latency } = item;
    const ethLatency = (latency.length > 0) ? `${latency[0]} ms` : '';
    const secpLatency = (latency.length > 1) ? `${latency[1]} ms` : '';

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
