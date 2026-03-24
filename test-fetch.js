const { Networks, rpc, TransactionBuilder, BASE_FEE, Account, scValToNative } = require('@stellar/stellar-sdk');
const { Contract } = require('@stellar/stellar-sdk');

const CONTRACT_ADDRESS = 'CBKXC5OXHMMSX6L4AK4PJDRGGZNLAV2HGHEM3ADUX2JQT535J3OCBUM3';
const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

async function test() {
  const server = new rpc.Server(SOROBAN_RPC_URL, { allowHttp: false });
  const contract = new Contract(CONTRACT_ADDRESS);
  const account = new Account('GDEBVTOA3BOWI7PNO3SBTJDRB2W3SV4AEFRHXTHWZP7R76I2WAZRHO2X', '0');
  
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(contract.call('get_all_bounties'))
    .setTimeout(30).build();
    
  try {
    const result = await server.simulateTransaction(tx);
    if (!rpc.Api.isSimulationSuccess(result)) {
        console.error('Sim failed: ' + JSON.stringify(result));
        return;
    }
    
    const val = result.result.retval;
    console.log("Raw ScVal present:", !!val);
    const native = scValToNative(val);
    console.log("Native form:", JSON.stringify(native, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
