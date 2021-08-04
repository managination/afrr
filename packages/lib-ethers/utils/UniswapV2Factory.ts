import assert from "assert";

import { Log } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import { Overrides } from "@ethersproject/contracts";

import { _LiquityContract, _TypedLiquityContract, _TypedLogDescription } from "../src/contracts";
import { log } from "./deploy";

const factoryAbi = [
  "function createPair(address tokenA, address tokenB) returns (address pair)",
  "event PairCreated(address indexed token0, address indexed token1, address pair, uint)"
];

const ewVoltaFactoryAddress = "0xD44463E5299dC807924Ff94B05aF53b3dF037301";
const ewMainnetFactoryAddress = "0x17854c8d5a41d5A89B275386E24B2F38FD0AfbDd";

// Added EWC Chain Ids:
const hasFactory = (chainId: number) => [1, 3, 4, 5, 42, 246, 73799].includes(chainId);
const getFactoryAddress = (chainId: number) =>
  chainId === 73799 ? ewVoltaFactoryAddress : ewMainnetFactoryAddress;

interface UniswapV2Factory
  extends _TypedLiquityContract<
    unknown,
    { createPair(tokenA: string, tokenB: string, _overrides?: Overrides): Promise<string> }
  > {
  extractEvents(
    logs: Log[],
    name: "PairCreated"
  ): _TypedLogDescription<{ token0: string; token1: string; pair: string }>[];
}

export const createUniswapV2Pair = async (
  signer: Signer,
  tokenA: string,
  tokenB: string,
  overrides?: Overrides
): Promise<string> => {
  const chainId = await signer.getChainId();

  if (!hasFactory(chainId)) {
    throw new Error(`UniswapV2Factory is not deployed on this network (chainId = ${chainId})`);
  }

  const factory = new _LiquityContract(
    getFactoryAddress(chainId),
    factoryAbi,
    signer
  ) as unknown as UniswapV2Factory;

  log(`Creating Uniswap v2 WETH <=> LUSD pair...`);

  const tx = await factory.createPair(tokenA, tokenB, { ...overrides });
  const receipt = await tx.wait();
  const pairCreatedEvents = factory.extractEvents(receipt.logs, "PairCreated");

  assert(pairCreatedEvents.length === 1);
  return pairCreatedEvents[0].args.pair;
};
