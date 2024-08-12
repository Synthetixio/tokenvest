import { useState, useEffect } from "react";
import { Spinner } from "@chakra-ui/react";
import Grants from "./Grants";
import TokenBalance from "./TokenBalance";
import RecentActivity from "../../shared/RecentActivity";
import { useRecoilState } from "recoil";
import { getGrants, fetchGrants } from "../../../lib/store/grants";
import { eventsState, fetchEvents } from "../../../lib/store/events";
import { useAccount } from "wagmi";

export default function AdminPanel() {
  const [_, setGrant] = useRecoilState(getGrants());
  const [__, setEvents] = useRecoilState(eventsState);
  const [loadingData, setLoadingData] = useState(true);
  const { chain } = useAccount();
  const networkId = chain.id || "10";

  useEffect(() => {
    if (!networkId) return;
    Promise.all([
      fetchEvents(setEvents, networkId),
      fetchGrants(setGrant, networkId),
    ])
      .catch((error) => console.error(error))
      .finally(() => {
        setLoadingData(false);
      });
  }, [networkId]);

  return loadingData ? (
    <Spinner d="block" mx="auto" my={6} />
  ) : (
    <>
      <Grants />
      <TokenBalance />
      <RecentActivity />
    </>
  );
}
