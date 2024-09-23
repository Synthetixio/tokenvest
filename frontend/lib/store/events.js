import { atom, selector, selectorFamily } from "recoil";
import { subgraphQuery } from "../../utils/subgraph";

/**** STATE ****/

export const eventsState = atom({
  key: "eventsState",
  default: {},
});

export const getEvents = selector({
  key: "getEvents",
  get: ({ get }) => {
    return Object.values(get(eventsState));
  },
  set:
    () =>
    ({ get, set }, newValue) => {
      set(eventsState, Object.assign({}, get(eventsState), newValue));
    },
});

export const getEventsByTokenId = selectorFamily({
  key: "getEventsByTokenId",
  get:
    (tokenId) =>
    ({ get }) => {
      return Object.values(get(eventsState)).filter(
        (e) => e.tokenId == tokenId
      );
    },
  set:
    () =>
    ({ get, set }, newValue) => {
      set(eventsState, Object.assign({}, get(eventsState), newValue));
    },
});

/**** ACTIONS ****/

export const fetchEvents = async () => {
  let newEvents = [];
  const { data: redemptions } = await subgraphQuery(`
    {
    redemptions(first: 1000){
    id,
    tokenId
    redeemerAddress
    blockNumber
    blockTimestamp
    transactionHash
    amount
    }
    }`);

  const { data: grantCreated } = await subgraphQuery(`
    {
    grantCreateds(first: 1000){
    id,
    tokenId
    blockNumber
    blockTimestamp
    transactionHash
    }
    }`);

  const { data: grantCancelled } = await subgraphQuery(`
    {
    grantCancelleds(first: 1000){
    id,
    tokenId
    blockNumber
    blockTimestamp
    transactionHash
    }
    }`);

  newEvents
    .concat(redemptions.redemptions.map((r) => ({ ...r, type: "Redemption" })))
    .concat(
      grantCreated.grantCreateds.map((r) => ({ ...r, type: "Grant Created" }))
    )
    .concat(
      grantCancelled.grantCancelleds.map((r) => ({
        ...r,
        type: "Grant Cancelled",
      }))
    );
  return newEvents;
};
